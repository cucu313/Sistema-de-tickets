// ============================================================
//  dashboard-support.js
// ============================================================

const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let user  = JSON.parse(localStorage.getItem('user') || '{}');
let selectedTicketId = null;
let selectedTicket   = null;
let socket = null;

// Verificar sesión
if (!token || user.role !== 'support') {
  window.location.href = 'login-soporte.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadTickets();
  initSocket();
});

// Cargar todos los tickets
async function loadTickets(status = '') {
  try {
    const url = status ? `${API}/tickets/all?status=${status}` : `${API}/tickets/all`;
    const res  = await fetch(url, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    renderTickets(data.tickets);
  } catch (err) {
    console.error('Error cargando tickets:', err);
  }
}

function filtrarTickets(status) {
  loadTickets(status);
}

function renderTickets(tickets) {
  const container = document.getElementById('tickets-list');
  if (!tickets.length) {
    container.innerHTML = '<p style="color:#94a3b8;font-size:0.9rem;">No hay tickets.</p>';
    return;
  }
  container.innerHTML = tickets.map(t => `
    <div class="ticket-row ${selectedTicketId == t.id ? 'active' : ''}" onclick="selectTicket(${t.id})">
      <span class="ticket-row-id">Ticket #${t.id}</span>
      <span class="ticket-row-title">${t.title}</span>
      <span style="color:#94a3b8;font-size:0.82rem;">👤 ${t.client_name}</span>
      <span class="ticket-row-status status-${t.status}">${translateStatus(t.status)}</span>
      <span class="ticket-row-priority">${translatePriority(t.priority)}</span>
    </div>
  `).join('');
}

function translateStatus(s) {
  return { pending: 'Pendiente', in_progress: 'En progreso', resolved: 'Resuelto', closed: 'Cerrado' }[s] || s;
}
function translatePriority(p) {
  return { high: '🔴 Alta', medium: '🟡 Media', low: '🟢 Baja' }[p] || p;
}

// Seleccionar ticket
async function selectTicket(id) {
  selectedTicketId = id;
  document.getElementById('ticket-num').textContent = id;

  // Cargar detalle del ticket
  try {
    const res  = await fetch(`${API}/tickets/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    selectedTicket = data.ticket;

    document.getElementById('ticket-client').textContent  = `${data.ticket.client_name}`;
    document.getElementById('ticket-problem').textContent = data.ticket.description.substring(0, 40) + '...';
    document.getElementById('ticket-date').textContent    = new Date(data.ticket.created_at).toLocaleDateString('es-AR');
    document.getElementById('ticket-status').value        = data.ticket.status;
    document.getElementById('ticket-priority').value      = data.ticket.priority;
  } catch (err) {
    console.error('Error cargando ticket:', err);
  }

  if (socket) socket.emit('join_ticket', id);
  loadMessages(id);
  loadTickets();
}

// Cargar mensajes
async function loadMessages(ticketId) {
  try {
    const res  = await fetch(`${API}/messages/${ticketId}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    renderMessages(data.messages);
  } catch (err) {
    console.error('Error cargando mensajes:', err);
  }
}

function renderMessages(messages) {
  const container = document.getElementById('messages-container');
  if (!messages.length) {
    container.innerHTML = '<div class="no-ticket-msg">No hay mensajes aún.</div>';
    return;
  }
  container.innerHTML = messages.map(m => `
    <div class="message-item ${m.user_id == user.id ? 'mine' : 'other'}">
      <div><strong>${m.user_name}:</strong> ${m.content}</div>
      <div class="message-time">${new Date(m.created_at).toLocaleString('es-AR')}</div>
    </div>
  `).join('');
  container.scrollTop = container.scrollHeight;
}

// Enviar ticket solución al cliente
async function enviarTicketCliente() {
  if (!selectedTicketId) {
    alert('Seleccioná un ticket primero.');
    return;
  }
  const status   = document.getElementById('ticket-status').value;
  const priority = document.getElementById('ticket-priority').value;
  const msgEl    = document.getElementById('ticket-msg');

  msgEl.className = 'msg';

  try {
    const res = await fetch(`${API}/tickets/${selectedTicketId}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ status, priority, assigned_to: user.id }),
    });
    const data = await res.json();

    if (res.ok) {
      // Enviar descripción de solución como mensaje
      const solution = document.getElementById('solution-desc').value.trim();
      if (solution) {
        await fetch(`${API}/messages/${selectedTicketId}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
          body: JSON.stringify({ content: `✅ SOLUCIÓN: ${solution}` }),
        });
        document.getElementById('solution-desc').value = '';
      }
      msgEl.className = 'msg success';
      msgEl.textContent = '✅ Ticket actualizado y enviado al cliente.';
      loadTickets();
      loadMessages(selectedTicketId);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
  }
}

