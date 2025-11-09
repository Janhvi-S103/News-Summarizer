document.addEventListener("DOMContentLoaded", () => {
    const toggle = document.getElementById("themeToggle");
    const label = document.getElementById("themeLabel");
    const root = document.documentElement;
  
    const setTheme = (dark) => {
      if (dark) {
        root.classList.add("dark-theme");
        label.textContent = "Dark Mode";
        localStorage.setItem("theme", "dark");
      } else {
        root.classList.remove("dark-theme");
        label.textContent = "Light Mode";
        localStorage.setItem("theme", "light");
      }
    };
  
    const saved = localStorage.getItem("theme");
    if (saved === "dark") {
      toggle.checked = true;
      setTheme(true);
    }
  
    toggle.addEventListener("change", (e) => setTheme(e.target.checked));
  });
  