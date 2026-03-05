import { setActivePinia, createPinia } from 'pinia'
import { useRegistrationStore } from '@/stores/registration'

// ── Mock da API ───────────────────────────────────────────────────────────
vi.mock('@/services/api', () => ({
  registrationService: {
    create: vi.fn(),
    get:    vi.fn(),
    update: vi.fn(),
  },
}))

import { registrationService } from '@/services/api'

// ── Mock do localStorage ──────────────────────────────────────────────────
const storage = {}
const localStorageMock = {
  getItem:    (k) => storage[k] ?? null,
  setItem:    (k, v) => { storage[k] = String(v) },
  removeItem: (k) => { delete storage[k] },
  clear:      () => { Object.keys(storage).forEach((k) => delete storage[k]) },
}
Object.defineProperty(global, 'localStorage', { value: localStorageMock })

// ── Helpers ───────────────────────────────────────────────────────────────
const mockSession = (overrides = {}) => ({
  session_token: 'tok_abc',
  current_step:  1,
  completed:     false,
  ...overrides,
})

// ─────────────────────────────────────────────────────────────────────────────
describe('useRegistrationStore', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorageMock.clear()
    vi.clearAllMocks()
  })

  // ── init ──────────────────────────────────────────────────────────────────
  describe('init()', () => {
    it('cria nova sessão quando não há token salvo', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })

      const store = useRegistrationStore()
      await store.init()

      expect(registrationService.create).toHaveBeenCalledOnce()
      expect(store.sessionToken).toBe('tok_abc')
      expect(store.currentStep).toBe(1)
    })

    it('retoma sessão existente quando há token no localStorage', async () => {
      localStorageMock.setItem('intelia_reg_token', 'tok_existente')
      registrationService.get.mockResolvedValue({
        data: mockSession({ session_token: 'tok_existente', current_step: 2, full_name: 'Maria' }),
      })

      const store = useRegistrationStore()
      await store.init()

      expect(registrationService.get).toHaveBeenCalledWith('tok_existente')
      expect(store.currentStep).toBe(2)
      expect(store.formData.full_name).toBe('Maria')
    })

    it('recria sessão quando o token retorna 404', async () => {
      localStorageMock.setItem('intelia_reg_token', 'tok_expirado')
      registrationService.get.mockRejectedValue({ status: 404, message: 'Not found' })
      registrationService.create.mockResolvedValue({ data: mockSession({ session_token: 'tok_novo' }) })

      const store = useRegistrationStore()
      await store.init()

      expect(store.sessionToken).toBe('tok_novo')
      expect(store.currentStep).toBe(1)
    })

    it('define apiError em erro genérico', async () => {
      localStorageMock.setItem('intelia_reg_token', 'tok_qualquer')
      registrationService.get.mockRejectedValue({ status: 500, message: 'Erro interno' })

      const store = useRegistrationStore()
      await store.init()

      expect(store.apiError).toBe('Erro interno')
    })

    it('loading é true durante a chamada e false ao terminar', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })

      const store = useRegistrationStore()
      const promise = store.init()
      expect(store.loading).toBe(true)

      await promise
      expect(store.loading).toBe(false)
    })
  })

  // ── saveStep ──────────────────────────────────────────────────────────────
  describe('saveStep()', () => {
    it('salva dados e retorna true em sucesso', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })
      const store = useRegistrationStore()
      await store.init()

      registrationService.update.mockResolvedValue({
        data: mockSession({ current_step: 2, full_name: 'João' }),
      })

      const result = await store.saveStep(1, { full_name: 'João' })

      expect(result).toBe(true)
      expect(store.formData.full_name).toBe('João')
      expect(store.currentStep).toBe(2)
    })

    it('retorna false e define apiError em caso de erro', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })
      const store = useRegistrationStore()
      await store.init()

      registrationService.update.mockRejectedValue({ message: 'E-mail já cadastrado' })

      const result = await store.saveStep(1, { email: 'dup@teste.com' })

      expect(result).toBe(false)
      expect(store.apiError).toBe('E-mail já cadastrado')
    })

    it('usa saving e NÃO loading durante o salvamento', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })
      const store = useRegistrationStore()
      await store.init()

      let savingDurante  = false
      let loadingDurante = false

      registrationService.update.mockImplementation(async () => {
        savingDurante  = store.saving
        loadingDurante = store.loading
        return { data: mockSession() }
      })

      await store.saveStep(1, {})

      expect(savingDurante).toBe(true)
      expect(loadingDurante).toBe(false)  // formulário não some
      expect(store.saving).toBe(false)    // reseta após terminar
    })
  })

  // ── clearSession ──────────────────────────────────────────────────────────
  describe('clearSession()', () => {
    it('limpa token, step, dados e localStorage', async () => {
      registrationService.create.mockResolvedValue({ data: mockSession() })
      registrationService.update.mockResolvedValue({
        data: mockSession({ current_step: 2, full_name: 'Ana' }),
      })

      const store = useRegistrationStore()
      await store.init()
      await store.saveStep(1, { full_name: 'Ana' })

      store.clearSession()

      expect(store.sessionToken).toBeNull()
      expect(store.currentStep).toBe(1)
      expect(store.formData).toEqual({})
      expect(localStorageMock.getItem('intelia_reg_token')).toBeNull()
    })
  })
})
