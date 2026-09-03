import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { useQuery } from '@tanstack/react-query'
import { reportService } from '../services/reportService'
import LoadingSpinner from '../components/LoadingSpinner'
import DashboardStats from './DashboardStats'
import TodayAgenda from './TodayAgenda'
import PaymentMethods from './PaymentMethods'
import CashCard from './CashCard'
import ExpensesCard from './ExpensesCard'
import MonthlySummary from './MonthlySummary'
import { TopServices, RecentAppointments } from './ServiceCards'
import MonthCalendar from './MonthCalendar'
import { format } from 'date-fns'
import { es } from 'date-fns/locale'

export default function DashboardPage() {
  const { user } = useAuth()
  const [monthAnchor, setMonthAnchor] = useState(new Date())

  const { data: res, isLoading } = useQuery({
    queryKey: ['dashboard', user?.companyId],
    queryFn: () => reportService.getDashboard(user.companyId),
    enabled: !!user?.companyId,
    staleTime: 30_000,
  })

  const d = res?.data

  if (isLoading || !d) return <LoadingSpinner />

  const dailyReport = {
    totalPayments: d.todayPayments,
    totalAppointments: d.todayAppointments,
    netResult: d.todayNetResult,
    totalServicesSold: d.topServices?.length || 0,
    cashPayments: d.cashPayments,
    cardPayments: d.cardPayments,
    transferPayments: d.transferPayments,
    otherPayments: d.otherPayments,
    cashExpenses: d.cashExpenses,
    cardExpenses: d.cardExpenses,
    transferExpenses: d.transferExpenses,
    otherExpenses: d.otherExpenses,
    totalExpenses: d.totalExpenses,
    topServices: d.topServices,
    recentAppointments: d.recentAppointments,
  }

  const monthlyReport = {
    totalPayments: d.monthlyPayments,
    totalExpenses: d.monthlyExpenses,
    netResult: d.monthlyNetResult,
    totalAppointments: d.monthlyTotalAppointments,
    completedAppointments: d.monthlyCompletedAppointments,
    cancelledAppointments: d.monthlyCancelledAppointments,
  }

  const clientMap = {}
  d.todayAppointmentsList?.forEach((a) => { clientMap[a.id] = a.clientName })

  const todayAppointments = (d.todayAppointmentsList || []).map((a) => ({
    id: a.id,
    clientId: a.id,
    startTime: a.startTime,
    endTime: a.endTime,
    status: a.status,
    totalPrice: a.totalPrice,
    services: a.serviceNames?.map((name) => ({ name })),
  }))

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-apple-secondary mt-1">{format(new Date(), "EEEE d 'de' MMMM, yyyy", { locale: es })}</p>
      </div>

      <DashboardStats dailyReport={dailyReport} />

      <div className="grid grid-cols-3 gap-4 mb-4">
        <TodayAgenda todayAppointments={todayAppointments} clientMap={clientMap} />
        <PaymentMethods dailyReport={dailyReport} />
      </div>

      <div className="grid grid-cols-3 gap-4 mb-4">
        <CashCard cashRegister={d.cashRegister} />
        <ExpensesCard dailyReport={dailyReport} />
        <MonthlySummary monthlyReport={monthlyReport} />
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <TopServices topServices={dailyReport.topServices} />
        <RecentAppointments recentAppointments={dailyReport.recentAppointments} />
      </div>

      <MonthCalendar monthAnchor={monthAnchor} setMonthAnchor={setMonthAnchor} aptCounts={d.appointmentCountsByDate || {}} />
    </div>
  )
}
