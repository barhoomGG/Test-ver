// component-loader.js
window.componentLoader = (function() {
  const cache = new Map();
  
  async function loadComponent(componentName, containerId) {
    try {
      const container = document.getElementById(containerId);
      if (!container) {
        console.error(`Container with id "${containerId}" not found`);
        return;
      }

      // التحقق من الكاش
      if (cache.has(componentName)) {
        const cached = cache.get(componentName);
        container.innerHTML = cached.html;
        return;
      }

      // تحميل HTML
      const htmlResponse = await fetch(`components/${componentName}/${componentName}.html`);
      if (!htmlResponse.ok) {
        throw new Error(`Failed to load ${componentName}.html`);
      }
      const html = await htmlResponse.text();

      // تحميل CSS
      const cssResponse = await fetch(`components/${componentName}/${componentName}.css`);
      if (cssResponse.ok) {
        const css = await cssResponse.text();
        
        // التحقق من وجود الـ style tag مسبقاً
        const existingStyle = document.querySelector(`style[data-component="${componentName}"]`);
        if (!existingStyle) {
          const style = document.createElement('style');
          style.setAttribute('data-component', componentName);
          style.textContent = css;
          document.head.appendChild(style);
        }
      }

      // إدراج HTML
      container.innerHTML = html;

      // تحميل JavaScript
      try {
        const jsResponse = await fetch(`components/${componentName}/${componentName}.js`);
        if (jsResponse.ok) {
          const js = await jsResponse.text();
          
          // التحقق من وجود الـ script tag مسبقاً
          const existingScript = document.querySelector(`script[data-component="${componentName}"]`);
          if (!existingScript) {
            const script = document.createElement('script');
            script.setAttribute('data-component', componentName);
            script.textContent = js;
            document.body.appendChild(script);
          }
        }
      } catch (jsError) {
        console.log(`No JavaScript file for ${componentName} or error loading it:`, jsError);
      }

      // حفظ في الكاش
      cache.set(componentName, { html });

      console.log(`Component "${componentName}" loaded successfully`);
      
    } catch (error) {
      console.error(`Error loading component "${componentName}":`, error);
    }
  }

  return {
    loadComponent
  };
})();
