// public/js/api.js
const BASE_URL = ''; // same origin; e.g., '' so fetch('/api/news/all') works

function getAuthHeaders() {
  const token = localStorage.getItem('token');
  return token ? { 'Authorization': 'Bearer ' + token } : {};
}

async function apiGet(path) {
  const res = await fetch(`/api${path}`, { headers: getAuthHeaders() });
  return res;
}
async function apiPost(path, body) {
  const res = await fetch(`/api${path}`, {
    method: 'POST',
    headers: Object.assign({ 'Content-Type': 'application/json' }, getAuthHeaders()),
    body: JSON.stringify(body)
  });
  return res;
}
