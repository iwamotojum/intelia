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

  _mask(value = '') {
    const type   = this.getAttribute('type') || 'mobile'
    const digits = value.replace(/\D/g, '')

    if (type === 'landline') {
      const d = digits.slice(0, 10)
      if (d.length <= 2)  return d.replace(/^(\d{0,2})/, '($1')
      if (d.length <= 6)  return d.replace(/^(\d{2})(\d{0,4})/, '($1) $2')
      return d.replace(/^(\d{2})(\d{4})(\d{0,4})/, '($1) $2-$3')
    }

    // mobile (padrão)
    const d = digits.slice(0, 11)
    if (d.length <= 2)  return d.replace(/^(\d{0,2})/, '($1')
    if (d.length <= 7)  return d.replace(/^(\d{2})(\d{0,5})/, '($1) $2')
    return d.replace(/^(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3')
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
          color: #374151;
          letter-spacing: 0.3px;
        }
        label .required { color: #E02424; margin-left: 2px; }
        .input-wrap {
          display: flex;
          align-items: center;
          border: 2px solid #D1D5DB;
          border-radius: 8px;
          background: #fff;
          transition: border-color 0.2s, box-shadow 0.2s;
          padding: 0 12px;
          gap: 8px;
        }
        .input-wrap:focus-within {
          border-color: #1A56DB;
          box-shadow: 0 0 0 3px rgba(26,86,219,0.15);
        }
        .input-wrap.has-error {
          border-color: #E02424;
        }
        .icon { color: #6B7280; font-size: 18px; flex-shrink: 0; }
        input {
          border: none;
          outline: none;
          background: transparent;
          font-family: inherit;
          font-size: 15px;
          color: #111827;
          padding: 12px 0;
          width: 100%;
          letter-spacing: 0.5px;
        }
        input::placeholder { color: #9CA3AF; }
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
          <span class="icon">📞</span>
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
      const masked = this._mask(e.target.value)
      e.target.value = masked
      this._value    = masked
      this.dispatchEvent(new CustomEvent('phone-change', {
        detail: { value: masked },
        bubbles: true,
        composed: true,
      }))
    })

    input.addEventListener('blur', () => {
      this.dispatchEvent(new CustomEvent('phone-blur', {
        detail: { value: this._value },
        bubbles: true,
        composed: true,
      }))
    })
  }
}

if (!customElements.get('phone-input')) {
  customElements.define('phone-input', PhoneInput)
}
