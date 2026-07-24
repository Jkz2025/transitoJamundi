# Configuración de Storage en Supabase

Para que el sistema de reconocimiento facial funcione, necesitas crear dos buckets en Supabase Storage:

## Pasos para crear los buckets:

1. Ve a tu proyecto en https://supabase.com/dashboard
2. Navega a: Storage → New bucket
3. Crea los siguientes buckets:

### Bucket 1: `id-documents-transito`
- **Nombre**: `id-documents-transito`
- **Public bucket**: No (marcar como privado)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png

### Bucket 2: `facial-references-transito`
- **Nombre**: `facial-references-transito`
- **Public bucket**: No (marcar como privado)
- **File size limit**: 5MB
- **Allowed MIME types**: image/jpeg, image/png

## Políticas de acceso (Bucket Policies)

Para cada bucket, configura las siguientes políticas:

### Para `id-documents-transito`:
- **SELECT**: Authenticated users (pueden ver sus propios documentos)
- **INSERT**: Authenticated users (pueden subir sus propios documentos)
- **UPDATE**: Authenticated users (pueden actualizar sus propios documentos)
- **DELETE**: Authenticated users (pueden eliminar sus propios documentos)

### Para `facial-references-transito`:
- **SELECT**: Authenticated users (pueden ver sus propias fotos)
- **INSERT**: Authenticated users (pueden subir sus propias fotos)
- **UPDATE**: Authenticated users (pueden actualizar sus propias fotos)
- **DELETE**: Authenticated users (pueden eliminar sus propias fotos)

## Política RLS recomendada:

```sql
-- Para id-documents-transito
CREATE POLICY "Users can view own documents"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'id-documents-transito'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own documents"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'id-documents-transito'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

-- Para facial-references-transito
CREATE POLICY "Users can view own photos"
ON storage.objects FOR SELECT
USING (
  bucket_id = 'facial-references-transito'
  AND auth.uid()::text = (storage.foldername(name))[1]
);

CREATE POLICY "Users can upload own photos"
ON storage.objects FOR INSERT
WITH CHECK (
  bucket_id = 'facial-references-transito'
  AND auth.uid()::text = (storage.foldername(name))[1]
);
```
