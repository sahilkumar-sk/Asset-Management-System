// login.js — sets session and goes to dashboard
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('loginForm');
  const emailInput = document.getElementById('email');
  const passInput = document.getElementById('pass');
  const rememberBox = document.getElementById('remember');
  const submitBtn = form.querySelector('button[type="submit"]');

  const savedEmail = localStorage.getItem('ams_email');
  if (savedEmail) { emailInput.value = savedEmail; rememberBox.checked = true; }

  const busy = (on)=>{ submitBtn.disabled=on; submitBtn.textContent=on?'Signing in…':'Login'; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const Email = emailInput.value.trim();
    const password = passInput.value;
    if (!Email || !password) return Swal.fire('Missing info','Please enter email and password.','warning');

    try {
      busy(true);
      const res = await fetch(`${API}/login`, {
        method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({ Email, password })
      });
      const json = await res.json().catch(()=>({}));
      if (res.ok) {
        if (rememberBox.checked) localStorage.setItem('ams_email', Email); else localStorage.removeItem('ams_email');
        setAuth({ email: Email }); // <-- create session
        await Swal.fire('Welcome', json.message || 'Login successful!', 'success');
        location.href='dashboard.html';
      } else {
        Swal.fire('Login failed', json.message || 'Invalid email or password.', 'error');
      }
    } catch {
      Swal.fire('Network error', `Could not reach ${API}.`, 'error');
    } finally { busy(false); }
  });
});
