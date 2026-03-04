/**
 * <phone-input> — Web Component nativo para campos de telefone
 *
 * Atributos:
 *   label       — rótulo do campo
 *   type        — "mobile" (padrão) | "landline"
 *   value       — valor inicial
 *   placeholder — placeholder
 *   error       — mensagem de erro
 *   required    — campo obrigatório
 *
 * Eventos:
 *   phone-change — dispara com { value } ao alterar
 *   phone-blur   — dispara ao perder o foco
 */
class PhoneInput extends HTMLElement {
  static get observedAttributes() {
    return ['value', 'error', 'label', 'type', 'placeholder', 'required']
  }

  constructor() {
    super()
    this.attachShadow({ mode: 'open' })
    this._value = ''
  }

  connectedCallback() {
    this._value = this.getAttribute('value') || ''
    this._render()
    this._attachEvents()
  }

  attributeChangedCallback(name, oldVal, newVal) {
    if (oldVal === newVal) return
    if (name === 'value' && newVal !== this._value) {
      this._value = newVal || ''
      const input = this.shadowRoot?.querySelector('input')
      if (input) input.value = this._mask(this._value)
    }
    if (name === 'error') {
      const helper = this.shadowRoot?.querySelector('.helper')
      if (helper) {
        helper.textContent = newVal || ''
        helper.style.display = newVal ? 'block' : 'none'
      }
    }
  }

  /**
   * Detecta se o valor vem com código de país
   * Retorna: { countryCode, digits }
   */
  _parsePhone(value = '') {
    const raw = value.replace(/\s/g, '')

    // Veio com + na frente (autocomplete internacional)
    if (raw.startsWith('+')) {
      // +55 → Brasil
      if (raw.startsWith('+55')) {
        return { countryCode: '55', digits: raw.replace('+55', '').replace(/\D/g, '') }
      }
      // Outro país
      return { countryCode: 'foreign', digits: '' }
    }

    // Veio sem código de país — aceita normalmente
    return { countryCode: null, digits: raw.replace(/\D/g, '') }
  }

  _mask(value = '') {
    const type   = this.getAttribute('type') || 'mobile'
    const digits = value.replace(/\D/g, '')

    if (type === 'landline') {
      const d = digits.slice(0, 10)
      if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1')
      if (d.length <= 6) return d.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
      return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }

    const d = digits.slice(0, 11)
    if (d.length <= 2) return d.replace(/^(\d{0,2})/, '($1')
    if (d.length <= 7) return d.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
  }

  _setError(msg) {
    const helper = this.shadowRoot?.querySelector('.helper')
    const wrap   = this.shadowRoot?.querySelector('.input-wrap')
    if (helper) { helper.textContent = msg; helper.style.display = 'block' }
    if (wrap)   wrap.classList.add('has-error')
  }

  _clearError() {
    const helper = this.shadowRoot?.querySelector('.helper')
    const wrap   = this.shadowRoot?.querySelector('.input-wrap')
    if (helper) { helper.textContent = this.getAttribute('error') || ''; helper.style.display = this.getAttribute('error') ? 'block' : 'none' }
    if (wrap)   wrap.classList.remove('has-error')
  }

  _render() {
    const label       = this.getAttribute('label') || ''
    const placeholder = this.getAttribute('placeholder') || ''
    const error       = this.getAttribute('error') || ''
    const required    = this.hasAttribute('required')

    this.shadowRoot.innerHTML = `
      <style>
        :host { display: block; font-family: 'Plus Jakarta Sans', sans-serif; }
        .wrapper { display: flex; flex-direction: column; gap: 4px; }
        label {
          font-size: 12px;
          font-weight: 600;
          color: rgba(var(--v-theme-on-surface, 17 24 39), 0.7);
          letter-spacing: 0.3px;
        }
        label .required { color: #E02424; margin-left: 2px; }
        .input-wrap {
          display: flex;
          align-items: center;
          border: 2px solid rgba(var(--v-theme-on-surface, 17 24 39), 0.2);
          border-radius: 8px;
          background: transparent;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 0 12px;
          gap: 8px;
        }
        .input-wrap:focus-within {
          border-color: #2563EB;
          box-shadow: 0 0 0 3px rgba(37,99,235,0.15);
        }
        .input-wrap.has-error { border-color: #E02424; }
        input {
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: 15px;
          color: inherit;
          padding: 12px 0;
          width: 100%;
          letter-spacing: 0.5px;
          color-scheme: light dark;
        }
        input::placeholder { color: rgba(var(--v-theme-on-surface, 17 24 39), 0.4); }
        .helper {
          font-size: 11px;
          color: #E02424;
          min-height: 16px;
          display: ${error ? 'block' : 'none'};
        }
      </style>
      <div class="wrapper">
        <label>
          ${label}${required ? '<span class="required">*</span>' : ''}
        </label>
        <div class="input-wrap ${error ? 'has-error' : ''}">
          <input
            type="tel"
            placeholder="${placeholder}"
            value="${this._mask(this._value)}"
            autocomplete="tel"
          />
        </div>
        <span class="helper">${error}</span>
      </div>
    `
  }

  _attachEvents() {
    const input = this.shadowRoot.querySelector('input')
    if (!input) return

    input.addEventListener('input', (e) => {
      const { countryCode, digits } = this._parsePhone(e.target.value)

      // Veio com código de país estrangeiro — bloqueia
      if (countryCode === 'foreign') {
        e.target.value = ''
        this._value = ''
        this._setError('Informe apenas números do Brasil (+55)')
        this.dispatchEvent(new CustomEvent('phone-change', {
          detail: { value: '', valid: false },
          bubbles: true, composed: true,
        }))
        return
      }

      this._clearError()
      const masked   = this._mask(digits || e.target.value)
      e.target.value = masked
      this._value    = masked

      this.dispatchEvent(new CustomEvent('phone-change', {
        detail: { value: masked, valid: true },
        bubbles: true, composed: true,
      }))
    })

    input.addEventListener('blur', () => {
      this.dispatchEvent(new CustomEvent('phone-blur', {
        detail: { value: this._value },
        bubbles: true, composed: true,
      }))
    })
  }
}

if (!customElements.get('phone-input')) {
  customElements.define('phone-input', PhoneInput)
}
