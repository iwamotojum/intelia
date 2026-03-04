<template>
  <v-app>
    <v-main :style="{ background: theme.current.value.colors.background, minHeight: '100vh' }">
      <router-view />
    </v-main>

    <!-- Toggle dark mode fixo no canto -->
    <v-btn
      :icon="isDark ? 'mdi-weather-sunny' : 'mdi-weather-night'"
      :color="isDark ? 'warning' : 'secondary'"
      style="position: fixed; bottom: 24px; right: 24px; z-index: 999;"
      elevation="3"
      size="small"
      @click="toggleTheme"
    />
  </v-app>
</template>

<script setup>
import { computed } from 'vue'
import { useTheme } from 'vuetify'

const theme  = useTheme()
const isDark = computed(() => theme.global.current.value.dark)

function toggleTheme() {
  theme.global.name.value = isDark.value ? 'inteliaLight' : 'inteliaDark'
}
</script>

<style>
* { font-family: 'Plus Jakarta Sans', sans-serif; }
/* Stepper header adapta ao tema */
.v-theme--inteliaDark .stepper-header {
  background: #1E2533 !important;
  border-bottom-color: rgba(255,255,255,0.08) !important;
}

.v-theme--inteliaDark .step-name  { color: #E5E7EB !important; }
.v-theme--inteliaDark .step-label { color: #6B7280 !important; }
.v-theme--inteliaDark .step-connector { background: #374151 !important; }
</style>