import { motion } from 'motion/react'

export function BentoCard({ children, className = '', span = '' }) {
  const spanClasses = {
    '': '',
    '2col': 'col-span-2',
    '2row': 'row-span-2',
    '2x2': 'col-span-2 row-span-2',
  }

  return (
    <motion.div
      className={`bento-card ${spanClasses[span] || ''} ${className}`}
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(30,30,46,0.1)' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
    >
      {children}
    </motion.div>
  )
}

export function BentoStatCard({ icon: Icon, label, value, color = 'brand', trend }) {
  const colorClasses = {
    brand: 'bg-brand-500/20 text-brand-600',
    green: 'bg-mint-500/20 text-mint-600',
    blue: 'bg-brand-500/20 text-brand-600',
    orange: 'bg-brand-500/20 text-brand-600',
    red: 'bg-red-500/20 text-red-700',
    purple: 'bg-brand-400/20 text-brand-600',
  }

  return (
    <motion.div
      className="bento-card group"
      whileHover={{ y: -2, boxShadow: '0 8px 24px rgba(30,30,46,0.1)' }}
      transition={{ type: 'spring', bounce: 0, duration: 0.3 }}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm" style={{ color: 'var(--apple-secondary)' }}>{label}</p>
          <motion.p
            className="text-3xl font-bold tracking-tight"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.4, delay: 0.1 }}
          >
            {value}
          </motion.p>
          {trend && (
            <motion.p
              className={`text-xs mt-2 ${trend > 0 ? 'text-mint-600' : 'text-red-700'}`}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ type: 'spring', bounce: 0, duration: 0.3, delay: 0.2 }}
            >
              {trend > 0 ? '+' : ''}{trend}% vs ayer
            </motion.p>
          )}
        </div>
        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', bounce: 0.3, duration: 0.3 }}
        >
          <Icon className="w-6 h-6" />
        </motion.div>
      </div>
    </motion.div>
  )
}

export function BentoListCard({ title, items, renderItem }) {
  return (
    <div className="bento-card">
      <h3 className="font-semibold mb-4" style={{ color: 'var(--apple-text)' }}>{title}</h3>
      <div className="space-y-3">
        {items?.map((item, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -8 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ type: 'spring', bounce: 0, duration: 0.3, delay: i * 0.05 }}
          >
            {renderItem(item, i)}
          </motion.div>
        ))}
        {(!items || items.length === 0) && (
          <p style={{ color: 'var(--apple-secondary)' }} className="text-sm">No hay datos</p>
        )}
      </div>
    </div>
  )
}