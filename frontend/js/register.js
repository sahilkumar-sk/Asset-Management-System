// register.js — send exactly what the backend expects
document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('registerForm');
  const submitBtn = form.querySelector('button[type="submit"]');
  const err = (m)=> Swal.fire('Validation', m, 'info');
  const busy = (on)=> { submitBtn.disabled = on; submitBtn.textContent = on ? 'Creating…' : 'Get Started'; };

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const fd = new FormData(form);
    const FirstName   = (fd.get('FirstName')   || '').trim();
    const LastName    = (fd.get('LastName')    || '').trim();
    const Email       = (fd.get('Email')       || '').trim();
    const number      = (fd.get('number')      || '').trim();
    const new_password= (fd.get('new_password')|| '').trim();
    const re_password = (fd.get('re_password') || '').trim();

    // frontend validation (mirrors server rules)
    if (!FirstName || !LastName || !Email || !new_password || !re_password) {
      return err('Please fill all required fields.');
    }
    if (!/^\S+@\S+\.\S+$/.test(Email)) return err('Please enter a valid email address.');
    if (new_password.length < 6) return err('Password must be at least 6 characters.');
    if (new_password !== re_password) return err('Passwords do not match.');

    const payload = { FirstName, LastName, Email, number, new_password, re_password };

    try {
      busy(true);
      const res = await fetch(`${API}/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      const json = await res.json().catch(() => ({}));

      if (res.ok) {
        await Swal.fire('All set!', 'User registered successfully.', 'success');
        location.href = 'login.html';
      } else {
        Swal.fire('Error', json.message || 'Registration failed.', 'error');
      }
    } catch {
      Swal.fire('Network error', `Could not reach ${API}.`, 'error');
    } finally {
      busy(false);
    }
  });
});
