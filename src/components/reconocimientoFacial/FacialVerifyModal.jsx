import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext.jsx'
import { verificarRostro } from '../../lib/verificationEngine.js'
import CameraCapture from './CameraCapture.jsx'

export default function FacialVerifyModal({ onClose, onVerified }) {
  const { user } = useAuth()
  const [verificando, setVerificando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function manejarCaptura(blob) {
    setVerificando(true)
    setErrorMsg('')
    try {
      const resultado = await verificarRostro({ userId: user.id, blob })
      if (resultado.match) {
        onVerified()
      } else {
        setErrorMsg('No pudimos confirmar que eres tú. Intenta de nuevo con buena iluminación.')
      }
    } catch (err) {
      setErrorMsg('Ocurrió un error verificando tu rostro. Intenta de nuevo.')
    } finally {
      setVerificando(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-display font-bold text-lg text-navy-900">Confirma que eres tú</h3>
        <p className="text-sm text-navy-500">
          Por seguridad, antes de continuar con el pago necesitamos verificar tu rostro.
        </p>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        {verificando ? (
          <p className="text-sm text-navy-400 text-center py-8">Verificando…</p>
        ) : (
          <CameraCapture
            guia="Centra tu rostro dentro del recuadro"
            aspectRatio="square"
            onCapture={manejarCaptura}
          />
        )}

        <button type="button" onClick={onClose} className="btn-ghost w-full">
          Cancelar
        </button>
      </div>
    </div>
  )
}
