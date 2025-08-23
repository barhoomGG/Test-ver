// components/header/header.js
document.addEventListener("DOMContentLoaded", () => {
  const settingsBtn = document.getElementById("settingsBtn");
  const backBtn = document.getElementById("backBtn");
  const logo = document.getElementById("logo");

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

  if (settingsBtn) {
    settingsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      document.getElementById("settingsMenu").classList.toggle("active");
      showNotification("تم فتح قائمة الإعدادات");
    });
  }

  if (backBtn) {
    backBtn.addEventListener("click", () => {
      showNotification("جارٍ العودة إلى الصفحة الرئيسية...");
      setTimeout(() => (window.location.href = "index.html"), 500);
    });
  }

  if (logo) {
    logo.addEventListener("click", () => {
      showNotification("جارٍ العودة إلى الصفحة الرئيسية...");
      setTimeout(() => (window.location.href = "index.html"), 500);
    });
  }
});