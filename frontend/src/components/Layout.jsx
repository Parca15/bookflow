import { Outlet, NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import {
  LayoutDashboard,
  Calendar,
  Wallet,
  CreditCard,
  TrendingDown,
  Users,
  Scissors,
  UserCog,
  Percent,
  BarChart3,
  Building2,
  FileText,
  LogOut
} from 'lucide-react'

const ROLE_LABELS = {
  SUPER_ADMIN: 'Super Admin',
  ADMIN: 'Administrador',
  MANAGER: 'Gerente',
  RECEPTIONIST: 'Recepcionista',
  EMPLOYEE: 'Empleado',
}

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/appointments', icon: Calendar, label: 'Citas' },
  { to: '/payments', icon: CreditCard, label: 'Pagos' },
  { to: '/expenses', icon: TrendingDown, label: 'Gastos' },
  { to: '/cash', icon: Wallet, label: 'Caja' },
  { to: '/clients', icon: Users, label: 'Clientes' },
  { to: '/catalog', icon: Scissors, label: 'Catálogo' },
  { to: '/employees', icon: UserCog, label: 'Empleados' },
  { to: '/promotions', icon: Percent, label: 'Promociones' },
  { to: '/invoices', icon: FileText, label: 'Facturación' },
  { to: '/companies', icon: Building2, label: 'Empresas' },
  { to: '/users', icon: Users, label: 'Usuarios' },
  { to: '/reports', icon: BarChart3, label: 'Reportes' },
]

export default function Layout() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="min-h-screen flex">
      {/* Sidebar */}
      <aside className="w-64 bg-gray-900 border-r border-gray-800 flex flex-col">
        <div className="p-6 border-b border-gray-800">
          <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-brand-500 to-brand-700 rounded-xl flex items-center justify-center shadow-lg shadow-brand-500/30">
                <Scissors className="w-5 h-5 text-white" />
              </div>
            <div>
              <h1 className="font-bold text-lg">BookFlow</h1>
              <p className="text-xs text-gray-500">Sistema de Gestión</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive
                    ? 'bg-gradient-to-r from-brand-500/20 to-brand-700/10 text-brand-300 border border-brand-500/40 shadow-lg shadow-brand-500/10'
                    : 'text-gray-400 hover:bg-gray-800 hover:text-gray-200'
                }`
              }
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-800">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 bg-gray-700 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium">
                {user?.fullName?.charAt(0) || 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{user?.fullName}</p>
              <p className="text-xs text-gray-500 truncate">{ROLE_LABELS[user?.role] || user?.role}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-4 py-2 text-gray-400 
                       hover:bg-gray-800 hover:text-red-400 rounded-xl transition-colors"
          >
            <LogOut className="w-4 h-4" />
            <span className="text-sm">Cerrar sesión</span>
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
