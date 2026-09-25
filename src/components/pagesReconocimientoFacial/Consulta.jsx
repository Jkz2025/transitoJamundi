import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SearchForm from '../components/SearchForm.jsx'
import DebtResults from '../components/DebtResults.jsx'
import PaymentModal from '../components/PaymentModal.jsx'
import PaymentAgreementModal from '../components/PaymentAgreementModal.jsx'
import PaymentSuccessModal from '../components/PaymentSuccessModal.jsx'
import AgreementSuccessModal from '../components/AgreementSuccessModal.jsx'
import VerificationRequiredModal from '../components/VerificationRequiredModal.jsx'
import FacialVerifyModal from '../components/FacialVerifyModal.jsx'
import { useAuth } from '../lib/AuthContext.jsx'
import { buscarDeudaMock } from '../data/mockDebts.js'
// import { supabase } from '../lib/supabaseClient.js' // <- usar esto en producción

export default function Consulta() {
  const { user, refreshVerificacion } = useAuth()
  const navigate = useNavigate()

  const [loading, setLoading] = useState(false)
  const [resultado, setResultado] = useState(null)
  const [modalPago, setModalPago] = useState(null) // { monto } | null
  const [modalAcuerdo, setModalAcuerdo] = useState(null) // { total } | null
  const [modalExito, setModalExito] = useState(null) // pagoInfo | null
  const [modalAcuerdoExito, setModalAcuerdoExito] = useState(null) // acuerdoInfo | null
  const [mensaje, setMensaje] = useState(null)

  // --- Flujo de verificación previo a cualquier pago o acuerdo ---
  const [modalVerificacionRequerida, setModalVerificacionRequerida] = useState(false)
  const [modalFacialPendiente, setModalFacialPendiente] = useState(false)
  const [accionPendiente, setAccionPendiente] = useState(null) // función a ejecutar tras verificar el rostro

  async function handleSearch({ modo, valor, resultado }) {
    setLoading(true)
    setMensaje(null)
    setResultado(null)

    console.log("Datos recibidos del API:", resultado);

    // --- INTEGRACIÓN CON WORKER DE CLOUDFLARE (SIMIT) ---
    // El SearchForm ya hace la llamada al Worker y devuelve los datos aquí
    if (resultado) {
      if (resultado.error) {
        setMensaje(resultado.msg || 'Error en la consulta. Por favor intenta nuevamente.')
        setLoading(false)
        return
      }

      // Mapear la respuesta del SIMIT al formato esperado por el componente
      // El SIMIT devuelve datos en formato respuestaApi.multas
      let datosSimit = resultado.respuestaApi || resultado;

      // Extraer nombre del ciudadano de la estructura del SIMIT
      const ciudadano = datosSimit.multas?.[0]?.infractor?.nombre ||
                       datosSimit.multas?.[0]?.infractor?.primerNombre + ' ' +
                       datosSimit.multas?.[0]?.infractor?.primerApellido ||
                       resultado.ciudadano ||
                       resultado.nombre ||
                       'No disponible';

      // Transformar las multas al formato de infracciones que espera el componente
      const infracciones = (datosSimit.multas || []).map((multa, index) => ({
        infraction_id: multa.numeroComparendo || multa.consecutivoComparendo || `INF-${index}`,
        descripcion: multa.infracciones?.[0]?.descripcionInfracc || multa.infracciones?.[0]?.descripcion || 'Comparendo',
        numero_comparendo: multa.numeroComparendo || multa.numeroResolucion || 'N/A',
        fecha_infraccion: multa.fechaComparendo || multa.fechaResolucion || 'N/A',
        placa: multa.placa || 'N/A',
        valor_actual: multa.valorPagar || multa.valor || 0
      }));

      console.log("Datos procesados:", { ciudadano, infracciones });

      setResultado({
        nombre: ciudadano,
        infracciones: infracciones
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
    setMensaje('La descarga del PDF con el detalle de tu consulta comenzará en breve.')
  }

  function handleDescargarComprobante() {
    if (!modalExito) return

    const comprobante = {
      referencia: 'TRJ-' + Date.now().toString(36).toUpperCase(),
      fecha: modalExito.fecha,
      monto: modalExito.monto,
      metodo: modalExito.metodo,
      entidad: modalExito.banco || modalExito.celular || '**** ' + (modalExito.tarjeta?.numero?.slice(-4) || ''),
      ciudadano: resultado?.nombre || 'N/A',
    }

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
      fecha: new Date().toLocaleString('es-CO'),
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
      iniciarFlujoVerificado(() => setModalPago({ monto: cuotaInicial, esCuotaInicial: true }))
    }
  }

  /**
   * Punto único por el que deben pasar "Pagar comparendo" y "Hacer acuerdo de pago".
   * 1) Si no hay sesión, manda a iniciar sesión.
   * 2) Si faltan documentos o el registro facial, muestra el modal de verificación pendiente.
   * 3) Si ya está todo completo, exige reconocimiento facial (obligatorio en cada pago)
   *    y solo entonces ejecuta la acción real (abrir el modal de pago o de acuerdo).
   */
  function iniciarFlujoVerificado(accion) {
    if (!user) {
      navigate('/ingresar')
      return
    }

    const estado = user.verificacion

    if (!estado?.puedePagar) {
      setModalVerificacionRequerida(true)
      return
    }

    setAccionPendiente(() => accion)
    setModalFacialPendiente(true)
  }

  function handleFacialVerificado() {
    setModalFacialPendiente(false)
    accionPendiente?.()
    setAccionPendiente(null)
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
          onPagarTotal={(total, infraccionesSeleccionadas) =>
            iniciarFlujoVerificado(() =>
              setModalPago({ monto: total, infracciones: infraccionesSeleccionadas })
            )
          }
          onAcuerdo={(total, infraccionesSeleccionadas) =>
            iniciarFlujoVerificado(() =>
              setModalAcuerdo({ total, infracciones: infraccionesSeleccionadas })
            )
          }
        />
      )}

      {modalVerificacionRequerida && (
        <VerificationRequiredModal
          estado={user?.verificacion}
          onClose={() => setModalVerificacionRequerida(false)}
        />
      )}

      {modalFacialPendiente && (
        <FacialVerifyModal
          onClose={() => {
            setModalFacialPendiente(false)
            setAccionPendiente(null)
          }}
          onVerified={handleFacialVerificado}
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
          onClose={() => {
            setModalExito(null)
            refreshVerificacion()
          }}
          onDescargar={handleDescargarComprobante}
        />
      )}
    </div>
  )
}
