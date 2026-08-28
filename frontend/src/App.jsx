import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider, useAuth } from './context/AuthContext'
import LoginPage from './pages/LoginPage'
import DashboardPage from './pages/DashboardPage'
import AppointmentsPage from './pages/AppointmentsPage'
import CashRegisterPage from './pages/CashRegisterPage'
import ClientsPage from './pages/ClientsPage'
import ReportsPage from './pages/ReportsPage'
import PaymentsPage from './pages/PaymentsPage'
import ExpensesPage from './pages/ExpensesPage'
import CatalogPage from './pages/CatalogPage'
import EmployeesPage from './pages/EmployeesPage'
import PromotionsPage from './pages/PromotionsPage'
import CompaniesPage from './pages/CompaniesPage'
import InvoicesPage from './pages/InvoicesPage'
import UsersPage from './pages/UsersPage'
import Layout from './components/Layout'

function PrivateRoute({ children }) {
  const { token } = useAuth()
  return token ? children : <Navigate to="/login" />
}

function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/" element={<PrivateRoute><Layout /></PrivateRoute>}>
            <Route index element={<DashboardPage />} />
            <Route path="appointments" element={<AppointmentsPage />} />
            <Route path="payments" element={<PaymentsPage />} />
            <Route path="expenses" element={<ExpensesPage />} />
            <Route path="cash" element={<CashRegisterPage />} />
            <Route path="clients" element={<ClientsPage />} />
            <Route path="catalog" element={<CatalogPage />} />
            <Route path="employees" element={<EmployeesPage />} />
            <Route path="promotions" element={<PromotionsPage />} />
            <Route path="companies" element={<CompaniesPage />} />
            <Route path="invoices" element={<InvoicesPage />} />
            <Route path="users" element={<UsersPage />} />
            <Route path="reports" element={<ReportsPage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App