import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { registrationService } from '@/services/api'

const STORAGE_KEYS = {
  token:   'intelia_reg_token',
  step:    'intelia_reg_step',
  data:    'intelia_reg_data',
}

export const useRegistrationStore = defineStore('registration', () => {
  // ── State ────────────────────────────────────────────────────────────────
  const sessionToken = ref(localStorage.getItem(STORAGE_KEYS.token) || null)
  const currentStep  = ref(Number(localStorage.getItem(STORAGE_KEYS.step)) || 1)
  const formData     = ref(_loadData())
  const loading      = ref(false)
  const apiError     = ref(null)

  // ── Getters ──────────────────────────────────────────────────────────────
  const hasSession  = computed(() => !!sessionToken.value)
  const isCompleted = computed(() => currentStep.value > 3)

  // ── Actions ──────────────────────────────────────────────────────────────

  /**
   * Inicializa: retoma sessão existente ou cria nova
   */
  async function init() {
    loading.value  = true
    apiError.value = null
    try {
      if (sessionToken.value) {
        // Tenta retomar sessão existente no servidor
        const { data } = await registrationService.get(sessionToken.value)
        _applyServerData(data)
      } else {
        // Cria nova sessão
        const { data } = await registrationService.create()
        sessionToken.value = data.session_token
        _persist()
      }
    } catch (err) {
      // Token inválido/expirado → começa do zero
      if (err.status === 404) {
        clearSession()
        const { data } = await registrationService.create()
        sessionToken.value = data.session_token
        _persist()
      } else {
        apiError.value = err.message
      }
    } finally {
      loading.value = false
    }
  }

  /**
   * Salva dados de um passo no servidor e no localStorage
   * @param {number} step
   * @param {object} stepData
   */
  async function saveStep(step, stepData) {
    loading.value  = true
    apiError.value = null
    try {
      const { data } = await registrationService.update(sessionToken.value, step, stepData)
      _applyServerData(data)
      return true
    } catch (err) {
      apiError.value = err.message
      return false
    } finally {
      loading.value = false
    }
  }

  function clearSession() {
    sessionToken.value = null
    currentStep.value  = 1
    formData.value     = {}
    Object.values(STORAGE_KEYS).forEach((k) => localStorage.removeItem(k))
  }

  // ── Privados ─────────────────────────────────────────────────────────────
  function _applyServerData(data) {
    sessionToken.value = data.session_token
    currentStep.value  = data.completed ? 4 : data.current_step
    formData.value     = { ...formData.value, ...data }
    _persist()
  }

  function _persist() {
    if (sessionToken.value) localStorage.setItem(STORAGE_KEYS.token, sessionToken.value)
    localStorage.setItem(STORAGE_KEYS.step, currentStep.value)
    localStorage.setItem(STORAGE_KEYS.data, JSON.stringify(formData.value))
  }

  return {
    sessionToken, currentStep, formData, loading, apiError,
    hasSession, isCompleted,
    init, saveStep, clearSession,
  }
})

function _loadData() {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.data) || '{}')
  } catch {
    return {}
  }
}
