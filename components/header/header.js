// header.js
(function() {
  // إعداد الشريط العلوي
  function setupHeader() {
    const settingsBtn = document.getElementById("settingsBtn");
    const backBtn = document.getElementById("backBtn");
    const logo = document.getElementById("logo");
    const notificationsBtn = document.getElementById("notificationsBtn");

    if (settingsBtn) {
      settingsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const settingsMenu = document.getElementById("settingsMenu");
        if (settingsMenu) {
          settingsMenu.classList.toggle("active");
          // إرسال إشعار إذا كان النظام متوفر
          if (window.showNotification) {
            window.showNotification("تم فتح قائمة الإعدادات");
          }
        }
      });
    }

    if (backBtn) {
      backBtn.addEventListener("click", () => {
        if (window.showNotification) {
          window.showNotification("جارٍ العودة إلى الصفحة الرئيسية...");
        }
        setTimeout(() => (window.location.href = "index.html"), 500);
      });
    }

    if (logo) {
      logo.addEventListener("click", () => {
        if (window.showNotification) {
          window.showNotification("جارٍ العودة إلى الصفحة الرئيسية...");
        }
        setTimeout(() => (window.location.href = "index.html"), 500);
      });
    }

    if (notificationsBtn) {
      notificationsBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        const notificationsModal = document.getElementById("notificationsModal");
        if (notificationsModal) {
          notificationsModal.classList.toggle("hidden");
          // تفعيل نظام الإشعارات إذا كان متوفرًا
          if (window.handleNotificationClick) {
            window.handleNotificationClick();
          }
        }
      });
    }

    // إغلاق القوائم عند النقر خارجها
    document.addEventListener("click", (e) => {
      const settingsMenu = document.getElementById("settingsMenu");
      const notificationsModal = document.getElementById("notificationsModal");
      
      if (settingsBtn && settingsMenu && !settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove("active");
      }
      
      if (notificationsBtn && notificationsModal && !notificationsBtn.contains(e.target) && !notificationsModal.contains(e.target)) {
        notificationsModal.classList.add("hidden");
      }
    });
  }

  // تشغيل الإعداد عند تحميل المكون
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupHeader);
  } else {
    setupHeader();
  }
})();
