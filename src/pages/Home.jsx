import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../hooks/useUser'
import { useNotification } from '../hooks/useNotification'

const Home = () => {
  const [showLogin, setShowLogin] = useState(false)
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const navigate = useNavigate()
  const { login, isLoggedIn } = useUser()
  const { showNotification } = useNotification()

  const handleAnimeClick = () => {
    navigate('/anime')
  }

  const handleLoginSubmit = (e) => {
    e.preventDefault()
    if (login(username, password)) {
      showNotification('تم تسجيل الدخول بنجاح!', 'success')
      setShowLogin(false)
      setUsername('')
      setPassword('')
    } else {
      showNotification('خطأ في اسم المستخدم أو كلمة المرور', 'error')
    }
  }

  return (
    <div className="home-page">
      <section className="hero-section">
        <div className="hero glass" role="main" aria-label="الصفحة الرئيسية">
          <h1>مرحبًا بك في<br/> PandaCine</h1>
          <p>
            وجهتك المثالية لمشاهدة أفضل الأنمي والأفلام بجودة عالية وترجمات
            احترافية. استمتع بتجربة مشاهدة فريدة مع مكتبة ضخمة تتجدد باستمرار.
          </p>
          <div className="button-group" role="group" aria-label="اختيار نوع المحتوى">
            <button className="action-btn" onClick={handleAnimeClick}>
              <i className="fas fa-dragon"></i> أنمي
            </button>
            <button className="action-btn" onClick={() => showNotification('قريباً...')}>
              <i className="fas fa-film"></i> أفلام
            </button>
          </div>
        </div>
      </section>

      <section className="features-section">
        <h2 className="section-title">لماذا PandaCine؟</h2>
        <div className="features-grid">
          <div className="feature-card glass">
            <div className="feature-icon">
              <i className="fas fa-play-circle"></i>
            </div>
            <h3 className="feature-title">جودة عالية</h3>
            <p className="feature-description">
              استمتع بمشاهدة المحتوى بدقة تصل إلى 4K مع صوت عالي الدقة لتحقيق
              تجربة مشاهدة استثنائية.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">
              <i className="fas fa-sync"></i>
            </div>
            <h3 className="feature-title">تحديثات مستمرة</h3>
            <p className="feature-description">
              نضيف باستمرار أحدث حلقات الأنمي والأفلام فور صدورها لضمان حصولك
              على المحتوى أولاً بأول.
            </p>
          </div>

          <div className="feature-card glass">
            <div className="feature-icon">
              <i className="fas fa-closed-captioning"></i>
            </div>
            <h3 className="feature-title">ترجمات احترافية</h3>
            <p className="feature-description">
              ترجمات دقيقة وواضحة بجودة عالية، مع مراعاة السياق الثقافي للغة
              العربية.
            </p>
          </div>
        </div>
      </section>

      {/* Login Modal */}
      {showLogin && (
        <section className="login-section glass" role="region" aria-label="تسجيل الدخول">
          <h2>تسجيل الدخول</h2>
          <form onSubmit={handleLoginSubmit} aria-describedby="loginHelp">
            <input
              type="text"
              placeholder="اسم المستخدم"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              autocomplete="username"
            />
            <input
              type="password"
              placeholder="كلمة المرور"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autocomplete="current-password"
            />
            <a href="#" className="forgot-password">نسيت كلمة المرور؟</a>
            <button type="submit" className="action-btn">دخول</button>
            <button 
              type="button" 
              className="action-btn secondary"
              onClick={() => setShowLogin(false)}
            >
              عودة
            </button>
          </form>

          <div className="social-login">
            <div className="social-btn fb-btn">
              <i className="fab fa-facebook-f"></i>
            </div>
            <div className="social-btn google-btn">
              <i className="fab fa-google"></i>
            </div>
            <div className="social-btn twitter-btn">
              <i className="fab fa-twitter"></i>
            </div>
          </div>

          <p>ليس لديك حساب؟ <a href="#" style={{color: 'var(--accent-color)'}}>سجل الآن</a></p>
        </section>
      )}
    </div>
  )
}

export default Home