// public/js/profile.js
async function initProfilePage(){
    // fetch profile
    const res = await fetch('/api/user/viewProfile');
    const data = await res.json();
    if (res.ok && data.user) {
      document.getElementById('username').innerText = data.user.username || 'User';
      document.getElementById('email').innerText = data.user.email || '';
      document.getElementById('bio').innerText = data.user.bio || 'No bio';
      // TODO: populate saved, liked using API endpoints
    }
    // wire avatar upload
    document.getElementById('editProfileBtn')?.addEventListener('click', ()=>{
      document.getElementById('avatarUpload').click();
    });
    document.getElementById('avatarUpload')?.addEventListener('change', async (e)=>{
      const file = e.target.files[0];
      if (!file) return;
      const fd = new FormData();
      fd.append('avatar', file);
      // send to /api/user/upload-avatar (implement in server)
      const r = await fetch('/api/user/upload-avatar', { method:'POST', body: fd, headers: { /* no content-type */ } });
      const j = await r.json();
      if (r.ok) alert('Avatar uploaded'); else alert('Upload failed');
    });
  }
  window.initProfilePage = initProfilePage;
  