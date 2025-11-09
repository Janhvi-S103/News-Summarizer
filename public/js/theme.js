// public/js/theme.js
(function(){
    const root = document.documentElement;
    const toggle = document.getElementById('themeToggle');
    function setTheme(t){
      document.documentElement.setAttribute('data-theme', t);
      localStorage.setItem('theme', t);
    }
    const saved = localStorage.getItem('theme') || 'light';
    setTheme(saved);
    toggle?.addEventListener('click', ()=> setTheme(document.documentElement.getAttribute('data-theme') === 'light' ? 'dark' : 'light'));
  })();
  