// Enviar mensaje
async function enviarMensaje() {
  if (!selectedTicketId) { alert('Seleccioná un ticket primero.'); return; }
  const input   = document.getElementById('msg-input');
  const content = input.value.trim();
  if (!content) return;

  try {
    const res = await fetch(`${API}/messages/${selectedTicketId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ content }),
    });
    if (res.ok) {
      input.value = '';
      loadMessages(selectedTicketId);
    }
  } catch (err) {
    console.error('Error enviando mensaje:', err);
  }
}
function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('support');
  window.location.href = 'login-soporte.html';
}

document.getElementById('msg-input').addEventListener('keypress', (e) => {
  if (e.key === 'Enter') enviarMensaje();
});

// Guardar archivos
function guardarMensajes() {
  if (!selectedTicketId) { alert('Seleccioná un ticket primero.'); return; }
  const msgs = document.getElementById('messages-container').innerText;
  descargarTxt(msgs, `mensajes_ticket_${selectedTicketId}.txt`);
}

function guardarTicketRealizado() {
  if (!selectedTicketId || !selectedTicket) { alert('Seleccioná un ticket primero.'); return; }
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-AR');
  const hora  = ahora.toLocaleTimeString('es-AR');
  const content = 
`TICKET RESUELTO
===============================
Ticket #${selectedTicketId}
Título:     ${selectedTicket.title}
Categoría:  ${selectedTicket.category_name}
Prioridad:  ${translatePriority(selectedTicket.priority)}
Estado:     ${translateStatus(selectedTicket.status)}
-------------------------------
Cliente:    ${selectedTicket.client_name}
-------------------------------
Descripción del problema:
${selectedTicket.description}
===============================
Fecha: ${fecha}  Hora: ${hora}
`;
  descargarTxt(content, `ticket_${selectedTicketId}_resuelto.txt`);
}

function guardarTicketCliente() {
  if (!selectedTicketId || !selectedTicket) { alert('Seleccioná un ticket primero.'); return; }
  const ahora = new Date();
  const fecha = ahora.toLocaleDateString('es-AR');
  const hora  = ahora.toLocaleTimeString('es-AR');
  const content =
`TICKET DEL CLIENTE
===============================
Ticket #${selectedTicketId}
Título:     ${selectedTicket.title}
Categoría:  ${selectedTicket.category_name}
Prioridad:  ${translatePriority(selectedTicket.priority)}
Estado:     ${translateStatus(selectedTicket.status)}
-------------------------------
Cliente:    ${selectedTicket.client_name}
-------------------------------
Descripción del problema:
${selectedTicket.description}
===============================
Fecha: ${fecha}  Hora: ${hora}
`;
  descargarTxt(content, `ticket_${selectedTicketId}_cliente.txt`);
}

function descargarTxt(content, filename) {
  const blob = new Blob([content], { type: 'text/plain' });
  const a    = document.createElement('a');
  a.href     = URL.createObjectURL(blob);
  a.download = filename;
  a.click();
}

// Socket.io
function initSocket() {
  if (typeof io === 'undefined') return;
  socket = io('http://localhost:3000', { auth: { token } });
  socket.on('new_message', (msg) => {
    if (msg.ticket_id == selectedTicketId) loadMessages(selectedTicketId);
  });
}
