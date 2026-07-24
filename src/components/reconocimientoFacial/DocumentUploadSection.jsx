import { useState } from 'react'
import { useAuth } from '../../lib/AuthContext.jsx'
import { subirDocumentoCedula } from '../../lib/verificationEngine.js'
import CameraCapture from './CameraCapture.jsx'

export default function DocumentUploadSection({ estado, onActualizado }) {
  const { user } = useAuth()
  const [ladoActivo, setLadoActivo] = useState(null) // 'front' | 'back' | null
  const [subiendo, setSubiendo] = useState(false)
  const [errorMsg, setErrorMsg] = useState('')

  async function manejarCaptura(blob) {
    setSubiendo(true)
    setErrorMsg('')
    try {
      await subirDocumentoCedula({ userId: user.id, lado: ladoActivo, blob })
      setLadoActivo(null)
      onActualizado?.()
    } catch (err) {
      setErrorMsg('No pudimos subir el documento. Intenta de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  return (
    <div className="card p-5 space-y-4">
      <div>
        <h3 className="font-display font-semibold text-navy-900">Documento de identidad</h3>
        <p className="text-sm text-navy-400">
          Escanea el frente y el reverso de tu cédula. Es obligatorio para poder pagar comparendos.
        </p>
      </div>

      <div className="grid sm:grid-cols-2 gap-3">
        <TarjetaLado
          titulo="Frente de la cédula"
          listo={!!estado?.documentos?.frontePath}
          onCapturar={() => setLadoActivo('front')}
        />
        <TarjetaLado
          titulo="Reverso de la cédula"
          listo={!!estado?.documentos?.atrasPath}
          onCapturar={() => setLadoActivo('back')}
        />
      </div>

      {errorMsg && <p className="text-sm text-red-600">{errorMsg}</p>}

      {ladoActivo && (
        <div className="fixed inset-0 z-50 bg-navy-900/60 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
            <h4 className="font-display font-semibold text-navy-900">
              {ladoActivo === 'front' ? 'Frente de la cédula' : 'Reverso de la cédula'}
            </h4>
            {subiendo ? (
              <p className="text-sm text-navy-400 text-center py-8">Subiendo documento…</p>
            ) : (
              <CameraCapture
                aspectRatio="card"
                guia="Ubica el documento dentro del recuadro, asegúrate que el texto sea legible"
                onCapture={manejarCaptura}
              />
            )}
            <button type="button" onClick={() => setLadoActivo(null)} className="btn-ghost w-full">
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

function TarjetaLado({ titulo, listo, onCapturar }) {
  return (
    <div className={`rounded-lg border p-4 text-center space-y-2 ${listo ? 'border-teal/40 bg-teal/5' : 'border-navy-200'}`}>
      <p className="text-sm font-medium text-navy-700">{titulo}</p>
      {listo ? (
        <p className="text-teal-600 text-sm font-medium">✓ Cargado</p>
      ) : (
        <p className="text-navy-400 text-xs">Pendiente</p>
      )}
      <button type="button" onClick={onCapturar} className="btn-ghost text-sm w-full">
        {listo ? 'Volver a escanear' : 'Escanear ahora'}
      </button>
    </div>
  )
}
