// sidebar.js

// إعداد السايدبار
document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const settingsMenu = document.getElementById("settingsMenu");
  const loginLink = document.getElementById("loginLink");
  const aboutLink = document.getElementById("aboutLink");

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle("active");
      showNotification("تم فتح قائمة الإعدادات");
    });

    document.addEventListener("click", (e) => {
      if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove("active");
      }
    });
  }

  if (loginLink) {
    loginLink.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("جارٍ الانتقال إلى صفحة تسجيل الدخول...");
      setTimeout(() => (window.location.href = "login.html"), 500);
      settingsMenu.classList.remove("active");
    });
  }

  if (aboutLink) {
    aboutLink.addEventListener("click", (e) => {
      e.preventDefault();
      showNotification("جارٍ الانتقال إلى صفحة حول...");
      setTimeout(() => (window.location.href = "about.html"), 500);
      settingsMenu.classList.remove("active");
    });
  }
});
