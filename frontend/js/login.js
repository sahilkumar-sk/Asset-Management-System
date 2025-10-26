// POST /login with keys: Email, password
const emailInput = document.getElementById('email');
const rememberBox = document.getElementById('remember');
const savedEmail = localStorage.getItem('ams_email');
if (savedEmail) { emailInput.value = savedEmail; rememberBox.checked = true; }

document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();

  const Email = emailInput.value.trim();
  const password = document.getElementById('pass').value;

  if (!Email || !password){
    Swal.fire('Missing info', 'Please enter email and password.', 'warning');
    return;
  }

  try {
    const res = await fetch('http://localhost:8000/login', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ Email, password })
    });
    const json = await res.json();

    if (json.status === 'success') {
      if (rememberBox.checked) localStorage.setItem('ams_email', Email);
      else localStorage.removeItem('ams_email');

      await Swal.fire('Welcome', json.message || 'Login successful!', 'success');
      // Replace below with your real dashboard URL
      window.location.href = 'dashboard.html';
    } else {
      Swal.fire('Login failed', json.message || 'Invalid email or password.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Network error', 'Could not reach the server at http://localhost:8000.', 'error');
  }
});
