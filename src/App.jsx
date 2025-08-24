import React from 'react'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import { UserProvider } from './hooks/useUser'
import { NotificationProvider } from './hooks/useNotification'
import { ThemeProvider } from './hooks/useTheme'

// Import components
import Layout from './components/Layout'
import Home from './pages/Home'
import AnimeList from './pages/AnimeList'
import AnimeDetails from './pages/AnimeDetails'
import LoadingScreen from './components/LoadingScreen'

function App() {
  return (
    <UserProvider>
      <NotificationProvider>
        <ThemeProvider>
          <Router>
            <div className="app" dir="rtl">
              <LoadingScreen />
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Home />} />
                  <Route path="anime" element={<AnimeList />} />
                  <Route path="anime/:id" element={<AnimeDetails />} />
                </Route>
              </Routes>
            </div>
          </Router>
        </ThemeProvider>
      </NotificationProvider>
    </UserProvider>
  )
}

export default App