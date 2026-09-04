import { useState, useEffect } from 'react'
import { Outlet, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  CalendarDays,
  Wallet,
  TrendingDown,
  Users,
  Scissors,
  UserCog,
  Percent,
  BarChart3,
  Building2,
  Shield,
  LogOut,
  Menu,
  X,
} from 'lucide-react'

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  RECEPTIONIST: 'Recepcionista',
  EMPLOYEE: 'Empleado',
}

const allNavItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', module: 'DASHBOARD' },
  { to: '/calendar', icon: CalendarDays, label: 'Calendario', module: 'CALENDAR' },
  { to: '/expenses', icon: TrendingDown, label: 'Gastos', module: 'EXPENSES' },
  { to: '/cash', icon: Wallet, label: 'Caja', module: 'CASH_REGISTER' },
  { to: '/clients', icon: Users, label: 'Clientes', module: 'CLIENTS' },
  { to: '/catalog', icon: Scissors, label: 'Catálogo', module: 'CATALOG' },
  { to: '/employees', icon: UserCog, label: 'Empleados', module: 'EMPLOYEES' },
  { to: '/promotions', icon: Percent, label: 'Promociones', module: 'PROMOTIONS' },
  { to: '/companies', icon: Building2, label: 'Empresas', module: 'COMPANIES' },
  { to: '/users', icon: Users, label: 'Usuarios', module: 'USERS' },
  { to: '/roles', icon: Shield, label: 'Roles', module: 'USERS' },
  { to: '/reports', icon: BarChart3, label: 'Reportes', module: 'REPORTS' },
]

export default function Layout() {
  const { user, logout, hasPermission } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const navItems = allNavItems.filter((item) => {
    if (!user?.permissions || user.permissions.length === 0) return true
    return hasPermission(item.module)
  })

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 material-solid flex flex-col transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:z-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{ borderColor: 'var(--apple-border)' }}
      >
        <div className="p-5 flex items-center justify-between" style={{ borderBottomColor: 'var(--apple-border)' }}>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center shadow-lg" style={{ boxShadow: '0 4px 16px rgba(0,136,204,0.25)' }}>
              <Scissors className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">BookFlow</h1>
              <p className="text-xs mt-0.5" style={{ color: 'var(--apple-secondary)' }}>Sistema de Gestión</p>
            </div>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-2 rounded-lg hover:bg-apple-hover transition-colors"
            style={{ color: 'var(--apple-secondary)' }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
               className={({ isActive }) =>
                  `flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive
                      ? 'bg-brand-500/15 text-brand-600'
                      : 'hover:bg-apple-hover'
                  }`
               }
              style={{ color: 'var(--apple-secondary)' }}
            >
              <Icon className="w-5 h-5 shrink-0" />
              {label}
            </NavLink>
          ))}
        </nav>

        <div className="p-4" style={{ borderTopColor: 'var(--apple-border)' }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
              <span className="text-xs font-semibold text-white">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{user?.fullName}</p>
              <p className="text-xs" style={{ color: 'var(--apple-secondary)' }}>
                {user?.role ? (ROLE_LABELS[user.role] || user.role) : 'Sin rol'}
                {user?.roleLevel ? ` · Nivel ${user.roleLevel}` : ''}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-medium transition-colors hover:bg-surface-hover"
            style={{ color: 'var(--apple-secondary)' }}
          >
            <LogOut className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-auto min-w-0">
        <div className="lg:hidden sticky top-0 z-30 toolbar px-4 py-3 flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-lg hover:bg-apple-hover transition-colors"
            style={{ color: 'var(--apple-text)' }}
          >
            <Menu className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-brand-500 to-brand-400 flex items-center justify-center">
              <Scissors className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-sm">BookFlow</span>
          </div>
        </div>

        <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
