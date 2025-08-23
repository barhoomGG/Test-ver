

// component-loader.js

// دالة لتحميل HTML من ملف وإضافته إلى عنصر هدف في الـ DOM
async function loadHTML(componentPath, targetId) {
  try {
    const response = await fetch(componentPath);
    if (!response.ok) throw new Error(`Failed to load ${componentPath}`);
    const html = await response.text();
    const target = document.getElementById(targetId);
    if (target) target.innerHTML = html;
  } catch (error) {
    console.error(`Error loading HTML for ${componentPath}:`, error);
  }
}

// دالة لتحميل CSS من ملف وإضافته إلى الـ head
function loadCSS(cssPath) {
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = cssPath;
  document.head.appendChild(link);
}

// دالة لتحميل JS من ملف وإضافته إلى الـ body (مع دعم type="module" إذا لزم الأمر)
function loadJS(jsPath, isModule = false) {
  const script = document.createElement('script');
  script.src = jsPath;
  if (isModule) script.type = 'module';
  document.body.appendChild(script);
}

// تحميل المكونات المشتركة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', async () => {
  // تحميل الهيدر
  loadCSS('components/header/header.css');
  await loadHTML('components/header/header.html', 'headerPlaceholder');
  loadJS('components/header/header.js');

  // تحميل السايدبار
  loadCSS('components/sidebar/sidebar.css');
  await loadHTML('components/sidebar/sidebar.html', 'sidebarPlaceholder');
  loadJS('components/sidebar/sidebar.js');

  // تحميل الفوتر
  loadCSS('components/footer/footer.css');
  await loadHTML('components/footer/footer.html', 'footerPlaceholder');

  // تحميل الإشعارات
  loadCSS('components/notifications/notifications.css');
  await loadHTML('components/notifications/notifications.html', 'notificationsPlaceholder');
  loadJS('components/notifications/notifications.js');

  // بعد تحميل جميع المكونات، يمكن تنفيذ أي كود إضافي يعتمد عليها
  // مثل استدعاء دالة init() إذا لزم الأمر
});
