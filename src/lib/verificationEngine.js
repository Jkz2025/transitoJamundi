import { supabase } from './supabaseClient.js'

/**
 * Motor de verificación de identidad.
 * Centraliza:
 *  - subir cédula (frente/atrás) a Storage
 *  - registrar el enrolamiento facial
 *  - verificar el rostro antes de un pagonpm run devnpm run dev
 *  - calcular si el usuario ya puede pagar
 *
 * NOTA IMPORTANTE SOBRE PRODUCCIÓN:
 * El reconocimiento facial real (comparar dos rostros y obtener un score de
 * similitud) NO debe hacerse en el navegador. Aquí queda simulado: se sube
 * la foto y se asume coincidencia exitosa. En producción, reemplazar el
 * bloque marcado en verificarRostro() por una llamada a una Edge Function
 * de Supabase que use un proveedor real (AWS Rekognition, Azure Face API).
 */

// export async function obtenerEstadoVerificacion(userId) {
//   const { data: doc } = await supabase
//     .from('identity_documents_transito')
//     .select('*')
//     .eq('user_id', userId)
//     .maybeSingle()

//   const { data: profile } = await supabase
//     .from('profiles_transito')
//     .select('facial_verified, facial_verified_at, facial_reference_path')
//     .eq('id', userId)
//     .maybeSingle()

//   const documentosCompletos = !!doc?.front_path && !!doc?.back_path
//   const facialCompleto = !!profile?.facial_verified

//   return {
//     documentos: {
//       completo: documentosCompletos,
//       frontePath: doc?.front_path ?? null,
//       atrasPath: doc?.back_path ?? null,
//     },
//     facial: {
//       completo: facialCompleto,
//       referenciaPath: profile?.facial_reference_path ?? null,
//       verificadoEn: profile?.facial_verified_at ?? null,
//     },
//     puedePagar: documentosCompletos && facialCompleto,
//   }
// }

// export async function enrolarRostro({ userId, blob }) {
//   const path = `${userId}/rostro_${Date.now()}.jpg`

//   const { error: uploadError } = await supabase.storage
//     .from('facial-references-transito')
//     .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
//   if (uploadError) throw uploadError

//   const { error } = await supabase
//     .from('profiles_transito')
//     .update({
//       facial_verified: true,
//       facial_verified_at: new Date().toISOString(),
//       facial_reference_path: path,
//     })
//     .eq('id', userId)
//   if (error) throw error

//   await supabase.from('facial_verifications_transito').insert({
//     user_id: userId,
//     tipo: 'enrolamiento',
//     resultado: true,
//     captured_path: path,
//   })

//   return path
// }

const BUCKET = 'documentos-identidad'

const CAMPO_POR_LADO = {
  front: { path: 'cedula_frente_path', fecha: 'cedula_frente_at', archivo: 'cedula_frente.jpg' },
  back: { path: 'cedula_atras_path', fecha: 'cedula_atras_at', archivo: 'cedula_atras.jpg' },
}

export async function subirDocumentoCedula({ userId, lado, blob }) {
  const campo = CAMPO_POR_LADO[lado]
  if (!campo) throw new Error('Lado inválido')

  const rutaStorage = `${userId}/${campo.archivo}`

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(rutaStorage, blob, { upsert: true, contentType: blob.type || 'image/jpeg' })

  if (errorSubida) throw errorSubida

  const { error: errorTabla } = await supabase
    .from('verificaciones_usuario')
    .upsert(
      { user_id: userId, [campo.path]: rutaStorage, [campo.fecha]: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (errorTabla) throw errorTabla

  return rutaStorage
}

export async function verificarRostro({ userId, blob}) {
  const { data: verif, error: errorLectura } = await supabase
  .from('verificaciones_usuario')
  .select('selfie_path')
  .eq('user_id', userId)
  .maybeSingle()

  if(errorLectura) throw errorLectura
  if (!verif?.selfie_path) {
    throw new Error ('Primero debes registrar tu rostro en Ajustes.')
  }

  const rutaIntento = `${userId}/verificacion_pago_${Date.now()}.jpg`

  const { error : errorSubida } = await supabase.storage
  .from(BUCKET)
 .upload(rutaIntento, blob, { upsert: true, contentType: blob.type || 'image/jpeg' })

if (errorSubida) throw errorSubida

 // Simulado: no hay matching biométrico real contra selfie_path.
  // En producción, reemplazar por Edge Function con Rekognition/Face API.

return { match: true, rutaIntento }


}

// Usada por FacialEnrollSection.jsx
export async function enrolarRostro({ userId, blob }) {
  const rutaStorage = `${userId}/selfie.jpg`

  const { error: errorSubida } = await supabase.storage
    .from(BUCKET)
    .upload(rutaStorage, blob, { upsert: true, contentType: blob.type || 'image/jpeg' })

  if (errorSubida) throw errorSubida

  const { error: errorTabla } = await supabase
    .from('verificaciones_usuario')
    .upsert(
      { user_id: userId, selfie_path: rutaStorage, selfie_at: new Date().toISOString() },
      { onConflict: 'user_id' }
    )

  if (errorTabla) throw errorTabla

  return rutaStorage
}

export async function obtenerEstadoVerificacion(userId) {
  const { data, error } = await supabase
    .from('verificaciones_usuario')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  if (error) throw error

  if (!data) {
    return {
      documentos: { frontePath: null, atrasPath: null },
      facial: { completo: false, selfiePath: null },
      verificado: false,
    }
  }

  return {
    documentos: {
      frontePath: data.cedula_frente_path,
      atrasPath: data.cedula_atras_path,
    },
    facial: {
      completo: !!data.selfie_path,
      selfiePath: data.selfie_path,
    },
    verificado: data.verificado,
  }
}

// Bucket privado -> hay que firmar la URL para poder mostrar la imagen
export async function obtenerUrlFirmada(rutaStorage, segundos = 300) {
  if (!rutaStorage) return null
  const { data, error } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(rutaStorage, segundos)
  if (error) throw error
  return data.signedUrl
}