import { useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../../lib/AuthContext.jsx'
import { supabase } from '../../lib/supabaseClient.js'
import DocumentUploadSection from '../reconocimientoFacial/DocumentUploadSection.jsx'
import FacialEnrollSection from '../reconocimientoFacial/FacialEnrollSection.jsx'

export default function Ajustes() {
  const { user, loading: authLoading, refreshVerificacion } = useAuth()
  const [nombre, setNombre] = useState(user?.nombre ?? '')
  const [apellidos, setApellidos] = useState(user?.apellidos ?? '')
  const [telefono, setTelefono] = useState(user?.telefono ?? '')
  const [guardando, setGuardando] = useState(false)
  const [mensaje, setMensaje] = useState('')

  if (authLoading) return null
  if (!user) return <Navigate to="/ingresar" replace />

  async function guardarPerfil(e) {
    e.preventDefault()
    setGuardando(true)
    setMensaje('')
    const { error } = await supabase
      .from('profiles_transito')
      .update({ nombre, apellidos, telefono })
      .eq('id', user.id)
    setGuardando(false)
    setMensaje(error ? 'No pudimos guardar los cambios.' : 'Datos actualizados correctamente.')
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-display font-bold text-navy-900">Ajustes de mi cuenta</h1>

      <form onSubmit={guardarPerfil} className="card p-5 space-y-4">
        <h3 className="font-display font-semibold text-navy-900">Datos personales</h3>
        <div className="grid sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Nombre</label>
            <input value={nombre} onChange={(e) => setNombre(e.target.value)} className="input-field" />
          </div>
          <div>
            <label className="block text-sm font-medium text-navy-700 mb-1.5">Apellidos</label>
            <input value={apellidos} onChange={(e) => setApellidos(e.target.value)} className="input-field" />
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Teléfono</label>
          <input
            value={telefono}
            onChange={(e) => setTelefono(e.target.value)}
            className="input-field"
            inputMode="numeric"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-navy-700 mb-1.5">Correo electrónico</label>
          {/* Si el usuario ingresó con Google, este correo ya viene precargado desde auth.users */}
          <input value={user.email} disabled className="input-field bg-navy-50 text-navy-400" />
        </div>

        {mensaje && <p className="text-sm text-navy-500">{mensaje}</p>}

        <button type="submit" disabled={guardando} className="btn-primary">
          {guardando ? 'Guardando…' : 'Guardar cambios'}
        </button>
      </form>

      <DocumentUploadSection estado={user.verificacion} onActualizado={refreshVerificacion} />
      <FacialEnrollSection estado={user.verificacion} onActualizado={refreshVerificacion} />
    </div>
  )
}
