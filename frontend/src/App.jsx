import { lazy, Suspense } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import QueryProvider from './providers/QueryProvider'
import { AnimatePresence, motion } from 'motion/react'
import Layout from './components/Layout'
import ErrorBoundary from './components/ErrorBoundary'
import LoadingSpinner from './components/LoadingSpinner'

const LoginPage = lazy(() => import('./pages/LoginPage'))
const DashboardPage = lazy(() => import('./pages/DashboardPage'))
const AppointmentsPage = lazy(() => import('./pages/AppointmentsPage'))
const CalendarPage = lazy(() => import('./pages/CalendarPage'))
const CashRegisterPage = lazy(() => import('./pages/CashRegisterPage'))
const ClientsPage = lazy(() => import('./pages/ClientsPage'))
const ReportsPage = lazy(() => import('./pages/ReportsPage'))
const PaymentsPage = lazy(() => import('./pages/PaymentsPage'))
const ExpensesPage = lazy(() => import('./pages/ExpensesPage'))
const CatalogPage = lazy(() => import('./pages/CatalogPage'))
const EmployeesPage = lazy(() => import('./pages/EmployeesPage'))
const PromotionsPage = lazy(() => import('./pages/PromotionsPage'))
const CompaniesPage = lazy(() => import('./pages/CompaniesPage'))
const UsersPage = lazy(() => import('./pages/UsersPage'))
const RolesPage = lazy(() => import('./pages/RolesPage'))
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'))

function PageTransition({ children }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -8 }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

function PrivateRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!user) return <LoadingSpinner />
  return children
}

function App() {
  return (
    <ErrorBoundary>
      <QueryProvider>
        <AuthProvider>
          <BrowserRouter>
          <Toaster
            position="top-right"
            toastOptions={{
              style: {
                background: 'var(--apple-card)',
                color: 'var(--apple-text)',
                border: '1px solid var(--apple-border)',
                borderRadius: '12px',
                fontFamily: 'system-ui, -apple-system, sans-serif',
                boxShadow: '0 8px 32px rgba(0,0,0,0.1)',
              },
            }}
          />
          <Suspense fallback={<LoadingSpinner />}>
            <AnimatePresence mode="pop">
              <Routes>
                <Route path="/login" element={
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
                  >
                    <LoginPage />
                  </motion.div>
                } />
                <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
                  <Route index element={<PageTransition><DashboardPage /></PageTransition>} />
                  <Route path="appointments" element={<PageTransition><AppointmentsPage /></PageTransition>} />
                  <Route path="calendar" element={<PageTransition><CalendarPage /></PageTransition>} />
                  <Route path="payments" element={<PageTransition><PaymentsPage /></PageTransition>} />
                  <Route path="expenses" element={<PageTransition><ExpensesPage /></PageTransition>} />
                  <Route path="cash" element={<PageTransition><CashRegisterPage /></PageTransition>} />
                  <Route path="clients" element={<PageTransition><ClientsPage /></PageTransition>} />
                  <Route path="catalog" element={<PageTransition><CatalogPage /></PageTransition>} />
                  <Route path="employees" element={<PageTransition><EmployeesPage /></PageTransition>} />
                  <Route path="promotions" element={<PageTransition><PromotionsPage /></PageTransition>} />
                  <Route path="companies" element={<PageTransition><CompaniesPage /></PageTransition>} />
                  <Route path="users" element={<PageTransition><UsersPage /></PageTransition>} />
                  <Route path="roles" element={<PageTransition><RolesPage /></PageTransition>} />
                  <Route path="reports" element={<PageTransition><ReportsPage /></PageTransition>} />
                  <Route path="*" element={<PageTransition><NotFoundPage /></PageTransition>} />
                </Route>
              </Routes>
            </AnimatePresence>
          </Suspense>
          </BrowserRouter>
        </AuthProvider>
      </QueryProvider>
    </ErrorBoundary>
  )
}

export default App
