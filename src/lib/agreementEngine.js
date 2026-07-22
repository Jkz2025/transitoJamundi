// ---------------------------------------------------------------------------
// Motor de acuerdos de pago.
//
// Nota de diseño importante: un acuerdo de pago es un documento con efectos
// legales y financieros. Por eso este motor NO delega el cálculo a un modelo
// de lenguaje (que podría "alucinar" un valor de cuota). En su lugar, aplica
// reglas de negocio fijas, transparentes y auditables -por ejemplo, cupos
// de cuotas según el monto, cuota inicial mínima, valor mínimo de cuota-.
// La Secretaría de Tránsito puede ajustar estas reglas en un solo lugar
// (este archivo) y quedan versionadas en el campo `generado_por` de la tabla
// payment_agreements para trazabilidad ante un ciudadano o un ente de control.
// ---------------------------------------------------------------------------

export const REGLAS_ACUERDO = [
  { hasta: 500_000, maxCuotas: 3 },
  { hasta: 2_000_000, maxCuotas: 6 },
  { hasta: 5_000_000, maxCuotas: 12 },
  { hasta: Infinity, maxCuotas: 24 }
]

export const CUOTA_INICIAL_MINIMA_PORCENTAJE = 0.2 // 20% del total
export const VALOR_MINIMO_CUOTA = 50_000 // COP

/**
 * Calcula las opciones de acuerdo de pago disponibles para un total de deuda.
 * Devuelve una lista de opciones (2 cuotas, 3 cuotas, ... hasta el máximo
 * permitido por las reglas) para que el ciudadano elija.
 */
export function calcularOpcionesAcuerdo(totalDeuda) {
  if (!totalDeuda || totalDeuda <= 0) return []

  const regla = REGLAS_ACUERDO.find((r) => totalDeuda <= r.hasta)
  const maxCuotas = regla.maxCuotas
  const cuotaInicialMinima = Math.ceil(
    (totalDeuda * CUOTA_INICIAL_MINIMA_PORCENTAJE) / 1000
  ) * 1000

  const opciones = []
  for (let n = 2; n <= maxCuotas; n++) {
    const saldoFinanciado = totalDeuda - cuotaInicialMinima
    const valorCuota = Math.ceil(saldoFinanciado / n / 1000) * 1000
    if (valorCuota < VALOR_MINIMO_CUOTA) break
    opciones.push({
      numeroCuotas: n,
      cuotaInicial: cuotaInicialMinima,
      valorCuota,
      valorTotalFinanciado: saldoFinanciado,
      fechasEstimadas: generarFechasCuotas(n)
    })
  }
  return opciones
}

function generarFechasCuotas(n) {
  const fechas = []
  const hoy = new Date()
  for (let i = 1; i <= n; i++) {
    const f = new Date(hoy.getFullYear(), hoy.getMonth() + i, hoy.getDate())
    fechas.push(f.toISOString().slice(0, 10))
  }
  return fechas
}

export function formatoCOP(valor) {
  return new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    maximumFractionDigits: 0
  }).format(valor)
}
