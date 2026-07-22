import { formatoCOP } from '../lib/agreementEngine.js'

export default function AgreementSuccessModal({ acuerdo, onClose, onPagarInicial }) {
  const { cuotaInicial, numeroCuotas, valorCuota, fechasEstimadas } = acuerdo

  return (
    <div className="fixed inset-0 bg-navy-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="text-center space-y-4">
          <div className="w-20 h-20 bg-teal/10 rounded-full flex items-center justify-center mx-auto">
            <svg className="w-10 h-10 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <div>
            <p className="font-display font-bold text-2xl text-navy-900">¡Acuerdo de pago creado!</p>
            <p className="text-navy-500 mt-1">Tu acuerdo ha sido registrado exitosamente</p>
          </div>
        </div>

        <div className="bg-teal/10 border border-teal/30 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-teal-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-sm text-teal-700 font-medium">Importante: Paga tu cuota inicial hoy</p>
          </div>
          <p className="text-xs text-teal-600 mt-1 ml-8">Para activar el acuerdo, debes pagar la cuota inicial dentro de las próximas 24 horas.</p>
        </div>

        <div className="card divide-y divide-navy-50">
          <div className="p-4 space-y-3">
            <p className="font-semibold text-navy-900">Detalle del acuerdo</p>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Cuota inicial (hoy):</span>
              <span className="font-display font-bold text-lg text-navy-900">{formatoCOP(cuotaInicial)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Número de cuotas:</span>
              <span className="font-semibold text-navy-900">{numeroCuotas}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Valor de cada cuota:</span>
              <span className="font-semibold text-navy-900">{formatoCOP(valorCuota)}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Primer vencimiento:</span>
              <span className="font-semibold text-navy-900">{fechasEstimadas[0]}</span>
            </div>
            
            <div className="flex justify-between text-sm">
              <span className="text-navy-600">Último vencimiento:</span>
              <span className="font-semibold text-navy-900">{fechasEstimadas[fechasEstimadas.length - 1]}</span>
            </div>
          </div>
        </div>

        <div className="bg-navy-50 rounded-lg p-4 text-sm text-navy-600 space-y-1">
          <p className="font-semibold text-navy-900">Condiciones del acuerdo:</p>
          <p>• La cuota inicial debe pagarse hoy para activar el acuerdo.</p>
          <p>• Las cuotas mensuales se pagan el mismo día de cada mes.</p>
          <p>• Si incumples una cuota, el acuerdo puede quedar sin efecto.</p>
          <p>• Puedes ver y pagar tus cuotas desde "Mi cuenta".</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <button onClick={onPagarInicial} className="btn-primary flex-1">
            Pagar cuota inicial ahora ({formatoCOP(cuotaInicial)})
          </button>
          <button onClick={onClose} className="btn-secondary flex-1">
            Pagar después
          </button>
        </div>
      </div>
    </div>
  )
}
