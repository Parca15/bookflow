import { createContext, useContext, useState, useEffect } from 'react'
import { authService } from '../services/authService'
import api from '../services/api'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [token, setToken] = useState(localStorage.getItem('token'))
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')

      if (storedToken && storedUser) {
        try {
          api.defaults.headers.common['Authorization'] = `Bearer ${storedToken}`
          const parsedUser = JSON.parse(storedUser)

          const { data } = await api.get(
            `/api/v1/companies/${parsedUser.companyId}/users`
          )

          const freshUser = data.find(u => u.email === parsedUser.email)

          if (freshUser && freshUser.status === 'ACTIVE') {
            setToken(storedToken)
            setUser(parsedUser)
          } else {
            logout()
          }
        } catch {
          logout()
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    const { data } = await authService.login(email, password)
    setToken(data.token)
    setUser(data)
    localStorage.setItem('token', data.token)
    localStorage.setItem('user', JSON.stringify(data))
    api.defaults.headers.common['Authorization'] = `Bearer ${data.token}`
    return data
  }

  const register = async (userData) => {
    const { data } = await authService.register(userData)
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

  const hasMinimumLevel = (level) => {
    return (user?.roleLevel || 0) >= level
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
      </div>
    )
  }

  return (
    <AuthContext.Provider value={{ user, token, login, register, logout, hasPermission, isSuperAdmin, hasMinimumLevel }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)
