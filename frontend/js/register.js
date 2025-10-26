// POST /register with keys: FirstName, LastName, Email, number, new_password, re_password
const form = document.getElementById('registerForm');

function readForm(el){
  const fd = new FormData(el);
  return Object.fromEntries(fd.entries());
}

form.addEventListener('submit', async (e) => {
  e.preventDefault();
  const data = readForm(form);

  if (!data.FirstName || !data.LastName || !data.Email || !data.new_password || !data.re_password) {
    Swal.fire('Missing info', 'Please fill in all required fields.', 'warning');
    return;
  }
  if (data.new_password !== data.re_password) {
    Swal.fire('Password mismatch', 'New Password and Re-enter Password must match.', 'error');
    return;
  }

  try {
    const res = await fetch('http://localhost:8000/register', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify(data)
    });
    const json = await res.json();

    if (json.status === 'success') {
      await Swal.fire('Success', json.message || 'User registered successfully!', 'success');
      window.location.href = 'login.html';
    } else {
      Swal.fire('Oops', json.message || 'Registration failed.', 'error');
    }
  } catch (err) {
    console.error(err);
    Swal.fire('Network error', 'Could not reach the server at http://localhost:8000.', 'error');
  }
});
