import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../lib/AuthContext.jsx'
import PlateBadge from './PlateBadge.jsx'
import { formatoCOP } from '../lib/agreementEngine.js'
import VerificationRequiredModal from './reconocimientoFacial/VerificationRequiredModal.jsx'
import FacialVerifyModal from './reconocimientoFacial/FacialVerifyModal.jsx'

export default function DebtResults({ resultado, onDescargar, onPagarTotal, onAcuerdo }) {
  const { nombre, infracciones } = resultado
  const { user } = useAuth()
  const navigate = useNavigate()
  const [seleccionados, setSeleccionados] = useState(new Set())
  const [modalVerificacion, setModalVerificacion] = useState(null)
  const [modalFacial, setModalFacial] = useState(null)

  if (!nombre) {
    return (
      <div className="card p-8 text-center">
        <p className="font-display font-semibold text-lg text-navy-700">Sin resultados</p>
        <p className="text-navy-500 mt-1">
          No encontramos comparendos pendientes con ese dato en el municipio de Jamundí.
        </p>
      </div>
    )
  }

  const toggleSeleccion = (infractionId) => {
    const nuevos = new Set(seleccionados)
    if (nuevos.has(infractionId)) {
      nuevos.delete(infractionId)
    } else {
      nuevos.add(infractionId)
    }
    setSeleccionados(nuevos)
  }

  const toggleTodos = () => {
    if (seleccionados.size === infracciones.length) {
      setSeleccionados(new Set())
    } else {
      setSeleccionados(new Set(infracciones.map(i => i.infraction_id)))
    }
  }
  
  //SIMULACION INICIO SESION
  const [verificacionSimulada] = useState({
  puedePagar: false,
  documentos: { completo: false },
  facial: { completo: false },
})

  const infraccionesSeleccionadas = infracciones.filter(i => seleccionados.has(i.infraction_id))
  const totalSeleccionado = infraccionesSeleccionadas.reduce((sum, i) => sum + i.valor_actual, 0)
  const placas = [...new Set(infracciones.map((i) => i.placa).filter(Boolean))]

  const puedePagar = user?.verificacion?.puedePagar
  const faltaDocumentos = !user?.verificacion?.documentos?.completo
  const faltaFacial = !user?.verificacion?.facial?.completo

  // ============================================================
  // VERSIÓN PRODUCCIÓN (con sesión real, documentos y facial)
  // Descomentar y activar cuando se pase a producción real.
  // ============================================================
  // function verificarAntesDePagar(callback, monto, infracciones) {
  //   if (!user) {
  //     navigate('/ingresar')
  //     return
  //   }
  //
  //   if (!puedePagar) {
  //     setModalVerificacion(user.verificacion)
  //     return
  //   }
  //
  //   if (!faltaDocumentos && faltaFacial) {
  //     setModalFacial({ callback, monto, infracciones })
  //     return
  //   }
  //
  //   callback(monto, infracciones)
  // }

  // ============================================================
  // VERSIÓN MAQUETA VISUAL — SESIÓN SIMULADA (ACTIVA)
  // No depende de `user` del AuthContext, no redirige a /ingresar.
  // Abre el modal de documentos con datos ficticios,
  // solo para tomar capturas de pantalla.
  // ⚠️ No usar en producción.
  // ============================================================
  function verificarAntesDePagar(callback, monto, infracciones) {
    setModalVerificacion(verificacionSimulada)
  }

  function handleFacialVerified() {
    setModalFacial(null)
    if (modalFacial?.callback) {
      modalFacial.callback(modalFacial.monto, modalFacial.infracciones)
    }
  }

  return (
    <div className="space-y-5">
      <div className="card p-5 sm:p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm text-navy-400">Ciudadano</p>
          <p className="font-display font-semibold text-xl text-navy-900">{nombre}</p>
          <div className="flex flex-wrap gap-2 mt-2">
            {placas.map((p) => <PlateBadge key={p} placa={p} />)}
          </div>
        </div>
        <div className="text-right">
          <p className="text-sm text-navy-400">Total seleccionado</p>
          <p className="font-display font-bold text-3xl text-navy-900">{formatoCOP(totalSeleccionado)}</p>
          <p className="text-xs text-navy-400">{infraccionesSeleccionadas.length} de {infracciones.length} comparendo(s) seleccionado(s)</p>
        </div>
      </div>

      <div className="card divide-y divide-navy-50">
        <div className="p-4 bg-navy-50 flex items-center gap-3">
          <input
            type="checkbox"
            checked={seleccionados.size === infracciones.length && infracciones.length > 0}
            onChange={toggleTodos}
            className="accent-teal w-5 h-5"
          />
          <label className="text-sm font-medium text-navy-700 cursor-pointer">
            Seleccionar todos ({infracciones.length} comparendos)
          </label>
        </div>
        {infracciones.map((inf) => (
          <div key={inf.infraction_id} className="p-5 sm:p-6 flex items-start gap-4">
            <input
              type="checkbox"
              checked={seleccionados.has(inf.infraction_id)}
              onChange={() => toggleSeleccion(inf.infraction_id)}
              className="accent-teal w-5 h-5 mt-1"
            />
            <div className="flex-1">
              <p className="font-semibold text-navy-900">{inf.descripcion}</p>
              <p className="text-sm text-navy-400 mt-0.5">
                Comparendo N.º {inf.numero_comparendo} · {inf.fecha_infraccion}
                {inf.placa && <> · Placa {inf.placa}</>}
                · Jamundí
              </p>
            </div>
            <div className="text-right">
              <p className="font-display font-semibold text-navy-900 whitespace-nowrap">
                {formatoCOP(inf.valor_actual)}
              </p>
              <button
                onClick={() => verificarAntesDePagar(onPagarTotal, inf.valor_actual, [inf])}
                className="text-xs text-teal-600 hover:text-teal-700 font-medium mt-1"
              >
                Pagar este comparendo
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="card p-5 sm:p-6">
        <p className="font-display font-semibold text-navy-900 mb-4">¿Qué deseas hacer?</p>
        <form onSubmit={(e) => e.preventDefault()} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button type="button" onClick={onDescargar} className="btn-secondary flex flex-col items-start gap-1">
            <span>Descargar consulta</span>
            <span className="text-xs font-normal text-navy-400 text-left">PDF con el detalle de la deuda</span>
          </button>
          <button 
            type="button" 
            onClick={() => verificarAntesDePagar(onPagarTotal, totalSeleccionado, infraccionesSeleccionadas)}
            disabled={infraccionesSeleccionadas.length === 0}
            className="btn-primary flex flex-col items-start gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>Pagar de contado</span>
            <span className="text-xs font-normal text-navy-900/70 text-left">
              {infraccionesSeleccionadas.length > 0 ? formatoCOP(totalSeleccionado) : 'Selecciona comparendos'}
            </span>
          </button>
          <button 
            type="button"
            onClick={() => verificarAntesDePagar(onAcuerdo, totalSeleccionado, infraccionesSeleccionadas)}
            disabled={infraccionesSeleccionadas.length === 0}
                       className="btn-primary flex flex-col items-start gap-1 disabled:opacity-50 disabled:cursor-not-allowed"

            style={{ borderColor: 'rgba(0, 212, 170, 0.4)' }}
          >
            <span>Acuerdo seleccionados</span>
            <span className="text-xs font-normal text-navy-400 text-left">
              {infraccionesSeleccionadas.length > 0 ? `${infraccionesSeleccionadas.length} comparendos` : 'Selecciona comparendos'}
            </span>
          </button>
        </form>
      </div>

      {modalVerificacion && (
      <VerificationRequiredModal
    estado={modalVerificacion}
    onClose={() => setModalVerificacion(null)}
    onCompletarMock={() => {
      setModalVerificacion(null)
      setModalFacial({ callback: () => {}, monto: 0, infracciones: [] })
    }}
  />
      )}

      {modalFacial && (
        <FacialVerifyModal
          onClose={() => setModalFacial(null)}
          onVerified={handleFacialVerified}
        />
      )}
    </div>
  )
}
