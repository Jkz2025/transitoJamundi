import { useState } from 'react'
import SearchForm from '../components/SearchForm.jsx'
import DebtResults from '../components/DebtResults.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import PaymentAgreementModal from '../components/PaymentAgreementModal.jsx'
import PaymentSuccessModal from '../components/PaymentSuccessModal.jsx'
import AgreementSuccessModal from '../components/AgreementSuccessModal.jsx'
import { buscarDeudaMock } from '../data/mockDebts.js'
// import { supabase } from '../lib/supabaseClient.js' // <- usar esto en producción

export default function Consulta() {
  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [modalPago, setModalPago] = useState(null) // { monto } | null
  const [modalAcuerdo, setModalAcuerdo] = useState(null) // { total } | null
  const [modalExito, setModalExito] = useState(null) // pagoInfo | null
  const [modalAcuerdoExito, setModalAcuerdoExito] = useState(null) // acuerdoInfo | null
  const [mensaje, setMensaje] = useState(null)

  async function handleSearch({ modo, valor, resultado }) {
    setLoading(true)
    setMensaje(null)
    setResultado(null)

    // --- INTEGRACIÓN CON WORKER DE CLOUDFLARE (SIMIT) ---
    // El SearchForm ya hace la llamada al Worker y devuelve los datos aquí
    if (resultado) {
      if (resultado.error) {
        setMensaje(resultado.msg || 'Error en la consulta. Por favor intenta nuevamente.')
        setLoading(false)
        return
      }

      // Mapear la respuesta del Worker al formato esperado por el componente
      // El Worker devuelve la respuesta del SIMIT directamente
      setResultado({
        nombre: resultado.ciudadano || resultado.nombre || 'No disponible',
        infracciones: resultado.infracciones || resultado.obligaciones || []
      })
    } else {
      // Fallback al mock si no hay resultado (no debería pasar con la integración)
      await new Promise((r) => setTimeout(r, 500))
      const data = buscarDeudaMock(modo === 'cedula' ? { cedula: valor } : { placa: valor })
      setResultado({ nombre: data.nombre, infracciones: data.infracciones })
    }

    setLoading(false)
  }

  function handleDescargar() {
    // En producción: generar PDF (ej. función Edge que arma el PDF con los
    // mismos datos de la consulta) y disparar la descarga.
    setMensaje('La descarga del PDF con el detalle de tu consulta comenzará en breve.')
  }

  function handleDescargarComprobante() {
    if (!modalExito) return
    
    // Generar y descargar comprobante PDF (simulación)
    const comprobante = {
      referencia: 'TRJ-' + Date.now().toString(36).toUpperCase(),
      fecha: modalExito.fecha,
      monto: modalExito.monto,
      metodo: modalExito.metodo,
      entidad: modalExito.banco || modalExito.celular || '**** ' + (modalExito.tarjeta?.numero?.slice(-4) || ''),
      ciudadano: resultado?.nombre || 'N/A'
    }
    
    // Crear contenido del comprobante
    const contenido = `
COMPROBANTE DE PAGO
Secretaría de Tránsito y Transporte de Jamundí
===============================================

Referencia: ${comprobante.referencia}
Fecha: ${comprobante.fecha}
Ciudadano: ${comprobante.ciudadano}
Monto pagado: $${comprobante.monto.toLocaleString('es-CO')}
Método de pago: ${comprobante.metodo.toUpperCase()}
Entidad: ${comprobante.entidad}

Este documento es un comprobante de simulación.
Para producción, se generará un PDF oficial.
    `.trim()
    
    // Descargar como archivo de texto (simulación de PDF)
    const blob = new Blob([contenido], { type: 'text/plain' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `comprobante_${comprobante.referencia}.txt`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
    
    setMensaje('Comprobante descargado correctamente')
  }

  function handlePagoConfirmado(pagoData) {
    const monto = modalPago?.monto
    setModalPago(null)
    setModalExito({
      ...pagoData,
      monto: monto || 0,
      fecha: new Date().toLocaleString('es-CO')
    })
  }

  function handleAcuerdoConfirmado(opcion) {
    setModalAcuerdo(null)
    setModalAcuerdoExito(opcion)
  }

  function handlePagarCuotaInicial() {
    const cuotaInicial = modalAcuerdoExito?.cuotaInicial
    setModalAcuerdoExito(null)
    if (cuotaInicial) {
      setModalPago({ monto: cuotaInicial, esCuotaInicial: true })
    }
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-10 space-y-8">
      <div className="text-center space-y-2">
        <h1 className="text-3xl sm:text-4xl font-display font-bold text-navy-900">
          Consulta multas y comparendos en Jamundí
        </h1>
        <p className="text-navy-500">
          Busca por número de cédula o placa y resuelve tu situación en un solo lugar.
        </p>
      </div>

      <SearchForm onSearch={handleSearch} loading={loading} />

      {mensaje && (
        <div className="rounded-lg bg-teal/10 border border-teal/30 text-teal-600 px-4 py-3 text-sm">
          {mensaje}
        </div>
      )}

      {resultado && (
        <DebtResults
          resultado={resultado}
          onDescargar={handleDescargar}
          onPagarTotal={(total, infraccionesSeleccionadas) => setModalPago({ monto: total, infracciones: infraccionesSeleccionadas })}
          onAcuerdo={(total, infraccionesSeleccionadas) => setModalAcuerdo({ total, infracciones: infraccionesSeleccionadas })}
        />
      )}

      {modalPago && (
        <PaymentModal
          monto={modalPago.monto}
          onClose={() => setModalPago(null)}
          onConfirm={handlePagoConfirmado}
        />
      )}

      {modalAcuerdo && (
        <PaymentAgreementModal
          totalDeuda={modalAcuerdo.total}
          onClose={() => setModalAcuerdo(null)}
          onConfirm={handleAcuerdoConfirmado}
        />
      )}

      {modalAcuerdoExito && (
        <AgreementSuccessModal
          acuerdo={modalAcuerdoExito}
          onClose={() => setModalAcuerdoExito(null)}
          onPagarInicial={handlePagarCuotaInicial}
        />
      )}

      {modalExito && (
        <PaymentSuccessModal
          pagoInfo={modalExito}
          onClose={() => setModalExito(null)}
          onDescargar={handleDescargarComprobante}
        />
      )}
    </div>
  )
}
