// components/notifications/notifications.js
import DataManager from '../../data-manager.js';

document.addEventListener("DOMContentLoaded", () => {
  const notificationsBtn = document.getElementById("notificationsBtn");
  const notificationsModal = document.getElementById("notificationsModal");
  const notificationsList = document.getElementById("notificationsList");
  const closeNotificationsModal = document.getElementById("closeNotificationsModal");
  const notificationBadge = document.getElementById("notificationBadge");
  const notifications = document.getElementById("notifications");

  let notificationHistory = [];
  let unreadNotifications = 0;
  const notificationJsonUrl = 'https://ibraheem.golden33191.workers.dev/data?file=notifications.json';

  function showNotification(message) {
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

  function updateNotificationBadge() {
    if (unreadNotifications > 0) {
      notificationBadge.textContent = unreadNotifications;
      notificationBadge.classList.remove("hidden");
    } else {
      notificationBadge.classList.add("hidden");
    }
  }

  function renderNotifications() {
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
          notificationsModal.classList.add("hidden");
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

  async function fetchNotifications() {
    try {
      const result = await DataManager.getNotifications();
      const data = result.data;
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
      showNotification("تم تحديث الإشعارات بنجاح");
    } catch (error) {
      console.error("Error fetching notifications:", error);
      showNotification("حدث خطأ في تحميل الإشعارات");
    }
  }

  if (notificationsBtn && notificationsModal) {
    notificationsBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      notificationsModal.classList.toggle("hidden");
      if (!notificationsModal.classList.contains("hidden")) {
        unreadNotifications = 0;
        notificationHistory.forEach(n => n.read = true);
        localStorage.setItem("notificationReadStatus", JSON.stringify(notificationHistory.map(n => n.read)));
        updateNotificationBadge();
        renderNotifications();
      }
    });

    closeNotificationsModal.addEventListener("click", () => {
      notificationsModal.classList.add("hidden");
    });

    document.addEventListener("click", (e) => {
      if (!notificationsBtn.contains(e.target) && !notificationsModal.contains(e.target)) {
        notificationsModal.classList.add("hidden");
      }
    });
  }

  fetchNotifications();
  setInterval(fetchNotifications, 1200000);
});