import { useNavigate } from 'react-router-dom'
import { BentoCard } from '../components/BentoCard'
import { Calendar, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfMonth, endOfMonth, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isToday, addMonths, subMonths } from 'date-fns'
import { es } from 'date-fns/locale'

export default function MonthCalendar({ monthAnchor, setMonthAnchor, aptCounts }) {
  const navigate = useNavigate()
  const monthStart = startOfMonth(monthAnchor)
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 })
  const gridEnd = endOfWeek(endOfMonth(monthAnchor), { weekStartsOn: 1 })
  const calendarDays = eachDayOfInterval({ start: gridStart, end: gridEnd })
  const maxDayCount = Math.max(1, ...Object.values(aptCounts))

  return (
    <BentoCard>
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-brand-500" />
          <h3 className="font-semibold text-apple-text">Citas del mes</h3>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setMonthAnchor(subMonths(monthAnchor, 1))} className="btn-secondary px-2 py-1">
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium capitalize w-40 text-center">
            {format(monthStart, 'MMMM yyyy', { locale: es })}
          </span>
          <button onClick={() => setMonthAnchor(addMonths(monthAnchor, 1))} className="btn-secondary px-2 py-1">
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 gap-1 mb-1.5">
        {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
          <div key={d} className="text-center text-xs text-apple-secondary font-medium py-1">{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {calendarDays.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const count = aptCounts[key] || 0
          const inMonth = isSameMonth(day, monthStart)
          const today = isToday(day)
          const intensity = count / maxDayCount
          return (
            <button
              key={key}
              onClick={() => navigate('/calendar')}
              title={count > 0 ? `${count} cita(s)` : 'Sin citas'}
              className={`relative aspect-square rounded-xl flex flex-col items-center justify-center transition-all duration-200 ${
                inMonth ? 'bg-stone-100 hover:bg-brand-500/15 hover:scale-105' : 'bg-transparent opacity-30'
              } ${today ? 'ring-2 ring-brand-500 shadow-sm' : ''}`}
            >
              <span className={`text-xs ${today ? 'text-brand-600 font-bold' : inMonth ? 'text-apple-text' : 'text-apple-secondary'}`}>
                {format(day, 'd')}
              </span>
              {count > 0 && (
                <span
                  className="mt-0.5 text-[10px] font-bold px-1.5 py-0.5 rounded-full text-white min-w-[20px]"
                  style={{ backgroundColor: `rgba(0, 136, 204, ${0.3 + intensity * 0.5})` }}
                >
                  {count}
                </span>
              )}
            </button>
          )
        })}
      </div>
    </BentoCard>
  )
}
