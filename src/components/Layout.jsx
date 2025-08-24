import React from 'react'
import { Outlet } from 'react-router-dom'
import Header from './Header'
import Sidebar from './Sidebar'
import Footer from './Footer'
import NotificationContainer from './NotificationContainer'

const Layout = () => {
  return (
    <div className="layout">
      {/* خلفية النجوم */}
      <div id="stars"></div>
      
      <Header />
      <Sidebar />
      <NotificationContainer />
      
      <main>
        <Outlet />
      </main>
      
      <Footer />
      
      {/* Audio for sound effects */}
      <audio id="popSound" preload="auto">
        <source
          src="https://cdn.pixabay.com/audio/2022/03/15/audio_e3a5cfcd5d.mp3"
          type="audio/mpeg"
        />
      </audio>
    </div>
  )
}

export default Layout