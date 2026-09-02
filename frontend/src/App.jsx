import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import { AnimatePresence, motion } from 'motion/react'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import CalendarPage from './pages/CalendarPage'
import CashRegisterPage from './pages/CashRegisterPage'
import ClientsPage from './pages/ClientsPage'
import ReportsPage from './pages/ReportsPage'
import PaymentsPage from './pages/PaymentsPage'
import ExpensesPage from './pages/ExpensesPage'
import CatalogPage from './pages/CatalogPage'
import EmployeesPage from './pages/EmployeesPage'
import PromotionsPage from './pages/PromotionsPage'
import CompaniesPage from './pages/CompaniesPage'
import UsersPage from './pages/UsersPage'
import RolesPage from './pages/RolesPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token, user } = useAuth()
  if (!token) return <Navigate to="/login" />
  if (!user) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin w-8 h-8 border-2 border-brand-500 border-t-transparent rounded-full" />
    </div>
  )
  return children
}

function App() {
  return (
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
              <Route index element={
                <motion.div key="dashboard" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><DashboardPage /></motion.div>
              } />
              <Route path="appointments" element={
                <motion.div key="appointments" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><AppointmentsPage /></motion.div>
              } />
              <Route path="calendar" element={
                <motion.div key="calendar" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><CalendarPage /></motion.div>
              } />
              <Route path="payments" element={
                <motion.div key="payments" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><PaymentsPage /></motion.div>
              } />
              <Route path="expenses" element={
                <motion.div key="expenses" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><ExpensesPage /></motion.div>
              } />
              <Route path="cash" element={
                <motion.div key="cash" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><CashRegisterPage /></motion.div>
              } />
              <Route path="clients" element={
                <motion.div key="clients" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><ClientsPage /></motion.div>
              } />
              <Route path="catalog" element={
                <motion.div key="catalog" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><CatalogPage /></motion.div>
              } />
              <Route path="employees" element={
                <motion.div key="employees" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><EmployeesPage /></motion.div>
              } />
              <Route path="promotions" element={
                <motion.div key="promotions" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><PromotionsPage /></motion.div>
              } />
              <Route path="companies" element={
                <motion.div key="companies" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><CompaniesPage /></motion.div>
              } />
              <Route path="users" element={
                <motion.div key="users" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><UsersPage /></motion.div>
              } />
              <Route path="roles" element={
                <motion.div key="roles" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><RolesPage /></motion.div>
              } />
              <Route path="reports" element={
                <motion.div key="reports" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ type: 'spring', bounce: 0, duration: 0.3 }}><ReportsPage /></motion.div>
              } />
            </Route>
          </Routes>
        </AnimatePresence>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App
