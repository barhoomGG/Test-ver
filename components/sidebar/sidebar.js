// sidebar.js
document.addEventListener('DOMContentLoaded', () => {
  const settingsBtn = document.getElementById('settingsBtn');
  const settingsMenu = document.getElementById('settingsMenu');
  const loginLink = document.getElementById('loginLink');
  const aboutLink = document.getElementById('aboutLink');

  if (settingsBtn && settingsMenu) {
    settingsBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      settingsMenu.classList.toggle('active');
    });

    document.addEventListener('click', (e) => {
      if (!settingsBtn.contains(e.target) && !settingsMenu.contains(e.target)) {
        settingsMenu.classList.remove('active');
      }
    });
  }

  if (loginLink) {
    loginLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'login.html';
      settingsMenu.classList.remove('active');
    });
  }

  if (aboutLink) {
    aboutLink.addEventListener('click', (e) => {
      e.preventDefault();
      window.location.href = 'about.html';
      settingsMenu.classList.remove('active');
    });
  }
});
