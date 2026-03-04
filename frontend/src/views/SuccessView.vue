<template>
  <v-container class="py-16 text-center" style="max-width: 560px;">
    <v-card elevation="2" rounded="xl" class="pa-10">

      <div class="success-icon-wrap mb-6">
        <v-icon color="success" size="72">mdi-check-circle-outline</v-icon>
      </div>

      <h1 class="text-h5 font-weight-bold mb-3">
        Inscrição realizada com sucesso! 🎉
      </h1>

      <p class="text-body-1 text-medium-emphasis mb-6">
        Você está inscrito no evento
        <strong>Utilizando as soluções da Intelia para vender mais pelo telefone e WhatsApp</strong>.
        Em breve entraremos em contato com mais informações.
      </p>

      <v-divider class="mb-6" />

      <v-btn
        color="primary"
        variant="outlined"
        prepend-icon="mdi-account-plus-outline"
        @click="handleNewRegistration"
      >
        Nova inscrição
      </v-btn>
    </v-card>
  </v-container>
</template>

<script setup>
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '@/stores/registration'

const router = useRouter()
const store  = useRegistrationStore()

onMounted(() => {
  // Garante que veio de um fluxo real
  if (!store.sessionToken) {
    router.replace({ name: 'registration' })
  }
})

function handleNewRegistration() {
  store.clearSession()
  router.push({ name: 'registration' })
}
</script>

<style scoped>
.success-icon-wrap {
  animation: pop 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275) both;
}
@keyframes pop {
  from { transform: scale(0); opacity: 0; }
  to   { transform: scale(1); opacity: 1; }
}
</style>
