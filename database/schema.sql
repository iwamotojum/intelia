-- ============================================================
-- Intelia Event Registration — Database Schema
-- PostgreSQL 16
-- ============================================================

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Tabela principal de inscrições
CREATE TABLE registrations (
  id             BIGSERIAL PRIMARY KEY,

  -- Identificador de sessão anônima (para retomada sem login)
  session_token  VARCHAR(40)  NOT NULL,
  current_step   SMALLINT     NOT NULL DEFAULT 1
                               CHECK (current_step BETWEEN 1 AND 3),

  -- Passo 1 — Dados pessoais
  full_name      VARCHAR(150),
  birth_date     DATE,
  email          VARCHAR(255),

  -- Passo 2 — Endereço
  street         VARCHAR(255),
  number         VARCHAR(20),
  zip_code       VARCHAR(9),   -- formato: 00000-000
  city           VARCHAR(100),
  state          CHAR(2),

  -- Passo 3 — Telefones
  landline_phone VARCHAR(15),  -- formato: (00) 0000-0000
  mobile_phone   VARCHAR(15),  -- formato: (00) 00000-0000

  completed      BOOLEAN      NOT NULL DEFAULT FALSE,

  created_at     TIMESTAMP    NOT NULL DEFAULT NOW(),
  updated_at     TIMESTAMP    NOT NULL DEFAULT NOW()
);

-- Índices
CREATE UNIQUE INDEX idx_registrations_session_token ON registrations (session_token);
CREATE        INDEX idx_registrations_email         ON registrations (email);
CREATE        INDEX idx_registrations_completed     ON registrations (completed);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_registrations_updated_at
  BEFORE UPDATE ON registrations
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();
