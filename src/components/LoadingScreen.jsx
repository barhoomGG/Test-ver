import React, { useState, useEffect } from 'react'

const LoadingScreen = () => {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    // Hide loading screen after initial load
    const timer = setTimeout(() => {
      setIsVisible(false)
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  if (!isVisible) return null

  return (
    <div className={`loading-screen ${!isVisible ? 'hidden' : ''}`}>
      <div className="loading-logo">
        <i className="fas fa-star"></i>
        <div className="logo-text">PandaCine</div>
      </div>
      <div className="loader"></div>
      <p>جاري التحميل...</p>
    </div>
  )
}

export default LoadingScreen