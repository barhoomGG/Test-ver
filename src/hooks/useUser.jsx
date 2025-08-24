import React, { createContext, useContext, useState, useEffect } from 'react'

const UserContext = createContext()

export const useUser = () => {
  const context = useContext(UserContext)
  if (!context) {
    throw new Error('useUser must be used within a UserProvider')
  }
  return context
}

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [isLoggedIn, setIsLoggedIn] = useState(false)

  useEffect(() => {
    // Check localStorage for existing login
    const storedLogin = localStorage.getItem('isLoggedIn')
    const storedUsername = localStorage.getItem('username')
    
    if (storedLogin === 'true' && storedUsername) {
      setIsLoggedIn(true)
      setUser({ username: storedUsername })
    }
  }, [])

  const login = (username, password) => {
    // Simple validation - in real app, this would be API call
    if (username && password) {
      localStorage.setItem('isLoggedIn', 'true')
      localStorage.setItem('username', username)
      setIsLoggedIn(true)
      setUser({ username })
      return true
    }
    return false
  }

  const logout = () => {
    localStorage.removeItem('isLoggedIn')
    localStorage.removeItem('username')
    setIsLoggedIn(false)
    setUser(null)
  }

  const value = {
    user,
    isLoggedIn,
    login,
    logout
  }

  return (
    <UserContext.Provider value={value}>
      {children}
    </UserContext.Provider>
  )
}