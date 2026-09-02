import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Scissors, Eye, EyeOff } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import toast from 'react-hot-toast'

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true)
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    companyId: '',
    role: 'ADMIN',
  })
  const { login, register } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (isLogin) {
        await login(form.email, form.password)
        toast.success('¡Bienvenido!')
      } else {
        await register({
          ...form,
          companyId: parseInt(form.companyId),
        })
        toast.success('Usuario registrado')
      }
      navigate('/')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error al autenticar')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden" style={{ backgroundColor: 'var(--apple-bg)' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom right, rgba(0,136,204,0.06), transparent 40%, rgba(117,114,255,0.04))' }} />

      <motion.div
        className="relative w-full max-w-md mx-auto flex items-center justify-center min-h-screen p-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ type: 'spring', bounce: 0, duration: 0.5 }}
      >
        <motion.div
          className="w-full"
          initial={{ opacity: 0, y: 24, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ type: 'spring', bounce: 0, duration: 0.5, delay: 0.1 }}
        >
          <div className="text-center mb-8">
            <motion.div
              className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg"
              style={{ background: 'linear-gradient(to bottom right, #0088CC, #7572FF)', boxShadow: '0 4px 16px rgba(0,136,204,0.25)' }}
              animate={{ rotate: 0 }}
              transition={{ type: 'spring', bounce: 0.4, duration: 0.5 }}
            >
              <Scissors className="w-8 h-8 text-white" />
            </motion.div>
            <h1 className="text-4xl font-bold tracking-tight" style={{ color: 'var(--apple-text)' }}>BookFlow</h1>
            <p className="text-base mt-2" style={{ color: 'var(--apple-secondary)' }}>Sistema de gestión para salones</p>
          </div>

          <motion.div
            className="material-modal p-8 shadow-apple-lg"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.2 }}
          >
            <AnimatePresence mode="wait">
              <motion.h2
                key={isLogin ? 'login' : 'register'}
                className="text-xl font-semibold mb-4 tracking-tight"
                style={{ color: 'var(--apple-text)' }}
                initial={{ opacity: 0, x: isLogin ? -20 : 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: isLogin ? 20 : -20 }}
                transition={{ type: 'spring', bounce: 0, duration: 0.25 }}
              >
                {isLogin ? 'Iniciar sesión' : 'Crear cuenta'}
              </motion.h2>
            </AnimatePresence>

            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLogin && (
                <AnimatePresence>
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                    className="space-y-4"
                  >
                    <div>
                      <label className="label">Nombre completo</label>
                      <input className="input-field" placeholder="Tu nombre" value={form.fullName}
                        onChange={(e) => setForm({ ...form, fullName: e.target.value })} required />
                    </div>
                    <div>
                      <label className="label">ID de Empresa</label>
                      <input className="input-field" type="number" placeholder="1" value={form.companyId}
                        onChange={(e) => setForm({ ...form, companyId: e.target.value })} required />
                    </div>
                  </motion.div>
                </AnimatePresence>
              )}

              <div>
                <label className="label">Email</label>
                <input className="input-field" type="email" placeholder="admin@salon.com" value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })} required />
              </div>

              <div>
                <label className="label">Contraseña</label>
                <div className="relative">
                  <input className="input-field pr-10" type={showPassword ? 'text' : 'password'} placeholder="••••••"
                    value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required />
                  <button type="button" onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--apple-secondary)' }}>
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit" disabled={loading}
                whileHover={{ scale: loading ? 1 : 1.01 }}
                whileTap={{ scale: 0.97 }}
                className="btn-primary w-full justify-center py-3 disabled:opacity-50"
              >
                {loading ? 'Cargando...' : isLogin ? 'Entrar' : 'Registrarse'}
              </motion.button>
            </form>

            <motion.div className="mt-6 text-center" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}>
              <button onClick={() => setIsLogin(!isLogin)} className="text-base font-medium transition-colors hover:opacity-80"
                style={{ color: 'var(--apple-secondary)' }}>
                {isLogin ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Inicia sesión'}
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}