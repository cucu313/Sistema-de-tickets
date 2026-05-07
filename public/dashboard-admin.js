// ============================================================
//  dashboard-admin.js
// ============================================================

const API = 'http://localhost:3000/api';
let token = localStorage.getItem('token');
let user  = JSON.parse(localStorage.getItem('user') || '{}');

// Verificar sesión
if (!token || user.role !== 'admin') {
  window.location.href = 'login-soporte.html';
}

document.addEventListener('DOMContentLoaded', () => {
  loadAll();
});

async function loadAll() {
  await Promise.all([loadPending(), loadSupport(), loadSuspended()]);
}

// ── Cargar pendientes ──────────────────────────────────────
async function loadPending() {
  try {
    const res  = await fetch(`${API}/admin/pending`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('pending-list');

    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:1rem;">Sin solicitudes pendientes.</td></tr>';
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
  } catch (err) {
    console.error('Error cargando pendientes:', err);
  }
}

// ── Cargar empleados de soporte activos ────────────────────
async function loadSupport() {
  try {
    const res  = await fetch(`${API}/admin/support`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('support-list');

    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:1rem;">Sin empleados de soporte.</td></tr>';
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
  } catch (err) {
    console.error('Error cargando soporte:', err);
  }
}

// ── Cargar empleados en suspenso ───────────────────────────
async function loadSuspended() {
  try {
    const res  = await fetch(`${API}/admin/suspended`, {
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    const tbody = document.getElementById('suspended-list');

    if (!data.users.length) {
      tbody.innerHTML = '<tr><td colspan="4" style="color:#94a3b8;text-align:center;padding:1rem;">Sin empleados en suspenso.</td></tr>';
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
  } catch (err) {
    console.error('Error cargando suspendidos:', err);
  }
}

// ── Acciones ───────────────────────────────────────────────
async function aprobar(id) {
  await cambiarRol(id, 'approve', '✅ Empleado aprobado como soporte.');
}

async function rechazar(id) {
  await cambiarRol(id, 'reject', '✅ Solicitud rechazada. Quedó como cliente.');
}

async function deshabilitar(id) {
  await cambiarRolDirecto(id, 'suspended', '⏸️ Empleado deshabilitado.');
}

async function habilitar(id) {
  await cambiarRolDirecto(id, 'support', '✅ Empleado habilitado nuevamente.');
}

async function despedir(id) {
  if (!confirm('¿Estás seguro que querés despedir a este empleado?')) return;
  await cambiarRolDirecto(id, 'user', '🚫 Empleado despedido. Quedó como cliente.');
}

async function cambiarRol(id, action, successMsg) {
  try {
    const res  = await fetch(`${API}/admin/${action}/${id}`, {
      method: 'PATCH',
      headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    mostrarMsg(res.ok ? 'success' : 'error', res.ok ? successMsg : data.message);
    if (res.ok) loadAll();
  } catch (err) {
    mostrarMsg('error', 'X Error al conectar con el servidor.');
  }
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
  } catch (err) {
    mostrarMsg('error', 'X Error al conectar con el servidor.');
  }
}

function mostrarMsg(type, text) {
  const el = document.getElementById('admin-msg');
  el.className = `msg ${type}`;
  el.textContent = text;
  setTimeout(() => { el.className = 'msg'; }, 4000);
}
