import { useMask } from '@/composables/useMask'

const { maskCep, maskDate, maskMobilePhone, maskLandlinePhone, dateToISO, dateFromISO } = useMask()

// ── maskCep ───────────────────────────────────────────────────────────────
describe('maskCep', () => {
  it('formata CEP completo', () => {
    expect(maskCep('01310100')).toBe('01310-100')
  })

  it('não adiciona hífen em entrada parcial', () => {
    expect(maskCep('0131')).toBe('0131')
  })

  it('remove caracteres não numéricos', () => {
    expect(maskCep('013.10-abc')).toBe('01310')
  })

  it('limita a 8 dígitos', () => {
    expect(maskCep('012345678999')).toBe('01234-567')
  })

  it('retorna vazio para entrada vazia', () => {
    expect(maskCep('')).toBe('')
  })
})

// ── maskDate ──────────────────────────────────────────────────────────────
describe('maskDate', () => {
  it('formata data completa DD/MM/AAAA', () => {
    expect(maskDate('01021990')).toBe('01/02/1990')
  })

  it('entrada parcial de 4 dígitos', () => {
    expect(maskDate('0102')).toBe('01/02')
  })

  it('entrada parcial de 2 dígitos', () => {
    expect(maskDate('01')).toBe('01')
  })

  it('ignora barras já existentes na entrada', () => {
    expect(maskDate('01/02/1990')).toBe('01/02/1990')
  })

  it('limita a 8 dígitos', () => {
    expect(maskDate('010219901234')).toBe('01/02/1990')
  })
})

// ── maskMobilePhone ───────────────────────────────────────────────────────
describe('maskMobilePhone', () => {
  it('formata celular completo', () => {
    expect(maskMobilePhone('11987654321')).toBe('(11) 98765-4321')
  })

  it('entrada parcial com DDD', () => {
    expect(maskMobilePhone('11')).toBe('(11')
  })

  it('entrada parcial com DDD + primeiros dígitos', () => {
    expect(maskMobilePhone('119876')).toBe('(11) 9876')
  })

  it('limita a 11 dígitos', () => {
    expect(maskMobilePhone('119876543219999')).toBe('(11) 98765-4321')
  })
})

// ── maskLandlinePhone ─────────────────────────────────────────────────────
describe('maskLandlinePhone', () => {
  it('formata telefone fixo completo', () => {
    expect(maskLandlinePhone('1132345678')).toBe('(11) 3234-5678')
  })

  it('entrada parcial', () => {
    expect(maskLandlinePhone('11323')).toBe('(11) 323')
  })

  it('limita a 10 dígitos', () => {
    expect(maskLandlinePhone('11323456789999')).toBe('(11) 3234-5678')
  })
})

// ── dateToISO ─────────────────────────────────────────────────────────────
describe('dateToISO', () => {
  it('converte DD/MM/AAAA para AAAA-MM-DD', () => {
    expect(dateToISO('25/12/1990')).toBe('1990-12-25')
  })

  it('retorna o valor original se não tiver barras', () => {
    expect(dateToISO('invalido')).toBe('invalido')
  })

  it('lida com string vazia', () => {
    expect(dateToISO('')).toBe('')
  })
})

// ── dateFromISO ───────────────────────────────────────────────────────────
describe('dateFromISO', () => {
  it('converte AAAA-MM-DD para DD/MM/AAAA', () => {
    expect(dateFromISO('1990-12-25')).toBe('25/12/1990')
  })

  it('retorna string vazia para entrada vazia', () => {
    expect(dateFromISO('')).toBe('')
  })

  it('retorna o valor original se não tiver dia', () => {
    expect(dateFromISO('1990-12')).toBe('1990-12')
  })
})
