import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext.jsx'
import { verificarRostro } from '../../lib/verificationEngine.js'
import CameraCapture from './CameraCapture.jsx'

export default function FacialVerifyModal({ onClose, onVerified }) {
  const { user } = useAuth()
  const [verificando, setVerificando] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  // ============================================================
  // VERSIÓN PRODUCCIÓN (cámara real + verificación real)
  // Descomentar y activar cuando se pase a producción real.
  // ============================================================
  // async function manejarCaptura(blob) {
  //   setVerificando(true)
  //   setErrorMsg('')
  //   try {
  //     const resultado = await verificarRostro({ userId: user.id, blob })
  //     if (resultado.match) {
  //       onVerified()
  //     } else {
  //       setErrorMsg('No pudimos confirmar que eres tú. Intenta de nuevo con buena iluminación.')
  //     }
  //   } catch (err) {
  //     setErrorMsg('Ocurrió un error verificando tu rostro. Intenta de nuevo.')
  //   } finally {
  //     setVerificando(false)
  //   }
  // }

  // ============================================================
  // VERSIÓN MAQUETA VISUAL (ACTIVA)
  // No usa cámara real ni verificarRostro(). Simula un registro
  // facial exitoso en verde, con una imagen ilustrativa.
  // Pensada solo para tomar capturas de pantalla en PC.
  // ⚠️ No usar en producción.
  // ============================================================
  const [verificadoMock, setVerificadoMock] = useState(false)

  function simularRegistro() {
    setVerificando(true)
    setTimeout(() => {
      setVerificando(false)
      setVerificadoMock(true)
    }, 1200)
  }

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-display font-bold text-lg text-navy-900">Confirma que eres tú</h3>
        <p className="text-sm text-navy-500">
          Por seguridad, antes de continuar con el pago necesitamos verificar tu rostro.
        </p>

        {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

        {verificadoMock ? (
          <div className="flex flex-col items-center gap-3 py-6">
            <div className="w-24 h-24 rounded-full bg-teal-50 border-2 border-teal-500 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-12 h-12 text-teal-600" fill="none" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="font-display font-semibold text-teal-600">Registro facial exitoso</p>
            <p className="text-sm text-navy-400 text-center">Tu identidad fue verificada correctamente</p>
          </div>
        ) : verificando ? (
          <p className="text-sm text-navy-400 text-center py-8">Verificando…</p>
        ) : (
          <div className="flex flex-col items-center gap-4 py-6">
            <div className="w-40 h-40 rounded-2xl bg-navy-50 border-2 border-dashed border-navy-200 flex items-center justify-center">
              <svg viewBox="0 0 24 24" className="w-16 h-16 text-navy-300" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 8a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5s8.268 2.943 9.542 7c-1.274 4.057-5.065 7-9.542 7s-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <button type="button" onClick={simularRegistro} className="btn-primary w-full">
              Simular registro facial
            </button>
          </div>
        )}

        <button type="button" onClick={onClose} className="btn-ghost w-full">
          Cancelar
        </button>
      </div>
    </div>
  )
}