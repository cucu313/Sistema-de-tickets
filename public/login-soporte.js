// ============================================================
//  login-soporte.js
// ============================================================

const API = 'http://localhost:3000/api';

// Registro de empleado (queda como pending)
async function registerSoporte() {
  const name            = document.getElementById('reg-name').value.trim();
  const apellido        = document.getElementById('reg-apellido').value.trim();
  const dni             = document.getElementById('reg-dni').value.trim();
  const email           = document.getElementById('reg-email').value.trim();
  const password        = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm').value;
  const msgEl           = document.getElementById('reg-msg');

  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/auth/register-soporte`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apellido, dni, email, password, confirmPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = '"SUCCESS" ' + data.message;
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = 'X ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = 'X Error al conectar con el servidor.';
  }
}

// Login empleado de soporte
async function loginSoporte() {
  const identifier = document.getElementById('login-identifier').value.trim();
  const password   = document.getElementById('login-password').value;
  const msgEl      = document.getElementById('login-msg');

  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.user.role !== 'support') {
        msgEl.className = 'msg error';
        msgEl.textContent = 'X No tenés permisos de soporte técnico.';
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      msgEl.className = 'msg success';
      msgEl.textContent = '"SUCCESS Acceso concedido. Redirigiendo...';
      setTimeout(() => { window.location.href = 'dashboard-support.html'; }, 1000);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = 'X ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = 'X Error al conectar con el servidor.';
  }
}

// Login admin
async function loginAdmin() {
  const identifier = document.getElementById('admin-identifier').value.trim();
  const password   = document.getElementById('admin-password').value;
  const msgEl      = document.getElementById('admin-msg');

  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password }),
    });
    const data = await res.json();

    if (res.ok) {
      if (data.user.role !== 'admin') {
        msgEl.className = 'msg error';
        msgEl.textContent = 'X No tenés permisos de administrador.';
        return;
      }
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      msgEl.className = 'msg success';
      msgEl.textContent = '"SUCCESS" Bienvenido Admin. Redirigiendo...';
      setTimeout(() => { window.location.href = 'dashboard-admin.html'; }, 1000);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '"X" ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '"X" Error al conectar con el servidor.';
  }
}
