import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'

export default function Login() {
  const [modo, setModo] = useState('ingresar') // 'ingresar' | 'registrar'
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [cedula, setCedula] = useState('')
  const [telefono, setTelefono] = useState('')
  const [nombre, setNombre] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const { signInWithPassword, signUp } = useAuth()
  const navigate = useNavigate()

  async function handleSubmit(e) {
    e.preventDefault()
    setError('')
    setLoading(true)
    const { error } =
      modo === 'ingresar'
        ? await signInWithPassword(email, password)
        : await signUp({ email, password, cedula, nombre })
    setLoading(false)
    if (error) {
      setError(traducirError(error.message))
      return
    }
    navigate('/mi-cuenta')
  }

  return (
    <div className="max-w-md mx-auto px-4 py-12">
      <div className="card p-6 sm:p-8">
        <h1 className="font-display font-bold text-2xl text-navy-900 mb-1">
          {modo === 'ingresar' ? 'Ingresa a tu cuenta' : 'Crea tu cuenta'}
        </h1>
        <p className="text-sm text-navy-400 mb-6">
          Con tu cuenta puedes ver el historial de tus acuerdos de pago y comparendos.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {modo === 'registrar' && (
            <>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Nombre completo</label>
                <input value={nombre} onChange={(e) => setNombre(e.target.value)} required className="input-field font-body" />
              </div>
              <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Cédula</label>
                <input value={cedula} onChange={(e) => setCedula(e.target.value)} required className="input-field" inputMode="numeric" />
              </div>
               <div>
                <label className="block text-sm font-medium text-navy-700 mb-1.5">Telefono</label>
                <input value={telefono} onChange={(e) => setTelefono(e.target.value)} required className="input-field" inputMode="numeric" />
              </div>
            </>
          )}
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Correo electrónico</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required className="input-field font-body" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Contraseña</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required minLength={6} className="input-field font-body" />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Un momento…' : modo === 'ingresar' ? 'Ingresar' : 'Crear cuenta'}
          </button>
        </form>

        <button
          onClick={() => setModo(modo === 'ingresar' ? 'registrar' : 'ingresar')}
          className="btn-ghost text-sm mt-5"
        >
          {modo === 'ingresar' ? '¿No tienes cuenta? Regístrate' : '¿Ya tienes cuenta? Ingresa'}
        </button>
      </div>
    </div>
  )
}

function traducirError(msg) {
  if (msg.includes('Invalid login credentials')) return 'Correo o contraseña incorrectos.'
  if (msg.includes('already registered')) return 'Ese correo ya tiene una cuenta.'
  return 'Ocurrió un error. Intenta de nuevo.'
}
