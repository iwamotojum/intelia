import { stepOneSchema, stepTwoSchema, stepThreeSchema } from '@/validators/schemas'

// ── Passo 1 ───────────────────────────────────────────────────────────────
describe('stepOneSchema', () => {
  const valid = {
    full_name:  'João da Silva',
    birth_date: '01/01/1990',
    email:      'joao@exemplo.com',
  }

  it('aceita dados corretos', async () => {
    await expect(stepOneSchema.validate(valid)).resolves.toBeTruthy()
  })

  it('rejeita nome com menos de 3 caracteres', async () => {
    await expect(stepOneSchema.validate({ ...valid, full_name: 'Jo' }))
      .rejects.toThrow('Mínimo de 3 caracteres')
  })

  it('rejeita nome com números', async () => {
    await expect(stepOneSchema.validate({ ...valid, full_name: 'João123' }))
      .rejects.toThrow('Somente letras são permitidas')
  })

  it('rejeita nome ausente', async () => {
    await expect(stepOneSchema.validate({ ...valid, full_name: undefined }))
      .rejects.toThrow('Nome completo é obrigatório')
  })

  it('rejeita data no formato errado', async () => {
    await expect(stepOneSchema.validate({ ...valid, birth_date: '1990-01-01' }))
      .rejects.toThrow('Use o formato DD/MM/AAAA')
  })

  it('rejeita data no futuro (cai na validação de idade)', async () => {
    const today = new Date()
    const d = String(today.getDate()).padStart(2, '0')
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const y = today.getFullYear() + 1
    await expect(stepOneSchema.validate({ ...valid, birth_date: `${d}/${m}/${y}` }))
      .rejects.toThrow('pelo menos 16 anos')
  })

  it('rejeita idade menor que 16 anos', async () => {
    const today = new Date()
    const d = String(today.getDate()).padStart(2, '0')
    const m = String(today.getMonth() + 1).padStart(2, '0')
    const y = today.getFullYear() - 10
    await expect(stepOneSchema.validate({ ...valid, birth_date: `${d}/${m}/${y}` }))
      .rejects.toThrow('pelo menos 16 anos')
  })

  it('rejeita email inválido', async () => {
    await expect(stepOneSchema.validate({ ...valid, email: 'nao-e-email' }))
      .rejects.toThrow('e-mail válido')
  })

  it('rejeita email ausente', async () => {
    await expect(stepOneSchema.validate({ ...valid, email: '' }))
      .rejects.toThrow('E-mail é obrigatório')
  })
})

// ── Passo 2 ───────────────────────────────────────────────────────────────
describe('stepTwoSchema', () => {
  const valid = {
    street:   'Rua das Flores',
    number:   '123',
    zip_code: '01310-100',
    city:     'São Paulo',
    state:    'SP',
  }

  it('aceita dados corretos', async () => {
    await expect(stepTwoSchema.validate(valid)).resolves.toBeTruthy()
  })

  it('rejeita rua ausente', async () => {
    await expect(stepTwoSchema.validate({ ...valid, street: '' }))
      .rejects.toThrow('Rua é obrigatória')
  })

  it('rejeita CEP sem hífen', async () => {
    await expect(stepTwoSchema.validate({ ...valid, zip_code: '01310100' }))
      .rejects.toThrow('formato 00000-000')
  })

  it('rejeita CEP ausente', async () => {
    await expect(stepTwoSchema.validate({ ...valid, zip_code: undefined }))
      .rejects.toThrow('CEP é obrigatório')
  })

  it('rejeita UF inválida', async () => {
    await expect(stepTwoSchema.validate({ ...valid, state: 'XX' }))
      .rejects.toThrow('estado válido')
  })

  it('aceita todas as 27 UFs', async () => {
    const ufs = ['AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
                 'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
                 'RS','RO','RR','SC','SP','SE','TO']
    for (const state of ufs) {
      await expect(stepTwoSchema.validate({ ...valid, state })).resolves.toBeTruthy()
    }
  })
})

// ── Passo 3 ───────────────────────────────────────────────────────────────
describe('stepThreeSchema', () => {
  const valid = {
    mobile_phone:   '(11) 98765-4321',
    landline_phone: '',
  }

  it('aceita celular válido sem fixo', async () => {
    await expect(stepThreeSchema.validate(valid)).resolves.toBeTruthy()
  })

  it('aceita celular + fixo válidos', async () => {
    await expect(stepThreeSchema.validate({ ...valid, landline_phone: '(11) 3234-5678' }))
      .resolves.toBeTruthy()
  })

  it('rejeita celular no formato errado', async () => {
    await expect(stepThreeSchema.validate({ ...valid, mobile_phone: '11987654321' }))
      .rejects.toThrow('formato (00) 00000-0000')
  })

  it('rejeita celular ausente', async () => {
    await expect(stepThreeSchema.validate({ ...valid, mobile_phone: undefined }))
      .rejects.toThrow('Celular é obrigatório')
  })

  it('rejeita fixo no formato errado quando preenchido', async () => {
    await expect(stepThreeSchema.validate({ ...valid, landline_phone: '1132345678' }))
      .rejects.toThrow('formato (00) 0000-0000')
  })
})