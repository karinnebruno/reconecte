-- ============================================================
-- MIGRAÇÃO: Dashboard clínico Reconecte
-- Rodar no SQL Editor do Supabase
-- ============================================================

-- 1. Adicionar role "secretaria" ao profiles existente
-- (role já existe, só garantir que aceita o novo valor)
ALTER TABLE profiles
  DROP CONSTRAINT IF EXISTS profiles_role_check;

ALTER TABLE profiles
  ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'secretaria', 'user'));

-- Definir a secretária de teste
-- NOTA: a coluna email está em auth.users, não em profiles
UPDATE profiles
SET role = 'secretaria'
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'teste@teste.com' LIMIT 1
);

-- ============================================================
-- 2. Pacientes (gerenciados pela clínica, não necessariamente usuários do app)
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id            uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome          text NOT NULL,
  whatsapp      text,
  email         text,
  cpf           text,
  data_nascimento date,
  status        text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  parceiro_id   uuid REFERENCES patients(id) ON DELETE SET NULL,
  user_id       uuid REFERENCES auth.users(id) ON DELETE SET NULL, -- vínculo com conta do app
  notas_admin   text, -- prontuário livre, somente admin
  created_at    timestamptz NOT NULL DEFAULT now()
);

-- RLS: admin e secretária leem; admin escreve tudo; secretária não vê notas_admin
ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_read_patients" ON patients
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "admin_write_patients" ON patients
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================
-- 3. Pacotes de sessões
-- ============================================================
CREATE TABLE IF NOT EXISTS session_packages (
  id                uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id        uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  tipo              text NOT NULL DEFAULT 'avulsa',
  sessoes_total     int  NOT NULL DEFAULT 1,
  sessoes_usadas    int  NOT NULL DEFAULT 0,
  sessoes_restantes int  GENERATED ALWAYS AS (sessoes_total - sessoes_usadas) STORED,
  valor_pago        numeric(10,2),
  appointment_id    uuid REFERENCES appointments(id) ON DELETE SET NULL,
  data_compra       timestamptz NOT NULL DEFAULT now(),
  created_at        timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE session_packages ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_read_packages" ON session_packages
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "dashboard_write_packages" ON session_packages
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

-- Permitir que o paciente veja seu próprio saldo (para o app)
CREATE POLICY "patient_read_own_packages" ON session_packages
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- Função para incrementar sessoes_usadas (chamada ao registrar sessão)
CREATE OR REPLACE FUNCTION incrementar_sessoes_usadas(package_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE session_packages
  SET sessoes_usadas = sessoes_usadas + 1
  WHERE id = package_id AND sessoes_usadas < sessoes_total;
END;
$$;

-- ============================================================
-- 4. Sessões clínicas realizadas
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  package_id      uuid REFERENCES session_packages(id) ON DELETE SET NULL,
  appointment_id  uuid REFERENCES appointments(id) ON DELETE SET NULL,
  data_hora       timestamptz NOT NULL,
  duracao_minutos int NOT NULL DEFAULT 50,
  tipo            text NOT NULL DEFAULT 'individual' CHECK (tipo IN ('individual', 'casal')),
  presente        boolean,  -- null = ainda não marcado, true = presente, false = faltou
  anotacoes       text,     -- prontuário clínico, somente admin
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clinical_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_read_sessions" ON clinical_sessions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

CREATE POLICY "dashboard_write_sessions" ON clinical_sessions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

-- App do paciente pode ver suas próprias sessões
CREATE POLICY "patient_read_own_sessions" ON clinical_sessions
  FOR SELECT USING (
    patient_id IN (
      SELECT id FROM patients WHERE user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. Lançamentos financeiros
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        text NOT NULL CHECK (tipo IN ('entrada', 'saida')),
  valor       numeric(10,2) NOT NULL,
  descricao   text,
  categoria   text,
  patient_id  uuid REFERENCES patients(id) ON DELETE SET NULL,
  session_id  uuid REFERENCES clinical_sessions(id) ON DELETE SET NULL,
  data        timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_financeiro" ON financial_entries
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

-- ============================================================
-- 6. Tarefas
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text NOT NULL,
  descricao    text,
  responsavel  text NOT NULL DEFAULT 'ambos' CHECK (responsavel IN ('admin', 'secretaria', 'ambos')),
  status       text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente', 'concluida')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "dashboard_tasks" ON tasks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.id = auth.uid()
      AND profiles.role IN ('admin', 'secretaria')
    )
  );

-- ============================================================
-- 7. Índices de performance
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clinical_sessions_patient ON clinical_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_sessions_data ON clinical_sessions(data_hora);
CREATE INDEX IF NOT EXISTS idx_session_packages_patient ON session_packages(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_data ON financial_entries(data);
CREATE INDEX IF NOT EXISTS idx_financial_entries_tipo ON financial_entries(tipo);
CREATE INDEX IF NOT EXISTS idx_patients_status ON patients(status);
