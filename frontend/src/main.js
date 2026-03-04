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

// ── Vuetify com tema customizado Material Design ───────────────────────────
const vuetify = createVuetify({
  components,
  directives,
  theme: {
    defaultTheme: 'inteliaTheme',
    themes: {
      inteliaTheme: {
        dark: false,
        colors: {
          primary:    '#1A56DB',
          secondary:  '#0E9F6E',
          accent:     '#FF5A1F',
          error:      '#E02424',
          warning:    '#C27803',
          info:       '#1C64F2',
          success:    '#057A55',
          surface:    '#FFFFFF',
          background: '#F3F4F6',
        }
      }
    }
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
