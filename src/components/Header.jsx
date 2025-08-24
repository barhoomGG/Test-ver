import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useNotification } from '../hooks/useNotification'

const Header = () => {
  const navigate = useNavigate()
  const { showNotification } = useNotification()
  const [showNotifications, setShowNotifications] = useState(false)
  const [showSettings, setShowSettings] = useState(false)

  const handleBackClick = () => {
    showNotification('جارٍ العودة إلى الصفحة الرئيسية...')
    setTimeout(() => navigate('/'), 500)
  }

  const handleLogoClick = () => {
    showNotification('جارٍ العودة إلى الصفحة الرئيسية...')
    setTimeout(() => navigate('/'), 500)
  }

  const handleNotificationsClick = (e) => {
    e.stopPropagation()
    setShowNotifications(!showNotifications)
  }

  const handleSettingsClick = (e) => {
    e.stopPropagation()
    setShowSettings(!showSettings)
    showNotification('تم فتح قائمة الإعدادات')
  }

  return (
    <header className="navbar glass">
      <div className="navbar-content">
        <div className="left-buttons">
          <button 
            className="glass-btn" 
            title="عودة إلى الرئيسية"
            onClick={handleBackClick}
          >
            <i className="fas fa-arrow-left"></i>
          </button>
        </div>
        
        <div className="logo" onClick={handleLogoClick}>
          <img 
            className="logo-img logo-root" 
            src="https://i.postimg.cc/m2vScd8t/1000072729-removebg-preview.png" 
            alt="PandaCine"
          />
          <img 
            className="logo-img logo-purple" 
            src="https://i.postimg.cc/hGr85Kgd/1000072730-removebg-preview.png" 
            alt="PandaCine"
          />
        </div>
        
        <div className="right-buttons">
          <button 
            className="glass-btn" 
            title="الإشعارات"
            onClick={handleNotificationsClick}
          >
            <i className="fas fa-bell"></i>
            <span className="notification-badge hidden">0</span>
          </button>
          <button 
            className="settings-btn"
            onClick={handleSettingsClick}
          >
            <i className="fas fa-bars"></i>
          </button>
        </div>
      </div>
    </header>
  )
}

export default Header