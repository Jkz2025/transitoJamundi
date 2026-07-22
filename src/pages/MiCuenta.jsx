import { useEffect, useState } from 'react'
import { Navigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import { supabase } from '../lib/supabaseClient.js'
import { formatoCOP } from '../lib/agreementEngine.js'

export default function MiCuenta() {
  const { user, loading: authLoading } = useAuth()
  const [acuerdos, setAcuerdos] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!user) return
    async function cargar() {
      const { data } = await supabase
        .from('payment_agreements')
        .select('*, payment_agreement_installments(*)')
        .eq('cedula', user.cedula)
        .order('created_at', { ascending: false })
      setAcuerdos(data ?? [])
      setLoading(false)
    }
    cargar()
  }, [user])

  if (authLoading) return null
  if (!user) return <Navigate to="/ingresar" replace />

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-6">
      <h1 className="text-2xl font-display font-bold text-navy-900">Mi cuenta</h1>

      <div className="card p-5">
        <p className="text-sm text-navy-400">Cédula registrada</p>
        <p className="font-semibold text-navy-900">{user.cedula || 'No registrada'}</p>
      </div>

      <div>
        <h2 className="font-display font-semibold text-lg text-navy-900 mb-3">Mis acuerdos de pago</h2>
        {loading ? (
          <p className="text-navy-400 text-sm">Cargando…</p>
        ) : acuerdos.length === 0 ? (
          <div className="card p-6 text-center text-navy-500">
            Aún no tienes acuerdos de pago activos.
          </div>
        ) : (
          <div className="space-y-3">
            {acuerdos.map((a) => (
              <div key={a.id} className="card p-5">
                <div className="flex items-center justify-between">
                  <p className="font-semibold text-navy-900">{formatoCOP(a.valor_total)}</p>
                  <span className="text-xs px-2 py-1 rounded-full bg-teal/10 text-teal-600 font-medium">
                    {a.estado}
                  </span>
                </div>
                <p className="text-sm text-navy-400 mt-1">
                  {a.numero_cuotas} cuotas de {formatoCOP(a.valor_cuota)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
