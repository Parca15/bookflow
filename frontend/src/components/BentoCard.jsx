export function BentoCard({ children, className = '', span = '' }) {
  const spanClasses = {
    '': '',
    '2col': 'col-span-2',
    '2row': 'row-span-2',
    '2x2': 'col-span-2 row-span-2',
  }

  return (
    <div className={`bento-card ${spanClasses[span] || ''} ${className}`}>
      {children}
    </div>
  )
}

export function BentoStatCard({ icon: Icon, label, value, color = 'brand', trend }) {
  const colorClasses = {
    brand: 'bg-brand-600/20 text-brand-400',
    green: 'bg-emerald-600/20 text-emerald-400',
    blue: 'bg-blue-600/20 text-blue-400',
    orange: 'bg-orange-600/20 text-orange-400',
    red: 'bg-red-600/20 text-red-400',
    purple: 'bg-purple-600/20 text-purple-400',
  }

  return (
    <div className="bento-card group">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-400 mb-1">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && (
            <p className={`text-xs mt-2 ${trend > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
              {trend > 0 ? '+' : ''}{trend}% vs ayer
            </p>
          )}
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
    </div>
  )
}

export function BentoListCard({ title, items, renderItem }) {
  return (
    <div className="bento-card">
      <h3 className="font-semibold mb-4">{title}</h3>
      <div className="space-y-3">
        {items?.map((item, i) => (
          <div key={i}>{renderItem(item, i)}</div>
        ))}
        {(!items || items.length === 0) && (
          <p className="text-gray-500 text-sm">No hay datos</p>
        )}
      </div>
    </div>
  )
}
