import { createContext, useContext, useEffect, useState } from 'react'

const AuthContext = createContext(null)
const STORAGE_KEY = 'aether_user'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (stored) setUser(JSON.parse(stored))
    setReady(true)
  }, [])

  const persist = (nextUser) => {
    setUser(nextUser)
    localStorage.setItem(STORAGE_KEY, JSON.stringify(nextUser))
  }

  const login = (email) => {
    persist({
      id: 'u_' + Date.now(),
      name: email.split('@')[0],
      email,
      avatarUrl: null,
      hasOnboarded: true,
    })
  }

  const signup = (name, email) => {
    persist({
      id: 'u_' + Date.now(),
      name,
      email,
      avatarUrl: null,
      hasOnboarded: false,
    })
  }

  const completeOnboarding = () => {
    if (!user) return
    persist({ ...user, hasOnboarded: true })
  }

  const logout = () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, ready, login, signup, logout, completeOnboarding }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
