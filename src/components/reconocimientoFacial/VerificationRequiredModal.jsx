import { useNavigate } from 'react-router-dom'

export default function VerificationRequiredModal({ estado, onClose }) {
  const navigate = useNavigate()

  const faltaDocumentos = !estado?.documentos?.completo
  const faltaFacial = !estado?.facial?.completo

  return (
    <div className="fixed inset-0 z-50 bg-navy-900/60 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl p-6 max-w-md w-full space-y-4">
        <h3 className="font-display font-bold text-lg text-navy-900">Verificación pendiente</h3>
        <p className="text-sm text-navy-500">
          Antes de pagar, necesitamos que completes estos pasos de verificación:
        </p>

        <ul className="space-y-2 text-sm">
          <li className={`flex items-center gap-2 ${faltaDocumentos ? 'text-amber-700' : 'text-teal-600'}`}>
            {faltaDocumentos ? '○' : '✓'} Escanear frente y reverso de la cédula
          </li>
          <li className={`flex items-center gap-2 ${faltaFacial ? 'text-amber-700' : 'text-teal-600'}`}>
            {faltaFacial ? '○' : '✓'} Registrar reconocimiento facial
          </li>
        </ul>

        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="btn-ghost flex-1">
            Cancelar
          </button>
          <button type="button" onClick={() => navigate('/ajustes')} className="btn-primary flex-1">
            Completar ahora
          </button>
        </div>
      </div>
    </div>
  )
}
