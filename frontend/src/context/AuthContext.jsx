import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))

  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`
      try {
        const stored = localStorage.getItem('user')
        if (stored) setUser(JSON.parse(stored))
      } catch {
        localStorage.removeItem('user')
      }
    }
  }, [token])

  const login = async (email, password) => {
    const { data } = await api.post('/api/v1/auth/login', { email, password })
    setToken(data.token)
    setUser(data)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const register = async (userData) => {
    const { data } = await api.post('/api/v1/auth/register', userData)
    setToken(data.token)
    setUser(data)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const logout = () => {
    setToken(null)
    setUser(null)
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    delete api.defaults.headers.common['Authorization']
  }

  const hasPermission = (module) => {
    if (!user?.permissions) return false
    return user.permissions.includes(module)
  }

  const isSuperAdmin = () => {
    return user?.role === 'SUPER_ADMIN'
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, hasPermission, isSuperAdmin }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
