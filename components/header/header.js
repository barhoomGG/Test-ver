// header.js

// إعداد الهيدر
document.addEventListener('DOMContentLoaded', () => {
  const backBtn = document.getElementById("backBtn");
  const logo = document.getElementById("logo");

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
