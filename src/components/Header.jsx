import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Header() {
  const { user, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <header className="border-b border-navy-100 bg-white">
      <div className="bg-navy-900 text-navy-50 text-xs">
        <div className="max-w-6xl mx-auto px-4 py-1.5 flex items-center justify-between">
          <span>Jamundí · Valle del Cauca</span>
          <span className="hidden sm:inline">Portal oficial de trámites de tránsito</span>
        </div>
      </div>
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="h-11 w-11 rounded-full bg-navy-700 flex items-center justify-center text-gold font-display font-bold text-lg">
            TJ
          </div>
          <div className="leading-tight">
            <p className="font-display font-semibold text-lg text-navy-900">Secretaría de movilidad y Seguridad Vial</p>
            <p className="text-xs text-navy-400">Consulta y pago de comparendos</p>
          </div>
        </Link>

        <nav className="flex items-center gap-3">
          {user ? (
            <>
              <span className="hidden sm:block text-sm text-navy-600">
                Hola, <strong className="font-semibold">{user.nombre || user.email}</strong>
              </span>
              <button
                onClick={async () => { await signOut(); navigate('/') }}
                className="btn-ghost text-sm"
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link to="/ingresar" className="btn-secondary text-sm !px-4 !py-2">
              Iniciar sesión
            </Link>
          )}
        </nav>
      </div>
    </header>
  )
}
