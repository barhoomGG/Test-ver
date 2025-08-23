// components/sidebar/sidebar.js
document.addEventListener("DOMContentLoaded", () => {
  const settingsMenu = document.getElementById("settingsMenu");
  const loginLink = document.getElementById("loginLink");
  const aboutLink = document.getElementById("aboutLink");

  function showNotification(message) {
    const notifications = document.getElementById("notifications");
    while (notifications.firstChild) {
      notifications.removeChild(notifications.firstChild);
    }
    const notification = document.createElement("div");
    notification.className = "notification show";
    notification.textContent = message;
    notifications.appendChild(notification);
    setTimeout(() => {
      notification.classList.remove("show");
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  document.addEventListener("click", (e) => {
    if (!document.getElementById("settingsBtn").contains(e.target) && !settingsMenu.contains(e.target)) {
      settingsMenu.classList.remove("active");
    }
  });

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

  document.querySelectorAll('.menu-item, .profile-edit').forEach(item => {
    item.addEventListener('contextmenu', e => e.preventDefault());
  });
});