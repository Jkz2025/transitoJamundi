import { useMemo, useState } from 'react'
import { calcularOpcionesAcuerdo, formatoCOP } from '../lib/agreementEngine.js'

export default function PaymentAgreementModal({ totalDeuda, onClose, onConfirm }) {
  const opciones = useMemo(() => calcularOpcionesAcuerdo(totalDeuda), [totalDeuda])
  const [seleccion, setSeleccion] = useState(opciones[0] ?? null)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)
  const [creando, setCreando] = useState(false)

  async function handleConfirmar() {
    setCreando(true)
    // Aquí el frontend inserta en `payment_agreements` + `payment_agreement_installments`
    // (o llama a una función RPC que lo hace de forma transaccional en el backend).
    await new Promise((r) => setTimeout(r, 700))
    setCreando(false)
    onConfirm(seleccion)
  }

  return (
    <div className="fixed inset-0 bg-navy-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display font-semibold text-lg text-navy-900">Acuerdo de pago</p>
            <p className="text-sm text-navy-400">Deuda total: {formatoCOP(totalDeuda)}</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-navy-400 hover:text-navy-700 text-xl leading-none">×</button>
        </div>

        {opciones.length === 0 ? (
          <p className="text-navy-600">
            El valor de tu deuda no permite generar un acuerdo automático. Comunícate con la
            Secretaría de Tránsito de Jamundí para una evaluación personalizada.
          </p>
        ) : (
          <>
            <p className="text-sm text-navy-500">
              Elige en cuántas cuotas quieres pagar. La cuota inicial y el valor de cada cuota
              se calculan según la reglamentación vigente del municipio.
            </p>

            <div className="space-y-2">
              {opciones.map((op) => (
                <label
                  key={op.numeroCuotas}
                  className={`flex items-center justify-between gap-4 rounded-lg border-2 px-4 py-3 cursor-pointer transition
                    ${seleccion?.numeroCuotas === op.numeroCuotas ? 'border-teal bg-teal/5' : 'border-navy-100'}`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="cuotas"
                      checked={seleccion?.numeroCuotas === op.numeroCuotas}
                      onChange={() => setSeleccion(op)}
                      className="accent-teal"
                    />
                    <div>
                      <p className="font-semibold text-navy-900">{op.numeroCuotas} cuotas</p>
                      <p className="text-xs text-navy-400">
                        Inicial {formatoCOP(op.cuotaInicial)} + {op.numeroCuotas} × {formatoCOP(op.valorCuota)}
                      </p>
                    </div>
                  </div>
                </label>
              ))}
            </div>

            {seleccion && (
              <div className="rounded-lg bg-navy-50 p-4 text-sm text-navy-700 space-y-1">
                <p className="font-semibold text-navy-900">Resumen del acuerdo</p>
                <p>Cuota inicial (hoy): {formatoCOP(seleccion.cuotaInicial)}</p>
                <p>Cuotas mensuales: {seleccion.numeroCuotas} × {formatoCOP(seleccion.valorCuota)}</p>
                <p>Primer vencimiento: {seleccion.fechasEstimadas[0]}</p>
              </div>
            )}

            <label className="flex items-start gap-2 text-sm text-navy-600">
              <input
                type="checkbox"
                checked={aceptaTerminos}
                onChange={(e) => setAceptaTerminos(e.target.checked)}
                className="mt-0.5 accent-teal"
              />
              <span>
                Entiendo que si incumplo una cuota, el acuerdo puede quedar sin efecto y la deuda
                vuelve a su estado original con los recargos aplicables.
              </span>
            </label>

            <button
              onClick={handleConfirmar}
              disabled={!aceptaTerminos || creando}
              className="btn-primary w-full"
            >
              {creando ? 'Generando acuerdo…' : 'Confirmar acuerdo de pago'}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
