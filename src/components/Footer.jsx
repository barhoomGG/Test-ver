import React from 'react'

const Footer = () => {
  return (
    <footer className="footer glass">
      <div className="footer-content">
        <div className="footer-section">
          <h4>PandaCine</h4>
          <p>أفضل منصة لمشاهدة الأنمي والأفلام</p>
        </div>
        
        <div className="footer-section">
          <h4>روابط سريعة</h4>
          <ul>
            <li><a href="/">الرئيسية</a></li>
            <li><a href="/anime">الأنمي</a></li>
            <li><a href="/movies">الأفلام</a></li>
          </ul>
        </div>
        
        <div className="footer-section">
          <h4>تواصل معنا</h4>
          <div className="social-links">
            <a href="#" title="Facebook">
              <i className="fab fa-facebook"></i>
            </a>
            <a href="#" title="Twitter">
              <i className="fab fa-twitter"></i>
            </a>
            <a href="#" title="Instagram">
              <i className="fab fa-instagram"></i>
            </a>
          </div>
        </div>
      </div>
      
      <div className="footer-bottom">
        <p>&copy; 2024 PandaCine. جميع الحقوق محفوظة.</p>
      </div>
    </footer>
  )
}

export default Footer