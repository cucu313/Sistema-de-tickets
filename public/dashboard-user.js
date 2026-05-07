// ============================================================
//  dashboard-user.js
// ============================================================

const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let user  = JSON.parse(localStorage.getItem('user') || '{}');
let selectedTicketId   = null;
let selectedTicketData = null;
let socket = null;

// Verificar sesión
if (!token || user.role !== 'user') {
  window.location.href = 'login-cliente.html';
}

document.addEventListener('DOMContentLoaded', () => {
  setUserInfo();
  loadCategories();
  loadTickets();
  initSocket();
  document.getElementById('msg-input').addEventListener('keypress', (e) => {
    if (e.key === 'Enter') enviarMensaje();
  });
});

function setUserInfo() {
  const clientEl = document.getElementById('ticket-client');
  if (clientEl) clientEl.textContent = `${user.dni} - ${user.name} ${user.apellido}`;
  const dateEl = document.getElementById('ticket-date');
  if (dateEl) dateEl.textContent = new Date().toLocaleDateString('es-AR');
}

async function loadCategories() {
  try {
    const res  = await fetch(`${API}/tickets/categories`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const sel  = document.getElementById('ticket-category');
    data.categories.forEach(cat => {
      const opt = document.createElement('option');
      opt.value = cat.id;
      opt.textContent = cat.name;
      sel.appendChild(opt);
    });
  } catch (err) { console.error('Error cargando categorías:', err); }
}

async function loadTickets() {
  try {
    const res  = await fetch(`${API}/tickets`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    renderTickets(data.tickets);
  } catch (err) { console.error('Error cargando tickets:', err); }
}

function renderTickets(tickets) {
  const container = document.getElementById('tickets-list');
  if (!tickets.length) {
    container.innerHTML = '<p style="color:#94a3b8;font-size:0.9rem;">No tenés tickets aún.</p>';
    return;
  }
  container.innerHTML = tickets.map(t => `
    <div class="ticket-row ${selectedTicketId == t.id ? 'active' : ''}" onclick="selectTicket(${t.id})">
      <span class="ticket-row-id">Ticket #${t.id}</span>
      <span class="ticket-row-title">${t.title}</span>
      <span class="ticket-row-status status-${t.status}">${translateStatus(t.status)}</span>
      <span class="ticket-row-priority">${translatePriority(t.priority)}</span>
      ${t.status === 'closed' ? `<button class="btn-reject" onclick="event.stopPropagation(); eliminarTicket(${t.id})">🗑️ Eliminar</button>` : ''}
    </div>
  `).join('');
}
  
  container.innerHTML = tickets.map(t => `
    <div class="ticket-row ${selectedTicketId == t.id ? 'active' : ''}" onclick="selectTicket(${t.id})">
      <span class="ticket-row-id">Ticket #${t.id}</span>
      <span class="ticket-row-title">${t.title}</span>
      <span class="ticket-row-status status-${t.status}">${translateStatus(t.status)}</span>
      <span class="ticket-row-priority">${translatePriority(t.priority)}</span>
    </div>
  `).join('');

async function eliminarTicket(id) {
  if (!confirm('¿Estás seguro que querés eliminar este ticket?')) return;
  try {
    const res  = await fetch(`${API}/tickets/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    if (res.ok) {
      if (selectedTicketId == id) selectedTicketId = null;
      loadTickets();
    } else {
      alert('❌ ' + data.message);
    }
  } catch (err) {
    alert('❌ Error al conectar con el servidor.');
  }
}

function translateStatus(s) {
  return { pending: 'Pendiente', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' }[s] || s;
}
function translatePriority(p) {
  return { high: '🔴 Alta', medium: '🟡 Media', low: '🟢 Baja' }[p] || p;
}

async function selectTicket(id) {
  selectedTicketId = id;
  document.getElementById('ticket-num').textContent = id;

  // Cargar detalle completo del ticket
  try {
    const res  = await fetch(`${API}/tickets/${id}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    selectedTicketData = data.ticket;
  } catch (err) { console.error('Error cargando detalle ticket:', err); }

  if (socket) socket.emit('join_ticket', id);
  loadMessages(id);
  loadTickets();
}

async function loadMessages(ticketId) {
  try {
    const res  = await fetch(`${API}/messages/${ticketId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    renderMessages(data.messages);
  } catch (err) { console.error('Error cargando mensajes:', err); }
}

function renderMessages(messages) {
  const container = document.getElementById('messages-container');
  if (!messages.length) {
    container.innerHTML = '<div class="no-ticket-msg">No hay mensajes aún.</div>';
    return;
  }
  container.innerHTML = messages.map(m => `
    <div class="message-item ${m.user_id == user.id ? 'mine' : 'other'}">
      <div>${m.content}</div>
      <div class="message-time">${new Date(m.created_at).toLocaleString('es-AR')}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

async function enviarTicket() {
  const description = document.getElementById('ticket-desc').value.trim();
  const category_id = document.getElementById('ticket-category').value;
  const priority    = document.getElementById('ticket-priority').value;
  const msgEl       = document.getElementById('ticket-msg');
  msgEl.className   = 'msg';

  if (!description || !category_id) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Completá la descripción y seleccioná una categoría.';
    return;
  }
  try {
    const res  = await fetch(`${API}/tickets`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ title: description.substring(0, 60), description, category_id, priority }),
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = `✅ Ticket #${data.ticketId} enviado correctamente.`;
      document.getElementById('ticket-desc').value = '';
      document.getElementById('ticket-num').textContent = data.ticketId;
      selectedTicketId = data.ticketId;
      loadTickets();
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
  }
}

async function enviarMensaje() {
  if (!selectedTicketId) { alert('Primero seleccioná un ticket.'); return; }
  const input   = document.getElementById('msg-input');
  const content = input.value.trim();
  if (!content) return;
  try {
    const res = await fetch(`${API}/messages/${selectedTicketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    if (res.ok) { input.value = ''; loadMessages(selectedTicketId); }
  } catch (err) { console.error('Error enviando mensaje:', err); }
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login-cliente.html';
}

function abrirModalDatos() {
  document.getElementById('mod-name').value      = user.name      || '';
  document.getElementById('mod-apellido').value  = user.apellido  || '';
  document.getElementById('mod-telefono').value  = user.telefono  || '';
  document.getElementById('mod-domicilio').value = user.domicilio || '';
  document.getElementById('modalDatos').classList.add('active');
}

function cerrarModalDatos() {
  document.getElementById('modalDatos').classList.remove('active');
}

async function guardarDatos() {
  const name      = document.getElementById('mod-name').value.trim();
  const apellido  = document.getElementById('mod-apellido').value.trim();
  const telefono  = document.getElementById('mod-telefono').value.trim();
  const domicilio = document.getElementById('mod-domicilio').value.trim();
  const msgEl     = document.getElementById('mod-msg');
  msgEl.className = 'msg';
  try {
    const res  = await fetch(`${API}/auth/update`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ name, apellido, telefono, domicilio }),
    });
    const data = await res.json();
    if (res.ok) {
      user = { ...user, name, apellido, telefono, domicilio };
      localStorage.setItem('user', JSON.stringify(user));
      setUserInfo();
      msgEl.className = 'msg success';
      msgEl.textContent = '✅ Datos actualizados correctamente.';
      setTimeout(() => cerrarModalDatos(), 1500);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
  }
}

function guardarTicketRealizado() { guardarTicketComoImagen('realizado'); }
function guardarTicketSoporte()   { guardarTicketComoImagen('soporte'); }

async function guardarTicketComoImagen(tipo) {
  if (!selectedTicketId) { alert('Seleccioná un ticket primero.'); return; }

  // Cargar mensajes
  let mensajesSoporte = 'Sin respuesta aún';
  try {
    const res  = await fetch(`${API}/messages/${selectedTicketId}`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const msgs = data.messages.filter(m => m.user_id != user.id);
    if (msgs.length) mensajesSoporte = msgs.map(m => m.content).join(' | ');
  } catch (err) { /* silencioso */ }

  const t = selectedTicketData;
  const canvas = document.createElement('canvas');
  canvas.width  = 620;
  canvas.height = tipo === 'soporte' ? 420 : 360;
  const ctx = canvas.getContext('2d');

  // Fondo
  ctx.fillStyle = '#0d0d0d';
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Borde
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 3;
  ctx.strokeRect(10, 10, canvas.width - 20, canvas.height - 20);

  // Título
  ctx.fillStyle = '#f97316';
  ctx.font = 'bold 22px Arial';
  ctx.fillText(tipo === 'realizado' ? 'TICKET REALIZADO' : 'TICKET DE SOPORTE', 30, 52);

  // Línea
  ctx.strokeStyle = '#f97316';
  ctx.lineWidth = 1;
  ctx.beginPath(); ctx.moveTo(30, 65); ctx.lineTo(590, 65); ctx.stroke();

  // Datos
  ctx.fillStyle = '#ffffff';
  ctx.font = '15px Arial';
  let y = 92;
  ctx.fillText(`Ticket #: ${selectedTicketId}`, 30, y); y += 26;
  ctx.fillText(`Cliente:   ${user.name} ${user.apellido}`, 30, y); y += 26;
  ctx.fillText(`DNI:       ${user.dni}`, 30, y); y += 26;
  if (t) {
    ctx.fillText(`Estado:    ${translateStatus(t.status)}`, 30, y); y += 26;
    ctx.fillText(`Prioridad: ${translatePriority(t.priority).replace(/[🔴🟡🟢]/g, '').trim()}`, 30, y); y += 26;
    ctx.fillText(`Categoría: ${t.category_name || '—'}`, 30, y); y += 26;
  }
  const ahora = new Date();
  ctx.fillText(`Fecha:     ${ahora.toLocaleDateString('es-AR')}`, 30, y); y += 26;
  ctx.fillText(`Hora:      ${ahora.toLocaleTimeString('es-AR')}`, 30, y); y += 26;

  // Respuesta soporte
  if (tipo === 'soporte') {
    ctx.strokeStyle = '#f97316';
    ctx.beginPath(); ctx.moveTo(30, y + 5); ctx.lineTo(590, y + 5); ctx.stroke();
    y += 25;
    ctx.fillStyle = '#f97316';
    ctx.font = 'bold 14px Arial';
    ctx.fillText('Respuesta del soporte:', 30, y); y += 22;
    ctx.fillStyle = '#ffffff';
    ctx.font = '13px Arial';
    const palabras = mensajesSoporte.split(' ');
    let linea = '';
    for (const p of palabras) {
      const prueba = linea + p + ' ';
      if (ctx.measureText(prueba).width > 560 && linea !== '') {
        ctx.fillText(linea, 30, y); y += 20; linea = p + ' ';
        if (y > canvas.height - 30) break;
      } else { linea = prueba; }
    }
    if (linea) ctx.fillText(linea, 30, y);
  }

  // Pie
  ctx.fillStyle = '#f97316';
  ctx.font = 'italic 12px Arial';
  ctx.fillText('Sistema de Tickets — Documento generado automáticamente', 30, canvas.height - 18);

  const a = document.createElement('a');
  a.href = canvas.toDataURL('image/png');
  a.download = `ticket_${selectedTicketId}_${tipo}.png`;
  a.click();
}

function initSocket() {
  if (typeof io === 'undefined') return;
  socket = io('http://localhost:3000', { auth: { token } });
  socket.on('new_message', (msg) => {
    if (msg.ticket_id == selectedTicketId) loadMessages(selectedTicketId);
  });
}