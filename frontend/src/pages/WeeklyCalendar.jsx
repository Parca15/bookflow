import { format, isToday } from 'date-fns'
import { es } from 'date-fns/locale'
import { CreditCard } from 'lucide-react'
import { statusColors, START_HOUR, HOUR_HEIGHT, PX_PER_MIN, getSlot } from './appointmentsHelpers'

const END_HOUR = 21

export default function WeeklyCalendar({ days, byDay, clientMap, employeeMap, onSelectApt, onDayClick }) {
  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, i) => START_HOUR + i)
  const totalHeight = (END_HOUR - START_HOUR) * HOUR_HEIGHT
  const dateKey = (d) => format(d, 'yyyy-MM-dd')

  return (
    <div className="overflow-x-auto rounded-2xl border border-apple-border bg-[var(--apple-card)]/40">
      <div className="flex min-w-[700px]">
        <div className="w-14 lg:w-20 shrink-0 border-r border-apple-border">
          <div className="h-10 lg:h-12 border-b border-apple-border" />
          {hours.map((h) => (
            <div key={h} className="text-right pr-1 lg:pr-2 text-xs lg:text-sm text-apple-secondary" style={{ height: HOUR_HEIGHT }}>
              <span className="-translate-y-3 inline-block">{String(h).padStart(2, '0')}:00</span>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 flex-1">
          {days.map((day) => {
            const key = dateKey(day)
            const dayApts = byDay[key] || []
            return (
              <div key={key} className="border-r border-apple-border last:border-r-0 flex flex-col">
                <div className={`h-10 lg:h-12 border-b border-apple-border flex flex-col items-center justify-center ${isToday(day) ? 'bg-brand-600/10' : ''}`}>
                  <span className="text-xs lg:text-sm text-apple-secondary capitalize">{format(day, 'EEE', { locale: es })}</span>
                  <span className={`text-sm lg:text-lg font-bold ${isToday(day) ? 'text-brand-600' : ''}`}>{format(day, 'd')}</span>
                </div>

                <div className="relative cursor-pointer" style={{ height: totalHeight }} onClick={(e) => onDayClick(day, e)}>
                  <div
                    className="absolute inset-0 pointer-events-none"
                    style={{ backgroundImage: 'linear-gradient(to bottom, rgba(255,255,255,0.05) 1px, transparent 1px)', backgroundSize: `100% ${HOUR_HEIGHT}px` }}
                  />

                  {dayApts.map((apt) => {
                    const { sh, sm, duration } = getSlot(apt)
                    const top = (sh * 60 + sm - START_HOUR * 60) * PX_PER_MIN
                    const height = Math.max(24, duration * PX_PER_MIN - 2)
                    const laneW = 100 / (apt._concurrency || 1)
                    const laneLeft = (apt._lane || 0) * laneW
                    return (
                      <div
                        key={apt.id}
                        onClick={(e) => { e.stopPropagation(); onSelectApt(apt) }}
                        className={`absolute rounded-lg border px-1 lg:px-2 py-1 overflow-hidden hover:brightness-125 transition ${statusColors[apt.status]}`}
                        style={{ top, height, left: `${laneLeft + 0.5}%`, width: `${laneW - 1}%` }}
                        title={`${clientMap[apt.clientId] || ''} · ${apt.startTime}`}
                      >
                        <p className="text-xs lg:text-sm font-semibold truncate">{clientMap[apt.clientId] || `Cliente #${apt.clientId}`}</p>
                        <p className="text-xs lg:text-sm truncate opacity-80">{apt.startTime} · {employeeMap[apt.employeeId] || `#${apt.employeeId}`}</p>
                        {apt.status === 'COMPLETED' && (
                          <div className="absolute bottom-0 left-0 right-0 p-1 lg:p-2">
                            <button
                              onClick={(e) => { e.stopPropagation(); onSelectApt(apt) }}
                              className="btn-primary w-full text-xs py-1 rounded-xl text-left transition-colors"
                              style={{ opacity: 0.9, backgroundColor: 'var(--apple-card)' }}
                            >
                              <CreditCard className="w-3 h-3 mr-1" />Pagar
                            </button>
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
