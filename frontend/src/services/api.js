import axios from 'axios'

// Usar baseURL directa al backend para evitar problemas de proxy
const api = axios.create({
  baseURL: 'http://localhost:8080',
  headers: {
    'Content-Type': 'application/json'
  }
})

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isAuthRequest = error.config?.url?.includes('/auth/')
    const isOnLoginPage = window.location.pathname === '/login'

    // Solo cerrar sesión si falla una petición protegida (no login/register)
    if (
      error.response?.status === 401 &&
      !isAuthRequest &&
      !isOnLoginPage
    ) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      delete api.defaults.headers.common['Authorization']
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

export default api
