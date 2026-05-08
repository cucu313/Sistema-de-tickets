// ============================================================
//  login-cliente.js
// ============================================================

const API = 'http://localhost:3000/api';

async function register() {
  const name              = document.getElementById('reg-name').value.trim();
  const apellido          = document.getElementById('reg-apellido').value.trim();
  const dni               = document.getElementById('reg-dni').value.trim();
  const email             = document.getElementById('reg-email').value.trim();
  const password          = document.getElementById('reg-password').value;
  const confirmPassword   = document.getElementById('reg-confirm').value;
  const security_question = document.getElementById('reg-question').value;
  const security_answer   = document.getElementById('reg-answer').value.trim();
  const msgEl             = document.getElementById('reg-msg');

  msgEl.className = 'msg';

  try {
    const res  = await fetch(`${API}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, apellido, dni, email, password, confirmPassword, security_question, security_answer }),
    });
    const data = await res.json();

    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = '✔️ ' + data.message + '. Ya podés iniciar sesión.';
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
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
      msgEl.textContent = '✔️ Login exitoso. Redirigiendo...';
      setTimeout(() => {
        window.location.href = 'dashboard-user.html';
      }, 1000);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
  }
}

function abrirModalRecuperar() {
  document.getElementById('modalRecuperar').classList.add('active');
}

function cerrarModalRecuperar() {
  document.getElementById('modalRecuperar').classList.remove('active');
}

async function recuperarContrasena() {
  const dni             = document.getElementById('rec-dni').value.trim();
  const email           = document.getElementById('rec-email').value.trim();
  const security_answer = document.getElementById('rec-answer').value.trim().toLowerCase();
  const new_password    = document.getElementById('rec-password').value;
  const msgEl           = document.getElementById('rec-msg');

  msgEl.className = 'msg';

  if (!dni || !email || !security_answer || !new_password) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Completá todos los campos.';
    return;
  }

  try {
    const res  = await fetch(`${API}/auth/recover`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ dni, email, security_answer, new_password }),
    });
    const data = await res.json();

    if (res.ok) {
      msgEl.className = 'msg success';
      msgEl.textContent = '✔️ Contraseña cambiada. Ya podés iniciar sesión.';
      setTimeout(() => cerrarModalRecuperar(), 2000);
    } else {
      msgEl.className = 'msg error';
      msgEl.textContent = '❌ ' + data.message;
    }
  } catch (err) {
    msgEl.className = 'msg error';
    msgEl.textContent = '❌ Error al conectar con el servidor.';
  }
}