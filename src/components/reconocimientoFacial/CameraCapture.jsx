import { useEffect, useRef, useState } from 'react'

/**
 * Componente reutilizable para capturar una foto con la cámara del dispositivo.
 * Se usa tanto para el reconocimiento facial como para escanear la cédula.
 *
 * Props:
 *  - onCapture(blob): se llama con un Blob (image/jpeg) cuando el usuario confirma la foto
 *  - guia: texto de ayuda mostrado sobre la vista de cámara
 *  - aspectRatio: 'square' (rostro) | 'card' (cédula)
 */
export default function CameraCapture({ onCapture, guia, aspectRatio = 'square' }) {
  const videoRef = useRef(null)
  const canvasRef = useRef(null)
  const streamRef = useRef(null)
  const [foto, setFoto] = useState(null)
  const [error, setError] = useState('')
  const [listo, setListo] = useState(false)

  useEffect(() => {
    iniciarCamara()
    return () => detenerCamara()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function iniciarCamara() {
    setError('')
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: aspectRatio === 'card' ? 'environment' : 'user',
          width: { ideal: 1280 },
          height: { ideal: 960 },
        },
        audio: false,
      })
      streamRef.current = stream
      if (videoRef.current) {
        videoRef.current.srcObject = stream
        setListo(true)
      }
    } catch (err) {
      setError('No pudimos acceder a la cámara. Verifica los permisos del navegador.')
    }
  }

  function detenerCamara() {
    streamRef.current?.getTracks().forEach((t) => t.stop())
  }

  function tomarFoto() {
    const video = videoRef.current
    const canvas = canvasRef.current
    if (!video || !canvas) return
    canvas.width = video.videoWidth
    canvas.height = video.videoHeight
    const ctx = canvas.getContext('2d')
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height)
    setFoto(canvas.toDataURL('image/jpeg', 0.9))
    detenerCamara()
  }

  function repetir() {
    setFoto(null)
    iniciarCamara()
  }

  function confirmar() {
    canvasRef.current.toBlob((blob) => onCapture(blob), 'image/jpeg', 0.9)
  }

  const marco = aspectRatio === 'card' ? 'aspect-[1.6/1]' : 'aspect-square max-w-xs mx-auto'

  return (
    <div className="space-y-3">
      {guia && <p className="text-sm text-navy-500 text-center">{guia}</p>}

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 text-red-600 px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <div className={`relative rounded-xl overflow-hidden bg-navy-900 ${marco}`}>
        {!foto ? (
          <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
        ) : (
          <img src={foto} alt="Captura" className="w-full h-full object-cover" />
        )}
      </div>
      <canvas ref={canvasRef} className="hidden" />

      <div className="flex gap-3 justify-center">
        {!foto ? (
          <button type="button" onClick={tomarFoto} disabled={!listo} className="btn-primary">
            Tomar foto
          </button>
        ) : (
          <>
            <button type="button" onClick={repetir} className="btn-ghost">
              Repetir
            </button>
            <button type="button" onClick={confirmar} className="btn-primary">
              Usar esta foto
            </button>
          </>
        )}
      </div>
    </div>
  )
}
