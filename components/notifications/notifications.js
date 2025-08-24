// notifications.js
(function() {
  let notificationHistory = [];
  let unreadNotifications = 0;
  const notificationJsonUrl = 'https://ibraheem.golden33191.workers.dev/data?file=notifications.json';

  // دالة عرض الإشعارات العائمة (toast)
  window.showNotification = function(message) {
    const notifications = document.getElementById("notifications");
    if (!notifications) return;

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
  };

  // تحديث badge الإشعارات
  function updateNotificationBadge() {
    const notificationBadge = document.getElementById("notificationBadge");
    if (!notificationBadge) return;

    if (unreadNotifications > 0) {
      notificationBadge.textContent = unreadNotifications;
      notificationBadge.classList.remove("hidden");
    } else {
      notificationBadge.classList.add("hidden");
    }
  }

  // عرض الإشعارات في الـ modal
  function renderNotifications() {
    const notificationsList = document.getElementById("notificationsList");
    if (!notificationsList) return;

    notificationsList.innerHTML = "";
    if (notificationHistory.length === 0) {
      notificationsList.innerHTML = "<p style='text-align: center; color: var(--text-secondary);'>لا توجد إشعارات</p>";
      return;
    }
    notificationHistory.slice().reverse().forEach((notif) => {
      const item = document.createElement("div");
      item.className = `notification-item ${notif.read ? '' : 'unread'}`;
      item.innerHTML = `
        ${notif.image ? `<img src="${notif.image}" alt="صورة الإشعار">` : '<i class="fas fa-bell"></i>'}
        <div class="content">
          <div class="title">${notif.title || 'إشعار'}</div>
          <div class="message">${notif.message}</div>
          <div class="timestamp">${new Date(notif.timestamp).toLocaleString('ar')}</div>
        </div>
      `;
      if (notif.link) {
        item.addEventListener("click", () => {
          window.location.href = notif.link;
          const notificationsModal = document.getElementById("notificationsModal");
          if (notificationsModal) {
            notificationsModal.classList.add("hidden");
          }
        });
      } else {
        item.addEventListener("click", () => {
          if (!notif.read) {
            notif.read = true;
            unreadNotifications--;
            updateNotificationBadge();
            localStorage.setItem("notificationReadStatus", JSON.stringify(notificationHistory.map(n => n.read)));
            renderNotifications();
          }
        });
      }
      notificationsList.appendChild(item);
    });
  }

  // fetch الإشعارات من JSON
  async function fetchNotifications() {
    try {
      // استخدام DataManager إذا كان متوفرًا، وإلا استخدام fetch
      let data;
      if (window.DataManager && window.DataManager.getNotifications) {
        const result = await window.DataManager.getNotifications();
        data = result.data;
      } else {
        const response = await fetch(notificationJsonUrl);
        data = await response.json();
      }

      if (!Array.isArray(data)) {
        throw new Error('Notifications data is not an array');
      }
      const readStatus = JSON.parse(localStorage.getItem("notificationReadStatus")) || [];
      notificationHistory = data.map((notif, index) => ({
        ...notif,
        read: readStatus[index] || false
      }));
      unreadNotifications = notificationHistory.filter(n => !n.read).length;
      updateNotificationBadge();
      renderNotifications();
      if (window.showNotification) {
        window.showNotification("تم تحديث الإشعارات بنجاح");
      }
    } catch (error) {
      console.error("Error fetching notifications:", error);
      if (window.showNotification) {
        window.showNotification("حدث خطأ في تحميل الإشعارات");
      }
    }
  }

  // معالج النقر على زر الإشعارات
  window.handleNotificationClick = function() {
    const notificationsModal = document.getElementById("notificationsModal");
    if (!notificationsModal) return;

    if (!notificationsModal.classList.contains("hidden")) {
      unreadNotifications = 0;
      notificationHistory.forEach(n => n.read = true);
      localStorage.setItem("notificationReadStatus", JSON.stringify(notificationHistory.map(n => n.read)));
      updateNotificationBadge();
      renderNotifications();
    }
  };

  function setupNotifications() {
    const closeNotificationsModal = document.getElementById("closeNotificationsModal");

    if (closeNotificationsModal) {
      closeNotificationsModal.addEventListener("click", () => {
        const notificationsModal = document.getElementById("notificationsModal");
        if (notificationsModal) {
          notificationsModal.classList.add("hidden");
        }
      });
    }

    // تحميل الإشعارات
    fetchNotifications();
    setInterval(fetchNotifications, 1200000); // كل 20 دقيقة
  }

  // تشغيل الإعداد عند تحميل المكون
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', setupNotifications);
  } else {
    setupNotifications();
  }
})();
