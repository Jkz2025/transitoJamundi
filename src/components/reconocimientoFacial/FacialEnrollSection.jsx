import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext.jsx'
import { enrolarRostro } from '../../lib/verificationEngine.js'
import CameraCapture from './CameraCapture.jsx'

export default function FacialEnrollSection({ estado, onActualizado }) {
  const { user } = useAuth()
  const [capturando, setCapturando] = useState(false)
  const [guardando, setGuardando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  const completo = estado?.facial?.completo

  async function manejarCaptura(blob) {
    setGuardando(true)
    setErrorMsg('')
    try {
      await enrolarRostro({ userId: user.id, blob })
      setCapturando(false)
      onActualizado?.()
    } catch (err) {
      setErrorMsg('No pudimos guardar tu registro facial. Intenta de nuevo.')
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-navy-900">Reconocimiento facial</h3>
        <p className="text-sm text-navy-400">
          Necesitamos verificar tu rostro una vez. Luego, cada vez que vayas a pagar, te pediremos
          una foto rápida para confirmar que eres tú.
        </p>
      </div>

      {completo ? (
        <div className="rounded-lg border border-teal/40 bg-teal/5 p-4 text-sm text-teal-600 font-medium">
          ✓ Reconocimiento facial completado
        </div>
      ) : (
        <div className="rounded-lg border border-amber-300 bg-amber-50 p-4 text-sm text-amber-700">
          Pendiente. Aún no has registrado tu rostro.
        </div>
      )}

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      {!capturando ? (
        <button type="button" onClick={() => setCapturando(true)} className="btn-primary">
          {completo ? 'Volver a registrar mi rostro' : 'Registrar mi rostro'}
        </button>
      ) : guardando ? (
        <p className="text-sm text-navy-400 text-center py-8">Guardando…</p>
      ) : (
        <CameraCapture
          guia="Centra tu rostro dentro del recuadro, con buena iluminación"
          aspectRatio="square"
          onCapture={manejarCaptura}
        />
      )}
    </div>
  )
}
