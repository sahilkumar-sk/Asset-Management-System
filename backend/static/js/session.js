// session.js — super-simple frontend auth
const AUTH_KEY = 'ams_auth';
const USER_KEY = 'ams_user';

function setAuth(user) {
  localStorage.setItem(AUTH_KEY, '1');
  localStorage.setItem(USER_KEY, JSON.stringify(user || {}));
}
function clearAuth() {
  localStorage.removeItem(AUTH_KEY);
  localStorage.removeItem(USER_KEY);
}
function isAuthed() {
  return localStorage.getItem(AUTH_KEY) === '1';
}
function requireAuth() {
  if (!isAuthed()) location.href = 'login.html';
}
function redirectIfAuthed() {
  if (isAuthed()) location.href = 'dashboard.html';
}
