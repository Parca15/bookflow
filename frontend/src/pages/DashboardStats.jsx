import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, DollarSign, TrendingUp, Users } from 'lucide-react'
import { BentoStatCard } from '../components/BentoCard'
import { fmt } from './dashboardHelpers'

export default function DashboardStats({ dailyReport }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-4">
      <BentoStatCard icon={DollarSign} label="Ingresos hoy" value={fmt(dailyReport?.totalPayments)} color="green" />
      <BentoStatCard icon={Calendar} label="Citas hoy" value={dailyReport?.totalAppointments || 0} color="brand" />
      <BentoStatCard icon={TrendingUp} label="Neto hoy" value={fmt(dailyReport?.netResult)} color="blue" />
      <BentoStatCard icon={Users} label="Servicios vendidos" value={dailyReport?.totalServicesSold || dailyReport?.topServices?.length || 0} color="purple" />
    </div>
  )
}
