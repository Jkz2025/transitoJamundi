// Datos de ejemplo para desarrollo local, con la MISMA forma que devuelve
// la función RPC `buscar_deuda` de Supabase (ver supabase/schema.sql).
// Reemplazar por la llamada real una vez el proyecto de Supabase esté conectado.
export const MOCK_DB = {
  '1107012345': {
    nombre: 'Juan Camilo Restrepo',
    infracciones: [
      {
        infraction_id: 'a1',
        numero_comparendo: '76364000000012345',
        descripcion: 'C29 - No usar cinturón de seguridad',
        fecha_infraccion: '2025-03-14',
        placa: 'ABC12D',
        valor_actual: 458700,
        estado: 'pendiente'
      },
      {
        infraction_id: 'a2',
        numero_comparendo: '76364000000012987',
        descripcion: 'C14 - Exceder límites de velocidad',
        fecha_infraccion: '2025-08-02',
        placa: 'ABC12D',
        valor_actual: 917400,
        estado: 'pendiente'
      },
      {
        infraction_id: 'a3',
        numero_comparendo: '76364000000013579',
        descripcion: 'C04 - No respetar semáforo en rojo',
        fecha_infraccion: '2025-09-15',
        placa: 'ABC12D',
        valor_actual: 1423900,
        estado: 'pendiente'
      },
      {
        infraction_id: 'a4',
        numero_comparendo: '76364000000014135',
        descripcion: 'C15 - Conducir sin licencia',
        fecha_infraccion: '2025-10-20',
        placa: 'XYZ789',
        valor_actual: 700000,
        estado: 'pendiente'
      }
    ]
  },
  'ABC12D': { redirectCedula: '1107012345' }
}

export function buscarDeudaMock({ cedula, placa }) {
  let key = cedula
  if (!key && placa) {
    const entry = MOCK_DB[placa.toUpperCase()]
    key = entry?.redirectCedula
  }
  const record = key ? MOCK_DB[key] : null
  if (!record) return { nombre: null, infracciones: [] }
  return record
}
