// component-loader.js

// دالة لتحميل HTML من ملف خارجي
async function loadHTML(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed to load ${url}`);
  return await response.text();
}

// دالة لتحميل CSS وإضافتها إلى الـ head
function loadCSS(url) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = url;
  document.head.appendChild(link);
}

// دالة لتحميل JS وتنفيذها
function loadJS(url) {
  const script = document.createElement('script');
  script.src = url;
  document.body.appendChild(script);
}

// تحميل المكونات المشتركة
async function loadComponents() {
  try {
    // تحميل Header
    const headerHTML = await loadHTML('components/header/header.html');
    document.body.insertAdjacentHTML('afterbegin', headerHTML);
    loadCSS('components/header/header.css');
    loadJS('components/header/header.js');

    // تحميل Sidebar
    const sidebarHTML = await loadHTML('components/sidebar/sidebar.html');
    document.body.insertAdjacentHTML('beforeend', sidebarHTML);
    loadCSS('components/sidebar/sidebar.css');
    loadJS('components/sidebar/sidebar.js');

    // تحميل Footer
    const footerHTML = await loadHTML('components/footer/footer.html');
    document.body.insertAdjacentHTML('beforeend', footerHTML);
    loadCSS('components/footer/footer.css');

    // تحميل Notifications
    const notificationsHTML = await loadHTML('components/notifications/notifications.html');
    document.body.insertAdjacentHTML('beforeend', notificationsHTML);
    loadCSS('components/notifications/notifications.css');
    loadJS('components/notifications/notifications.js');

    console.log('All components loaded successfully');
  } catch (error) {
    console.error('Error loading components:', error);
  }
}

// تشغيل التحميل عند تحميل الصفحة، بعد theme.js و data-manager.js
document.addEventListener('DOMContentLoaded', () => {
  loadComponents();
});
