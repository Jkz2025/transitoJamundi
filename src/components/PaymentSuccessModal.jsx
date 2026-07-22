import { formatoCOP } from '../lib/agreementEngine.js'

export default function PaymentSuccessModal({ pagoInfo, onClose, onDescargar }) {
  const { monto, metodo, banco, celular, tarjeta, fecha } = pagoInfo

  const nombreMetodo = {
    pse: 'PSE',
    nequi: 'Nequi',
    bancolombia: 'Bancolombia',
    tarjeta: 'Tarjeta de crédito/débito'
  }[metodo] || metodo

  const generarReferencia = () => {
    return 'TRJ-' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).substring(2, 6).toUpperCase()
  }

  const referencia = generarReferencia()

  return (
    <div className="fixed inset-0 bg-navy-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          
          <div>
            <p className="font-display font-bold text-2xl text-navy-900">¡Pago realizado con éxito!</p>
            <p className="text-navy-500 mt-1">Tu comparendo ha sido pagado correctamente</p>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-green-700 font-medium">Transacción aprobada</p>
          </div>
          <p className="text-xs text-green-600 mt-1 ml-8">El pago ha sido procesado y confirmado por la entidad financiera.</p>
        </div>

        <div className="card divide-y divide-navy-50">
          <div className="p-4 space-y-3">
            <p className="font-semibold text-navy-900">Detalle del pago</p>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Referencia:</span>
              <span className="font-mono font-semibold text-navy-900">{referencia}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Fecha:</span>
              <span className="font-semibold text-navy-900">{fecha || new Date().toLocaleString('es-CO')}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Monto pagado:</span>
              <span className="font-display font-bold text-lg text-navy-900">{formatoCOP(monto)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Método de pago:</span>
              <span className="font-semibold text-navy-900">{nombreMetodo}</span>
            </div>
            
            {metodo === 'pse' && banco && (
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Banco:</span>
                <span className="font-semibold text-navy-900">{banco}</span>
              </div>
            )}
            
            {(metodo === 'nequi' || metodo === 'bancolombia') && celular && (
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Celular:</span>
                <span className="font-semibold text-navy-900">{celular}</span>
              </div>
            )}
            
            {metodo === 'tarjeta' && tarjeta?.numero && (
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Tarjeta:</span>
                <span className="font-semibold text-navy-900">**** **** **** {tarjeta.numero.slice(-4)}</span>
              </div>
            )}
          </div>
        </div>

        <div className="bg-navy-50 rounded-lg p-4 text-sm text-navy-600 space-y-1">
          <p className="font-semibold text-navy-900">Importante:</p>
          <p>• Guarda este comprobante como respaldo de tu pago.</p>
          <p>• El proceso de actualización en el sistema puede tomar hasta 24 horas.</p>
          <p>• Recibirás una confirmación por correo electrónico.</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onDescargar} className="btn-secondary flex-1 flex items-center justify-center gap-2">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Descargar comprobante
          </button>
          <button onClick={onClose} className="btn-primary flex-1">
            Finalizar
          </button>
        </div>
      </div>
    </div>
  )
}
