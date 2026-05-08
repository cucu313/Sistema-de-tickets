// ============================================================
//  dashboard-admin.js
// ============================================================

const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let user  = JSON.parse(localStorage.getItem('user') || '{}');

if (!token || user.role !== 'admin') {
  window.location.href = 'login-soporte.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadAll();
  loadHorario();
});

async function loadAll() {
  await Promise.all([
    loadPending(),
    loadSupport(),
    loadSuspended(),
    loadClients(),
    loadBanned(),
  ]);
}

// ── Empleados ──────────────────────────────────────────────
async function loadPending() {
  try {
    const res  = await fetch(`${API}/admin/pending`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const tbody = document.getElementById('pending-list');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1rem;color:#94a3b8;">Sin solicitudes pendientes.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.email}</td>
        <td>${u.name} ${u.apellido}</td>
        <td><button class="btn-approve" onclick="aprobar(${u.id})">Aprobar</button></td>
        <td><button class="btn-reject"  onclick="rechazar(${u.id})">Rechazar</button></td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

async function loadSupport() {
  try {
    const res  = await fetch(`${API}/admin/support`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const tbody = document.getElementById('support-list');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1rem;color:#94a3b8;">Sin empleados de soporte.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.email}</td>
        <td>${u.name} ${u.apellido}</td>
        <td><button class="btn-disable" onclick="deshabilitar(${u.id})">Deshabilitar</button></td>
        <td><button class="btn-fire"    onclick="despedir(${u.id})">Despedir</button></td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

async function loadSuspended() {
  try {
    const res  = await fetch(`${API}/admin/suspended`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const tbody = document.getElementById('suspended-list');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1rem;color:#94a3b8;">Sin empleados en suspenso.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.email}</td>
        <td>${u.name} ${u.apellido}</td>
        <td><button class="btn-enable" onclick="habilitar(${u.id})">Habilitar</button></td>
        <td><button class="btn-fire"   onclick="despedir(${u.id})">Despedir</button></td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

// ── Clientes ───────────────────────────────────────────────
async function loadClients() {
  try {
    const res  = await fetch(`${API}/admin/clients`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const tbody = document.getElementById('clients-list');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="text-align:center;padding:1rem;color:#94a3b8;">Sin clientes.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.dni}</td>
        <td>${u.name} ${u.apellido}</td>
        <td><button class="btn-reject" onclick="darDeBaja(${u.id})">－</button></td>
        <td><button class="btn-enable" onclick="verInfoCliente(${u.id})">ver +</button></td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

async function loadBanned() {
  try {
    const res  = await fetch(`${API}/admin/banned`, { headers: { 'Authorization': `Bearer ${token}` } });
    const data = await res.json();
    const tbody = document.getElementById('banned-list');
    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="5" style="text-align:center;padding:1rem;color:#94a3b8;">Sin clientes dados de baja.</td></tr>';
      return;
    }
    tbody.innerHTML = data.users.map(u => `
      <tr>
        <td>${u.dni}</td>
        <td>${u.name} ${u.apellido}</td>
        <td><button class="btn-fire"    onclick="eliminarCliente(${u.id})">✖</button></td>
        <td><button class="btn-approve" onclick="darDeAlta(${u.id})">＋</button></td>
        <td><button class="btn-enable"  onclick="verInfoCliente(${u.id})">ver +</button></td>
      </tr>
    `).join('');
  } catch (err) { console.error(err); }
}

// ── Acciones empleados ─────────────────────────────────────
async function aprobar(id)      { await cambiarRol(id, 'approve', '✔ Empleado aprobado.'); }
async function rechazar(id)     { await cambiarRol(id, 'reject',  '✔ Solicitud rechazada.'); }
async function deshabilitar(id) { await cambiarRolDirecto(id, 'suspended', '🧊 Empleado deshabilitado.'); }
async function habilitar(id)    { await cambiarRolDirecto(id, 'support',   '✔ Empleado habilitado.'); }
async function despedir(id) {
  if (!confirm('¿Estás seguro que querés despedir a este empleado?')) return;
  await cambiarRolDirecto(id, 'user', '📉 Empleado despedido.');
}

// ── Acciones clientes ──────────────────────────────────────
async function darDeBaja(id) {
  if (!confirm('¿Dar de baja a este cliente?')) return;
  await cambiarRolDirecto(id, 'banned', '📉 Cliente dado de baja.');
}
async function darDeAlta(id) {
  await cambiarRolDirecto(id, 'user', '✔ Cliente reactivado.');
}
async function eliminarCliente(id) {
  if (!confirm('¿Eliminar permanentemente este cliente? Esta acción no se puede deshacer.')) return;
  try {
    const res  = await fetch(`${API}/admin/user/${id}`, {
      method: 'DELETE',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    mostrarMsg(res.ok ? 'success' : 'error', res.ok ? '📃💥 Cliente eliminado.' : data.message);
    if (res.ok) loadAll();
  } catch (err) { mostrarMsg('error', '❗ Error al conectar.'); }
}

async function verInfoCliente(id) {
  try {
    const res  = await fetch(`${API}/admin/client-info/${id}`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const c    = data.user;
    document.getElementById('modal-cliente-info').innerHTML = `
      <p>👤 <strong>Nombre:</strong> ${c.name} ${c.apellido}</p>
      <p>🪪 <strong>DNI:</strong> ${c.dni}</p>
      <p>📧 <strong>Email:</strong> ${c.email}</p>
      <p>📞 <strong>Teléfono:</strong> ${c.telefono || 'No cargado'}</p>
      <p>🏠 <strong>Domicilio:</strong> ${c.domicilio || 'No cargado'}</p>
      <p>📅 <strong>Registrado:</strong> ${new Date(c.created_at).toLocaleDateString('es-AR')}</p>
    `;
    document.getElementById('modalInfoCliente').classList.add('active');
  } catch (err) { alert('Error al cargar información.'); }
}

function cerrarModalInfo() {
  document.getElementById('modalInfoCliente').classList.remove('active');
}

// ── Helpers ────────────────────────────────────────────────
async function cambiarRol(id, action, successMsg) {
  try {
    const res  = await fetch(`${API}/admin/${action}/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    mostrarMsg(res.ok ? 'success' : 'error', res.ok ? successMsg : data.message);
    if (res.ok) loadAll();
  } catch (err) { mostrarMsg('error', '❗ Error al conectar.'); }
}

async function cambiarRolDirecto(id, role, successMsg) {
  try {
    const res  = await fetch(`${API}/admin/role/${id}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ role })
    });
    const data = await res.json();
    mostrarMsg(res.ok ? 'success' : 'error', res.ok ? successMsg : data.message);
    if (res.ok) loadAll();
  } catch (err) { mostrarMsg('error', '❗ Error al conectar.'); }
}

function mostrarMsg(type, text) {
  const el = document.getElementById('admin-msg');
  el.className = `msg ${type}`;
  el.textContent = text;
  setTimeout(() => { el.className = 'msg'; }, 4000);
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  window.location.href = 'login-soporte.html';
}

async function loadHorario() {
  try {
    const res  = await fetch(`${API}/settings/horario`);
    const data = await res.json();
    const input = document.getElementById('horario-input');
    if (input) input.value = data.value || '';
  } catch (err) { console.error(err); }
}

async function guardarHorario() {
  const value = document.getElementById('horario-input').value.trim();
  const msgEl = document.getElementById('horario-msg');
  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/settings/horario`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ value }),
    });
    const data = await res.json();
    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = '✔ Horario actualizado correctamente.';
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❗ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❗ Error al conectar con el servidor.';
  }
}