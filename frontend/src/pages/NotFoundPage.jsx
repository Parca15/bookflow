import { Link } from 'react-router-dom'
import { Home } from 'lucide-react'

export default function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center h-[60vh] text-center">
      <h1 className="text-6xl font-bold text-brand-500 mb-4">404</h1>
      <h2 className="text-xl font-semibold mb-2">Página no encontrada</h2>
      <p className="text-[var(--apple-secondary)] mb-6">
        La página que buscas no existe o fue movida.
      </p>
      <Link
        to="/"
        className="btn-primary inline-flex items-center gap-2 px-6 py-2"
      >
        <Home size={18} />
        Volver al inicio
      </Link>
    </div>
  )
}
