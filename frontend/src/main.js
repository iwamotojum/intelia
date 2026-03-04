import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { createVuetify } from 'vuetify'
import { createRouter, createWebHistory } from 'vue-router'
import * as components from 'vuetify/components'
import * as directives from 'vuetify/directives'
import 'vuetify/styles'
import '@mdi/font/css/materialdesignicons.css'

import App from './App.vue'
import RegistrationView from './views/RegistrationView.vue'
import SuccessView from './views/SuccessView.vue'

// ── Web Components (pontos extras) ────────────────────────────────────────
import './web-components/PhoneInput.js'

// ── Temas Intelia ──────────────────────────────────────────────────────────
const inteliaLight = {
  dark: false,
  colors: {
    primary:       '#2563EB',
    secondary:     '#1D4ED8',
    accent:        '#3B82F6',
    error:         '#DC2626',
    warning:       '#D97706',
    info:          '#2563EB',
    success:       '#059669',
    surface:       '#FFFFFF',
    background:    '#F1F5F9',
    'on-surface':  '#111827',
  }
}

const inteliaDark = {
  dark: true,
  colors: {
    primary:       '#3B82F6',
    secondary:     '#2563EB',
    accent:        '#60A5FA',
    error:         '#EF4444',
    warning:       '#F59E0B',
    info:          '#3B82F6',
    success:       '#10B981',
    surface:       '#1E2533',
    background:    '#111827',
    'on-surface':  '#F9FAFB',
  }
}

const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'inteliaLight',
    themes: { inteliaLight, inteliaDark },
  },
  defaults: {
    VTextField: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VSelect: {
      variant: 'outlined',
      density: 'comfortable',
      color: 'primary',
    },
    VBtn: {
      rounded: 'lg',
      elevation: 0,
    }
  }
})

// ── Router ─────────────────────────────────────────────────────────────────
const router = createRouter({
  history: createWebHistory(),
  routes: [
    { path: '/',        name: 'registration', component: RegistrationView },
    { path: '/sucesso', name: 'success',      component: SuccessView },
  ]
})

// ── App ────────────────────────────────────────────────────────────────────
const app = createApp(App)
app.use(createPinia())
app.use(vuetify)
app.use(router)
app.mount('#app')
