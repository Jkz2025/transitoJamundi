import { useState } from 'react'
import { formatoCOP } from '../lib/agreementEngine.js'

const BANCOS_PSE = [
  'Bancolombia', 'Davivienda', 'BBVA Colombia', 'Banco de Bogotá',
  'Banco Popular', 'Banco Caja Social', 'Nequi', 'Daviplata'
]

const METODOS_PAGO = [
  { id: 'pse', nombre: 'PSE', descripcion: 'Débito desde tu banco', icono: '🏦' },
  { id: 'nequi', nombre: 'Nequi', descripcion: 'Paga con tu celular', icono: '📱' },
  { id: 'bancolombia', nombre: 'Bancolombia', descripcion: 'Transferencia o app', icono: '💳' },
  { id: 'tarjeta', nombre: 'Tarjeta', descripcion: 'Crédito o débito', icono: '💳' }
]

export default function PaymentModal({ monto, onClose, onConfirm }) {
  const [metodo, setMetodo] = useState('pse')
  const [banco, setBanco] = useState('')
  const [celular, setCelular] = useState('')
  const [tarjeta, setTarjeta] = useState({ numero: '', nombre: '', expiracion: '', cvv: '' })
  const [procesando, setProcesando] = useState(false)
  const [errores, setErrores] = useState({})
  const [paso, setPaso] = useState('seleccion') // seleccion, formulario, confirmacion

  function validarFormulario() {
    const nuevosErrores = {}
    
    if (metodo === 'pse' && !banco) {
      nuevosErrores.banco = 'Selecciona un banco'
    }
    
    if (metodo === 'nequi') {
      if (!celular || !/^\d{10}$/.test(celular)) {
        nuevosErrores.celular = 'Ingresa un número de celular válido (10 dígitos)'
      }
    }
    
    if (metodo === 'bancolombia') {
      if (!celular || !/^\d{10}$/.test(celular)) {
        nuevosErrores.celular = 'Ingresa un número de celular válido (10 dígitos)'
      }
    }
    
    if (metodo === 'tarjeta') {
      if (!tarjeta.numero || !/^\d{16}$/.test(tarjeta.numero.replace(/\s/g, ''))) {
        nuevosErrores.numero = 'Número de tarjeta inválido'
      }
      if (!tarjeta.nombre || tarjeta.nombre.trim().length < 3) {
        nuevosErrores.nombre = 'Nombre del titular requerido'
      }
      if (!tarjeta.expiracion || !/^(0[1-9]|1[0-2])\/\d{2}$/.test(tarjeta.expiracion)) {
        nuevosErrores.expiracion = 'Formato inválido (MM/AA)'
      }
      if (!tarjeta.cvv || !/^\d{3,4}$/.test(tarjeta.cvv)) {
        nuevosErrores.cvv = 'CVV inválido'
      }
    }
    
    setErrores(nuevosErrores)
    return Object.keys(nuevosErrores).length === 0
  }

  async function handleContinuar() {
    if (paso === 'seleccion') {
      setPaso('formulario')
    } else if (paso === 'formulario') {
      if (validarFormulario()) {
        setPaso('confirmacion')
      }
    }
  }

  async function handlePagar() {
    setProcesando(true)
    // Simulación de proceso de pago (3 segundos)
    await new Promise((r) => setTimeout(r, 3000))
    setProcesando(false)
    onConfirm({ metodo, banco, celular, tarjeta })
  }

  return (
    <div className="fixed inset-0 bg-navy-900/50 flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="bg-white w-full sm:max-w-lg rounded-t-2xl sm:rounded-2xl p-6 space-y-5 max-h-[90vh] overflow-y-auto">
        <div className="flex items-start justify-between">
          <div>
            <p className="font-display font-semibold text-lg text-navy-900">Pagar comparendo</p>
            <p className="text-sm text-navy-400">Valor a pagar</p>
          </div>
          <button onClick={onClose} aria-label="Cerrar" className="text-navy-400 hover:text-navy-700 text-xl leading-none">×</button>
        </div>

        <p className="font-display font-bold text-3xl text-navy-900">{formatoCOP(monto)}</p>

        {paso === 'seleccion' && (
          <>
            <p className="text-sm font-medium text-navy-700">Selecciona el método de pago</p>
            <div className="grid grid-cols-2 gap-3">
              {METODOS_PAGO.map((m) => (
                <button
                  key={m.id}
                  onClick={() => setMetodo(m.id)}
                  className={`rounded-lg border-2 px-4 py-4 text-left font-semibold transition flex items-center gap-3
                    ${metodo === m.id ? 'border-teal bg-teal/5 text-teal-600' : 'border-navy-100 text-navy-600 hover:border-navy-200'}`}
                >
                  <span className="text-2xl">{m.icono}</span>
                  <div>
                    <span className="block">{m.nombre}</span>
                    <span className="block text-xs font-normal text-navy-400">{m.descripcion}</span>
                  </div>
                </button>
              ))}
            </div>
            <button onClick={handleContinuar} className="btn-primary w-full">
              Continuar
            </button>
          </>
        )}

        {paso === 'formulario' && (
          <>
            <button onClick={() => setPaso('seleccion')} className="text-sm text-navy-600 hover:text-navy-900 mb-2">
              ← Cambiar método de pago
            </button>
            
            {metodo === 'pse' && (
              <div className="space-y-4">
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-sm text-red-700 font-medium">⚠️ Serás redirigido a PSE</p>
                  <p className="text-xs text-red-600 mt-1">Selecciona tu banco para continuar con el pago seguro.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Selecciona tu banco</label>
                  <select
                    value={banco}
                    onChange={(e) => setBanco(e.target.value)}
                    className="input-field"
                  >
                    <option value="">Elige un banco…</option>
                    {BANCOS_PSE.map((b) => <option key={b} value={b}>{b}</option>)}
                  </select>
                  {errores.banco && <p className="text-sm text-red-600 mt-1">{errores.banco}</p>}
                </div>
              </div>
            )}

            {metodo === 'nequi' && (
              <div className="space-y-4">
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-sm text-green-700 font-medium">📱 Pago con Nequi</p>
                  <p className="text-xs text-green-600 mt-1">Ingresa tu número de celular para recibir la solicitud de pago.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Número de celular</label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="300 123 4567"
                    className="input-field"
                    maxLength={10}
                  />
                  {errores.celular && <p className="text-sm text-red-600 mt-1">{errores.celular}</p>}
                </div>
              </div>
            )}

            {metodo === 'bancolombia' && (
              <div className="space-y-4">
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-yellow-700 font-medium">💳 Pago Bancolombia</p>
                  <p className="text-xs text-yellow-600 mt-1">Puedes pagar desde la app Bancolombia o con transferencia.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Número de celular</label>
                  <input
                    type="tel"
                    value={celular}
                    onChange={(e) => setCelular(e.target.value.replace(/\D/g, '').slice(0, 10))}
                    placeholder="300 123 4567"
                    className="input-field"
                    maxLength={10}
                  />
                  {errores.celular && <p className="text-sm text-red-600 mt-1">{errores.celular}</p>}
                </div>
              </div>
            )}

            {metodo === 'tarjeta' && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-sm text-blue-700 font-medium">💳 Tarjeta de crédito/débito</p>
                  <p className="text-xs text-blue-600 mt-1">Transacción segura con encriptación SSL.</p>
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Número de tarjeta</label>
                  <input
                    type="text"
                    value={tarjeta.numero}
                    onChange={(e) => setTarjeta({ ...tarjeta, numero: e.target.value.replace(/\D/g, '').replace(/(\d{4})(?=\d)/g, '$1 ') })}
                    placeholder="1234 5678 9012 3456"
                    className="input-field"
                    maxLength={19}
                  />
                  {errores.numero && <p className="text-sm text-red-600 mt-1">{errores.numero}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-navy-700 mb-1.5">Nombre del titular</label>
                  <input
                    type="text"
                    value={tarjeta.nombre}
                    onChange={(e) => setTarjeta({ ...tarjeta, nombre: e.target.value.toUpperCase() })}
                    placeholder="JUAN PEREZ"
                    className="input-field"
                  />
                  {errores.nombre && <p className="text-sm text-red-600 mt-1">{errores.nombre}</p>}
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">Vencimiento</label>
                    <input
                      type="text"
                      value={tarjeta.expiracion}
                      onChange={(e) => {
                        let val = e.target.value.replace(/\D/g, '')
                        if (val.length >= 2) val = val.slice(0, 2) + '/' + val.slice(2)
                        setTarjeta({ ...tarjeta, expiracion: val })
                      }}
                      placeholder="MM/AA"
                      className="input-field"
                      maxLength={5}
                    />
                    {errores.expiracion && <p className="text-sm text-red-600 mt-1">{errores.expiracion}</p>}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-navy-700 mb-1.5">CVV</label>
                    <input
                      type="password"
                      value={tarjeta.cvv}
                      onChange={(e) => setTarjeta({ ...tarjeta, cvv: e.target.value.replace(/\D/g, '') })}
                      placeholder="123"
                      className="input-field"
                      maxLength={4}
                    />
                    {errores.cvv && <p className="text-sm text-red-600 mt-1">{errores.cvv}</p>}
                  </div>
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button onClick={() => setPaso('seleccion')} className="btn-secondary flex-1">
                Atrás
              </button>
              <button onClick={handleContinuar} className="btn-primary flex-1">
                Continuar
              </button>
            </div>
          </>
        )}

        {paso === 'confirmacion' && (
          <>
            <div className="bg-navy-50 rounded-lg p-4 space-y-3">
              <p className="font-semibold text-navy-900">Resumen del pago</p>
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Monto a pagar:</span>
                <span className="font-semibold text-navy-900">{formatoCOP(monto)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-navy-600">Método:</span>
                <span className="font-semibold text-navy-900">{METODOS_PAGO.find(m => m.id === metodo)?.nombre}</span>
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
              {metodo === 'tarjeta' && tarjeta.numero && (
                <div className="flex justify-between text-sm">
                  <span className="text-navy-600">Tarjeta:</span>
                  <span className="font-semibold text-navy-900">**** **** **** {tarjeta.numero.slice(-4)}</span>
                </div>
              )}
            </div>
            
            <button
              onClick={handlePagar}
              disabled={procesando}
              className="btn-primary w-full"
            >
              {procesando ? (
                <span className="flex items-center justify-center gap-2">
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Procesando pago...
                </span>
              ) : (
                `Pagar ${formatoCOP(monto)}`
              )}
            </button>
          </>
        )}
      </div>
    </div>
  )
}
