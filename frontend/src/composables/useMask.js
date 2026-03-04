/**
 * useMask — Funções de máscara reutilizáveis (KISS/DRY)
 */

export function useMask() {
  /**
   * Aplica máscara de CEP: 00000-000
   */
  function maskCep(value = '') {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/^(\d{5})(\d{1,3})/, '$1-$2')
  }

  /**
   * Aplica máscara de data: DD/MM/AAAA
   */
  function maskDate(value = '') {
    return value
      .replace(/\D/g, '')
      .slice(0, 8)
      .replace(/^(\d{2})(\d)/, '$1/$2')
      .replace(/(\d{2})\/(\d{2})(\d)/, '$1/$2/$3')
  }

  /**
   * Aplica máscara de celular: (00) 00000-0000
   */
  function maskMobilePhone(value = '') {
    const digits = value.replace(/\D/g, '').slice(0, 11)
    if (digits.length <= 2)  return digits.replace(/^(\d{0,2})/, '($1')
    if (digits.length <= 7)  return digits.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return digits.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  /**
   * Aplica máscara de telefone fixo: (00) 0000-0000
   */
  function maskLandlinePhone(value = '') {
    const digits = value.replace(/\D/g, '').slice(0, 10)
    if (digits.length <= 2)  return digits.replace(/^(\d{0,2})/, '($1')
    if (digits.length <= 6)  return digits.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
    return digits.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
  }

  /**
   * Converte data DD/MM/AAAA → AAAA-MM-DD (para envio à API)
   */
  function dateToISO(value = '') {
    const [d, m, y] = value.split('/')
    if (!d || !m || !y) return value
    return `${y}-${m}-${d}`
  }

  /**
   * Converte data AAAA-MM-DD → DD/MM/AAAA (para exibição)
   */
  function dateFromISO(value = '') {
    if (!value) return ''
    const [y, m, d] = value.split('-')
    if (!d) return value
    return `${d}/${m}/${y}`
  }

  return {
    maskCep,
    maskDate,
    maskMobilePhone,
    maskLandlinePhone,
    dateToISO,
    dateFromISO,
  }
}
