// components/component-loader.js
async function loadComponent(componentName, targetElementId) {
  try {
    // تحميل HTML
    const htmlResponse = await fetch(`/components/${componentName}/${componentName}.html`);
    if (!htmlResponse.ok) throw new Error(`Failed to load ${componentName}.html`);
    const html = await htmlResponse.text();
    document.getElementById(targetElementId).innerHTML = html;

    // تحميل CSS
    const cssLink = document.createElement('link');
    cssLink.rel = 'stylesheet';
    cssLink.href = `/components/${componentName}/${componentName}.css`;
    document.head.appendChild(cssLink);

    // تحميل JavaScript إذا وجد
    const jsResponse = await fetch(`/components/${componentName}/${componentName}.js`);
    if (jsResponse.ok) {
      const js = await jsResponse.text();
      const script = document.createElement('script');
      script.textContent = js;
      document.body.appendChild(script);
    }
  } catch (error) {
    console.error(`Error loading component ${componentName}:`, error);
  }
}

// تحميل المكونات المشتركة عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', () => {
  loadComponent('header', 'header-container');
  loadComponent('sidebar', 'sidebar-container');
  loadComponent('footer', 'footer-container');
  loadComponent('notifications', 'notifications-container');
});