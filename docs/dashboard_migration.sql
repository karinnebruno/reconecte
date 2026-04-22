-- ============================================================
-- SQL 1 — Estrutura do dashboard clínico Reconecte
-- Idempotente: pode rodar mais de uma vez sem erro
-- ============================================================

-- Roles
ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('admin', 'secretaria', 'user'));

UPDATE profiles SET role = 'secretaria'
WHERE id = (SELECT id FROM auth.users WHERE email = 'teste@teste.com' LIMIT 1);

-- ============================================================
-- patients
-- ============================================================
CREATE TABLE IF NOT EXISTS patients (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nome            text NOT NULL,
  whatsapp        text,
  email           text,
  cpf             text,
  data_nascimento date,
  status          text NOT NULL DEFAULT 'ativo' CHECK (status IN ('ativo', 'inativo')),
  parceiro_id     uuid REFERENCES patients(id) ON DELETE SET NULL,
  user_id         uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  notas_admin     text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_read_patients" ON patients;
DROP POLICY IF EXISTS "admin_write_patients"     ON patients;

CREATE POLICY "dashboard_read_patients" ON patients
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

CREATE POLICY "admin_write_patients" ON patients
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role = 'admin')
  );

-- ============================================================
-- session_packages
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

DROP POLICY IF EXISTS "dashboard_read_packages"   ON session_packages;
DROP POLICY IF EXISTS "dashboard_write_packages"  ON session_packages;
DROP POLICY IF EXISTS "patient_read_own_packages" ON session_packages;

CREATE POLICY "dashboard_read_packages" ON session_packages
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

CREATE POLICY "dashboard_write_packages" ON session_packages
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

CREATE POLICY "patient_read_own_packages" ON session_packages
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

CREATE OR REPLACE FUNCTION incrementar_sessoes_usadas(package_id uuid)
RETURNS void LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  UPDATE session_packages SET sessoes_usadas = sessoes_usadas + 1
  WHERE id = package_id AND sessoes_usadas < sessoes_total;
END;
$$;

-- ============================================================
-- clinical_sessions
-- ============================================================
CREATE TABLE IF NOT EXISTS clinical_sessions (
  id              uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id      uuid NOT NULL REFERENCES patients(id) ON DELETE CASCADE,
  package_id      uuid REFERENCES session_packages(id) ON DELETE SET NULL,
  appointment_id  uuid REFERENCES appointments(id) ON DELETE SET NULL,
  data_hora       timestamptz NOT NULL,
  duracao_minutos int NOT NULL DEFAULT 50,
  tipo            text NOT NULL DEFAULT 'individual' CHECK (tipo IN ('individual','casal')),
  presente        boolean,
  anotacoes       text,
  created_at      timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE clinical_sessions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_read_sessions"    ON clinical_sessions;
DROP POLICY IF EXISTS "dashboard_write_sessions"   ON clinical_sessions;
DROP POLICY IF EXISTS "patient_read_own_sessions"  ON clinical_sessions;

CREATE POLICY "dashboard_read_sessions" ON clinical_sessions
  FOR SELECT USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

CREATE POLICY "dashboard_write_sessions" ON clinical_sessions
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

CREATE POLICY "patient_read_own_sessions" ON clinical_sessions
  FOR SELECT USING (
    patient_id IN (SELECT id FROM patients WHERE user_id = auth.uid())
  );

-- ============================================================
-- financial_entries
-- ============================================================
CREATE TABLE IF NOT EXISTS financial_entries (
  id          uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo        text NOT NULL CHECK (tipo IN ('entrada','saida')),
  valor       numeric(10,2) NOT NULL,
  descricao   text,
  categoria   text,
  patient_id  uuid REFERENCES patients(id) ON DELETE SET NULL,
  session_id  uuid REFERENCES clinical_sessions(id) ON DELETE SET NULL,
  data        timestamptz NOT NULL DEFAULT now(),
  created_at  timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE financial_entries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_financeiro" ON financial_entries;

CREATE POLICY "dashboard_financeiro" ON financial_entries
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

-- ============================================================
-- tasks
-- ============================================================
CREATE TABLE IF NOT EXISTS tasks (
  id           uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo       text NOT NULL,
  descricao    text,
  responsavel  text NOT NULL DEFAULT 'ambos' CHECK (responsavel IN ('admin','secretaria','ambos')),
  status       text NOT NULL DEFAULT 'pendente' CHECK (status IN ('pendente','concluida')),
  created_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "dashboard_tasks" ON tasks;

CREATE POLICY "dashboard_tasks" ON tasks
  FOR ALL USING (
    EXISTS (SELECT 1 FROM profiles WHERE profiles.id = auth.uid() AND profiles.role IN ('admin','secretaria'))
  );

-- ============================================================
-- Índices
-- ============================================================
CREATE INDEX IF NOT EXISTS idx_clinical_sessions_patient ON clinical_sessions(patient_id);
CREATE INDEX IF NOT EXISTS idx_clinical_sessions_data    ON clinical_sessions(data_hora);
CREATE INDEX IF NOT EXISTS idx_session_packages_patient  ON session_packages(patient_id);
CREATE INDEX IF NOT EXISTS idx_financial_entries_data    ON financial_entries(data);
CREATE INDEX IF NOT EXISTS idx_financial_entries_tipo    ON financial_entries(tipo);
CREATE INDEX IF NOT EXISTS idx_patients_status           ON patients(status);
