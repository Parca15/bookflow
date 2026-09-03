import { format, isSameMonth, isToday, isSameDay } from 'date-fns'
import { statusLabels, statusDots } from './calendarHelpers'

export default function CalendarGrid({ calendarDays, currentDate, selectedDate, onSelectDate, getStatusCounts }) {
  return (
    <div className="flex-1">
      <div className="bg-[var(--apple-card)] rounded-2xl border border-apple-border p-4">
        <div className="grid grid-cols-7 gap-1 mb-1">
          {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map((d) => (
            <div key={d} className="text-center text-base text-apple-secondary font-medium py-2">{d}</div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {calendarDays.map((day) => {
            const key = format(day, 'yyyy-MM-dd')
            const inMonth = isSameMonth(day, currentDate)
            const today = isToday(day)
            const selected = isSameDay(day, selectedDate)
            const counts = getStatusCounts(day)
            const totalDay = Object.values(counts).reduce((a, b) => a + b, 0)
            const dotEntries = Object.entries(counts).slice(0, 4)

            return (
              <button
                key={key}
                onClick={() => onSelectDate(day)}
                className={`relative rounded-xl flex flex-col items-center justify-center p-2 min-h-[72px] transition-all duration-150 ${
                  selected
                    ? 'bg-brand-500/15 ring-2 ring-brand-500'
                    : inMonth
                      ? 'bg-stone-100 hover:bg-brand-500/10'
                      : 'bg-transparent opacity-40'
                } ${today ? 'ring-2 ring-brand-500' : ''}`}
              >
                <span className={`text-base ${today ? 'text-brand-600 font-bold' : inMonth ? 'text-apple-text' : 'text-apple-secondary'}`}>
                  {format(day, 'd')}
                </span>
                {totalDay > 0 && (
                  <div className="flex gap-0.5 mt-1">
                    {dotEntries.map(([status, count]) => (
                      <span
                        key={status}
                        className={`w-1.5 h-1.5 rounded-full ${statusDots[status]}`}
                        title={`${count} ${statusLabels[status]}`}
                      />
                    ))}
                  </div>
                )}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
