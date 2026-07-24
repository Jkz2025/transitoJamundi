-- ============================================
-- Tablas para Sistema de Tránsito Jamundí
-- ============================================

-- Tabla profiles_transito: Perfil extendido de usuarios
CREATE TABLE IF NOT EXISTS public.profiles_transito (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  cedula TEXT UNIQUE,
  nombre TEXT,
  apellidos TEXT,
  telefono TEXT,
  facial_verified BOOLEAN DEFAULT FALSE,
  facial_verified_at TIMESTAMP WITH TIME ZONE,
  facial_reference_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para crear perfil automáticamente al registrar usuario
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles_transito (id, cedula, nombre)
  VALUES (
    NEW.id,
    NEW.raw_user_meta_data->>'cedula',
    NEW.raw_user_meta_data->>'nombre'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Tabla identity_documents_transito: Documentos de identidad
CREATE TABLE IF NOT EXISTS public.identity_documents_transito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  front_path TEXT,
  back_path TEXT,
  front_uploaded_at TIMESTAMP WITH TIME ZONE,
  back_uploaded_at TIMESTAMP WITH TIME ZONE,
  status TEXT DEFAULT 'pendiente', -- 'pendiente', 'completo'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla facial_verifications_transito: Registro de verificaciones faciales
CREATE TABLE IF NOT EXISTS public.facial_verifications_transito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  tipo TEXT, -- 'enrolamiento', 'verificacion_pago'
  resultado BOOLEAN,
  score NUMERIC,
  captured_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla payment_agreements_transito: Acuerdos de pago
CREATE TABLE IF NOT EXISTS public.payment_agreements_transito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  valor_total NUMERIC NOT NULL,
  cuota_inicial NUMERIC NOT NULL,
  numero_cuotas INTEGER NOT NULL,
  valor_cuota NUMERIC NOT NULL,
  estado TEXT DEFAULT 'activo', -- 'activo', 'completado', 'cancelado'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Tabla payment_agreement_installments_transito: Cuotas de acuerdos
CREATE TABLE IF NOT EXISTS public.payment_agreement_installments_transito (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  agreement_id UUID REFERENCES public.payment_agreements_transito(id) ON DELETE CASCADE,
  numero_cuota INTEGER NOT NULL,
  valor NUMERIC NOT NULL,
  estado TEXT DEFAULT 'pendiente', -- 'pendiente', 'pagado', 'vencido'
  fecha_vencimiento DATE,
  fecha_pago TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(agreement_id, numero_cuota)
);

-- Habilitar RLS (Row Level Security)
ALTER TABLE public.profiles_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.identity_documents_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.facial_verifications_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_agreements_transito ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.payment_agreement_installments_transito ENABLE ROW LEVEL SECURITY;

-- Políticas de seguridad para profiles_transito
CREATE POLICY "Users can view own profile"
  ON public.profiles_transito FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON public.profiles_transito FOR UPDATE
  USING (auth.uid() = id);

-- Políticas para identity_documents_transito
CREATE POLICY "Users can view own documents"
  ON public.identity_documents_transito FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own documents"
  ON public.identity_documents_transito FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own documents"
  ON public.identity_documents_transito FOR UPDATE
  USING (auth.uid() = user_id);

-- Políticas para facial_verifications_transito
CREATE POLICY "Users can view own verifications"
  ON public.facial_verifications_transito FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own verifications"
  ON public.facial_verifications_transito FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para payment_agreements_transito
CREATE POLICY "Users can view own agreements"
  ON public.payment_agreements_transito FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own agreements"
  ON public.payment_agreements_transito FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para payment_agreement_installments_transito
CREATE POLICY "Users can view own installments"
  ON public.payment_agreement_installments_transito FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.payment_agreements_transito
      WHERE payment_agreements_transito.id = payment_agreement_installments_transito.agreement_id
      AND payment_agreements_transito.user_id = auth.uid()
    )
  );
