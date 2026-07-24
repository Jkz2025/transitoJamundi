import { supabase } from './supabaseClient.js'

/**
 * Motor de verificación de identidad.
 * Centraliza:
 *  - subir cédula (frente/atrás) a Storage
 *  - registrar el enrolamiento facial
 *  - verificar el rostro antes de un pago
 *  - calcular si el usuario ya puede pagar
 *
 * NOTA IMPORTANTE SOBRE PRODUCCIÓN:
 * El reconocimiento facial real (comparar dos rostros y obtener un score de
 * similitud) NO debe hacerse en el navegador. Aquí queda simulado: se sube
 * la foto y se asume coincidencia exitosa. En producción, reemplazar el
 * bloque marcado en verificarRostro() por una llamada a una Edge Function
 * de Supabase que use un proveedor real (AWS Rekognition, Azure Face API).
 */

export async function obtenerEstadoVerificacion(userId) {
  const { data: doc } = await supabase
    .from('identity_documents_transito')
    .select('*')
    .eq('user_id', userId)
    .maybeSingle()

  const { data: profile } = await supabase
    .from('profiles_transito')
    .select('facial_verified, facial_verified_at, facial_reference_path')
    .eq('id', userId)
    .maybeSingle()

  const documentosCompletos = !!doc?.front_path && !!doc?.back_path
  const facialCompleto = !!profile?.facial_verified

  return {
    documentos: {
      completo: documentosCompletos,
      frontePath: doc?.front_path ?? null,
      atrasPath: doc?.back_path ?? null,
    },
    facial: {
      completo: facialCompleto,
      referenciaPath: profile?.facial_reference_path ?? null,
      verificadoEn: profile?.facial_verified_at ?? null,
    },
    puedePagar: documentosCompletos && facialCompleto,
  }
}

export async function subirDocumentoCedula({ userId, lado, blob }) {
  // lado: 'front' | 'back'
  const path = `${userId}/cedula_${lado}_${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('id-documents-transito')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
  if (uploadError) throw uploadError

  const campoPath = lado === 'front' ? 'front_path' : 'back_path'
  const campoFecha = lado === 'front' ? 'front_uploaded_at' : 'back_uploaded_at'

  const { data: existente } = await supabase
    .from('identity_documents_transito')
    .select('id')
    .eq('user_id', userId)
    .maybeSingle()

  const payload = {
    user_id: userId,
    [campoPath]: path,
    [campoFecha]: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existente) {
    const { error } = await supabase.from('identity_documents_transito').update(payload).eq('user_id', userId)
    if (error) throw error
  } else {
    const { error } = await supabase.from('identity_documents_transito').insert(payload)
    if (error) throw error
  }

  const { data: actualizado } = await supabase
    .from('identity_documents_transito')
    .select('front_path, back_path')
    .eq('user_id', userId)
    .single()

  if (actualizado?.front_path && actualizado?.back_path) {
    await supabase.from('identity_documents_transito').update({ status: 'completo' }).eq('user_id', userId)
  }

  return path
}

export async function enrolarRostro({ userId, blob }) {
  const path = `${userId}/rostro_${Date.now()}.jpg`

  const { error: uploadError } = await supabase.storage
    .from('facial-references-transito')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })
  if (uploadError) throw uploadError

  const { error } = await supabase
    .from('profiles_transito')
    .update({
      facial_verified: true,
      facial_verified_at: new Date().toISOString(),
      facial_reference_path: path,
    })
    .eq('id', userId)
  if (error) throw error

  await supabase.from('facial_verifications_transito').insert({
    user_id: userId,
    tipo: 'enrolamiento',
    resultado: true,
    captured_path: path,
  })

  return path
}

export async function verificarRostro({ userId, blob }) {
  // --- SIMULACIÓN (fase de pruebas) ---
  const path = `${userId}/verificacion_${Date.now()}.jpg`

  await supabase.storage
    .from('facial-references-transito')
    .upload(path, blob, { contentType: 'image/jpeg', upsert: true })

  // --- PRODUCCIÓN: reemplazar el bloque de arriba por, por ejemplo: ---
  // const { data, error } = await supabase.functions.invoke('verificar-rostro', {
  //   body: { userId, imagenBase64 }
  // })
  // if (error || !data.match) {
  //   await supabase.from('facial_verifications_transito').insert({
  //     user_id: userId, tipo: 'verificacion_pago', resultado: false, score: data?.score, captured_path: path
  //   })
  //   return { match: false, score: data?.score ?? 0 }
  // }

  await supabase.from('facial_verifications_transito').insert({
    user_id: userId,
    tipo: 'verificacion_pago',
    resultado: true,
    captured_path: path,
  })

  return { match: true, score: 0.98 }
}
