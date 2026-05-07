// ============================================================
//  Sistema de Tickets — app.js
// ============================================================

// ── Reloj en tiempo real ───────────────────────────────────
function updateClock() {
  const now = new Date();
  const h = String(now.getHours()).padStart(2, '0');
  const m = String(now.getMinutes()).padStart(2, '0');
  const s = String(now.getSeconds()).padStart(2, '0');

  const clockEl = document.getElementById('clock');
  if (clockEl) clockEl.textContent = `${h}:${m}:${s}`;

  const days   = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
  const months = ['enero','febrero','marzo','abril','mayo','junio','julio',
                  'agosto','septiembre','octubre','noviembre','diciembre'];

  const dateEl = document.getElementById('date');
  if (dateEl) dateEl.textContent =
    `${days[now.getDay()]}, ${now.getDate()} de ${months[now.getMonth()]}`;
}

updateClock();
setInterval(updateClock, 1000);

// ── Botón tema claro/oscuro ────────────────────────────────
const themeBtn = document.getElementById('themeBtn');
if (themeBtn) {
  themeBtn.addEventListener('click', () => {
    document.body.classList.toggle('dark');
    themeBtn.textContent = document.body.classList.contains('dark') ? 'oscuro' : 'claro';

  });
}
