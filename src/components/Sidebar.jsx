import React, { useState } from 'react'
import { useUser } from '../hooks/useUser'
import { useTheme } from '../hooks/useTheme'
import { useNotification } from '../hooks/useNotification'

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(false)
  const { user, isLoggedIn, logout } = useUser()
  const { theme, toggleTheme } = useTheme()
  const { showNotification } = useNotification()

  const handleLogout = () => {
    logout()
    showNotification('تم تسجيل الخروج بنجاح', 'success')
    setIsOpen(false)
  }

  return (
    <>
      {/* Overlay */}
      {isOpen && (
        <div 
          className="sidebar-overlay"
          onClick={() => setIsOpen(false)}
        />
      )}
      
      {/* Sidebar */}
      <div className={`settings-sidebar ${isOpen ? 'active' : ''}`}>
        <div className="sidebar-header">
          <h3>الإعدادات</h3>
          <button 
            className="close-btn"
            onClick={() => setIsOpen(false)}
          >
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        <div className="sidebar-content">
          {isLoggedIn ? (
            <div className="user-section">
              <p>مرحباً، {user?.username}</p>
              <button className="action-btn" onClick={handleLogout}>
                تسجيل الخروج
              </button>
            </div>
          ) : (
            <div className="user-section">
              <p>غير مسجل الدخول</p>
            </div>
          )}
          
          <div className="settings-section">
            <div className="setting-item">
              <label>
                <span>المظهر الداكن</span>
                <input
                  type="checkbox"
                  checked={theme === 'dark'}
                  onChange={toggleTheme}
                />
              </label>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default Sidebar