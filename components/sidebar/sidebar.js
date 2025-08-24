// sidebar.js
(function() {
  function setupSidebar() {
    const loginLink = document.getElementById("loginLink");
    const aboutLink = document.getElementById("aboutLink");
    const settingsMenu = document.getElementById("settingsMenu");

    if (loginLink) {
      loginLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.showNotification) {
          window.showNotification("جارٍ الانتقال إلى صفحة تسجيل الدخول...");
        }
        setTimeout(() => (window.location.href = "login.html"), 500);
        if (settingsMenu) {
          settingsMenu.classList.remove("active");
        }
      });
    }

    if (aboutLink) {
      aboutLink.addEventListener("click", (e) => {
        e.preventDefault();
        if (window.showNotification) {
          window.showNotification("جارٍ الانتقال إلى صفحة حول...");
        }
        setTimeout(() => (window.location.href = "about.html"), 500);
        if (settingsMenu) {
          settingsMenu.classList.remove("active");
        }
      });
    }
  }

  // تشغيل الإعداد عند تحميل المكون
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupSidebar);
  } else {
    setupSidebar();
  }
})();
