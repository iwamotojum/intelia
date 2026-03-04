import axios from 'axios'

const api = axios.create({
  baseURL: (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/api/v1',
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
})

// Interceptor de erros global
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message =
      error.response?.data?.errors?.[0] ||
      error.response?.data?.error ||
      'Erro de conexão. Tente novamente.'
    return Promise.reject({ message, status: error.response?.status, raw: error })
  }
)

export const registrationService = {
  /**
   * Cria uma nova sessão de cadastro (retorna session_token)
   */
  create() {
    return api.post('/registrations')
  },

  /**
   * Retoma uma sessão existente pelo token
   * @param {string} token
   */
  get(token) {
    return api.get(`/registrations/${token}`)
  },

  /**
   * Salva os dados de um passo
   * @param {string} token
   * @param {number} step
   * @param {object} data
   */
  update(token, step, data) {
    return api.patch(`/registrations/${token}`, {
      current_step: step,
      registration: data,
    })
  },
}
