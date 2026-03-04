import * as yup from 'yup'

// ── Passo 1 — Dados Pessoais ───────────────────────────────────────────────
export const stepOneSchema = yup.object({
  full_name: yup
    .string()
    .min(3, 'Mínimo de 3 caracteres')
    .max(150, 'Máximo de 150 caracteres')
    .matches(/^[a-zA-ZÀ-ÿ\s'-]+$/, 'Somente letras são permitidas')
    .required('Nome completo é obrigatório'),

  birth_date: yup
    .string()
    .required('Data de nascimento é obrigatória')
    .matches(/^\d{2}\/\d{2}\/\d{4}$/, 'Use o formato DD/MM/AAAA')
    .test('age', 'É necessário ter pelo menos 16 anos', (value) => {
      if (!value) return false
      const [d, m, y] = value.split('/')
      const birth = new Date(`${y}-${m}-${d}`)
      const today = new Date()
      const age = (today - birth) / (365.25 * 24 * 60 * 60 * 1000)
      return age >= 16
    })
    .test('not-future', 'Data não pode ser no futuro', (value) => {
      if (!value) return false
      const [d, m, y] = value.split('/')
      return new Date(`${y}-${m}-${d}`) <= new Date()
    }),

  email: yup
    .string()
    .email('Insira um e-mail válido')
    .max(255, 'Máximo de 255 caracteres')
    .required('E-mail é obrigatório'),
})

// ── Passo 2 — Endereço ────────────────────────────────────────────────────
const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
]

export const stepTwoSchema = yup.object({
  street: yup
    .string()
    .max(255, 'Máximo de 255 caracteres')
    .required('Rua é obrigatória'),

  number: yup
    .string()
    .max(20, 'Máximo de 20 caracteres')
    .required('Número é obrigatório'),

  zip_code: yup
    .string()
    .matches(/^\d{5}-\d{3}$/, 'CEP deve estar no formato 00000-000')
    .required('CEP é obrigatório'),

  city: yup
    .string()
    .max(100, 'Máximo de 100 caracteres')
    .required('Cidade é obrigatória'),

  state: yup
    .string()
    .oneOf(BR_STATES, 'Selecione um estado válido')
    .required('Estado é obrigatório'),
})

// ── Passo 3 — Telefones ────────────────────────────────────────────────────
export const stepThreeSchema = yup.object({
  mobile_phone: yup
    .string()
    .matches(/^\(\d{2}\) \d{5}-\d{4}$/, 'Celular deve estar no formato (00) 00000-0000')
    .required('Celular é obrigatório'),

  landline_phone: yup
    .string()
    .matches(/^\(\d{2}\) \d{4}-\d{4}$/, 'Telefone fixo deve estar no formato (00) 0000-0000')
    .nullable()
    .transform((v) => v === '' ? null : v),
})
