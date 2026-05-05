// ============================================================
//  login-cliente.js
// ============================================================

const API = 'http://localhost:3000/api';

async function register() {
  const name            = document.getElementById('reg-name').value.trim();
  const apellido        = document.getElementById('reg-apellido').value.trim();
  const dni             = document.getElementById('reg-dni').value.trim();
  const email           = document.getElementById('reg-email').value.trim();
  const password        = document.getElementById('reg-password').value;
  const confirmPassword = document.getElementById('reg-confirm').value;
  const msgEl           = document.getElementById('reg-msg');

  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apellido, dni, email, password, confirmPassword }),
    });
    const data = await res.json();

    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = '"SUCCESS" ' + data.message + '. Ya podés iniciar sesión.';
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '"ERROR" ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '"ERROR" Error al conectar con el servidor.';
  }
}

async function login() {
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
      localStorage.setItem('token', data.token);
      localStorage.setItem('user', JSON.stringify(data.user));
      msgEl.className = 'msg success';
      msgEl.textContent = '"SUCCESS" Login exitoso. Redirigiendo...';
      setTimeout(() => {
        window.location.href = 'dashboard-user.html';
      }, 1000);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '"ERROR" ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '"ERROR" Error al conectar con el servidor.';
  }
}
