<template>
  <v-container class="py-8 px-4" style="max-width: 780px;">

    <!-- Header do evento -->
    <div class="event-header mb-8 text-center">
      <div class="brand-badge mb-3">
        <v-icon color="primary" size="20">mdi-lightning-bolt</v-icon>
        <span>Evento Exclusivo Intelia</span>
      </div>
      <h1 class="event-title">
        Utilizando as soluções da Intelia para
        <span class="highlight">vender mais</span>
        pelo telefone e WhatsApp
      </h1>
    </div>

    <!-- Card principal -->
    <v-card elevation="2" rounded="xl" class="overflow-hidden">

      <!-- Stepper Header -->
      <div class="stepper-header">
        <div
          v-for="(stepInfo, idx) in steps"
          :key="idx"
          class="step-item"
          :class="{
            'active':    currentStep === idx + 1,
            'completed': currentStep > idx + 1,
          }"
        >
          <div class="step-circle">
            <v-icon v-if="currentStep > idx + 1" size="16">mdi-check</v-icon>
            <span v-else>{{ idx + 1 }}</span>
          </div>
          <div class="step-info">
            <span class="step-label">Passo {{ idx + 1 }}</span>
            <span class="step-name">{{ stepInfo.name }}</span>
          </div>
          <div v-if="idx < steps.length - 1" class="step-connector" />
        </div>
      </div>

      <!-- Alerta de retomada -->
      <v-alert
        v-if="isResuming && !store.loading"
        type="info"
        variant="tonal"
        rounded="0"
        density="compact"
        class="px-6"
        icon="mdi-information-outline"
      >
        Bem-vindo de volta! Encontramos seu cadastro anterior. Continue de onde parou.
        <template #append>
          <v-btn size="x-small" variant="text" @click="handleReset">
            Recomeçar
          </v-btn>
        </template>
      </v-alert>

      <!-- Erro de API -->
      <v-alert
        v-if="store.apiError"
        type="error"
        variant="tonal"
        rounded="0"
        density="compact"
        class="px-6"
        closable
        @click:close="store.apiError = null"
      >
        {{ store.apiError }}
      </v-alert>

      <!-- Loading inicial -->
      <div v-if="store.loading" class="d-flex justify-center align-center pa-16">
        <v-progress-circular indeterminate color="primary" size="48" />
      </div>

      <!-- Conteúdo do step -->
      <div v-else class="pa-6 pa-sm-8">

        <!-- Título do passo atual -->
        <div class="step-content-header mb-6">
          <v-icon :color="steps[currentStep - 1]?.color" size="28" class="mr-2">
            {{ steps[currentStep - 1]?.icon }}
          </v-icon>
          <div>
            <div class="text-caption text-medium-emphasis">
              Passo {{ currentStep }} de 3
            </div>
            <div class="text-h6 font-weight-bold">
              {{ steps[currentStep - 1]?.name }}
            </div>
          </div>
        </div>

        <!-- Steps -->
        <Transition name="slide-fade" mode="out-in">
          <StepOne
            v-if="currentStep === 1"
            key="step1"
            :initial="store.formData"
            :loading="store.loading"
            @next="handleNext"
          />
          <StepTwo
            v-else-if="currentStep === 2"
            key="step2"
            :initial="store.formData"
            :loading="store.loading"
            @next="handleNext"
            @back="currentStep--"
          />
          <StepThree
            v-else-if="currentStep === 3"
            key="step3"
            :initial="store.formData"
            :loading="store.loading"
            @next="handleNext"
            @back="currentStep--"
          />
        </Transition>
      </div>
    </v-card>

    <!-- Rodapé -->
    <div class="text-center mt-6 text-caption text-medium-emphasis">
      Seus dados são salvos automaticamente a cada etapa.
      <v-icon size="12">mdi-shield-check-outline</v-icon>
    </div>

  </v-container>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useRegistrationStore } from '@/stores/registration'
import StepOne   from '@/components/steps/StepOne.vue'
import StepTwo   from '@/components/steps/StepTwo.vue'
import StepThree from '@/components/steps/StepThree.vue'
import { useMask } from '@/composables/useMask'

const router = useRouter()
const store  = useRegistrationStore()
const { dateToISO } = useMask()

const isResuming = ref(false)

const steps = [
  { name: 'Dados Pessoais', icon: 'mdi-account-outline',   color: 'primary' },
  { name: 'Endereço',       icon: 'mdi-map-marker-outline', color: 'secondary' },
  { name: 'Contato',        icon: 'mdi-phone-outline',      color: 'accent' },
]

const currentStep = computed({
  get: () => Math.min(store.currentStep, 3),
  set: (v) => { store.currentStep = v },
})

onMounted(async () => {
  const hadToken = !!store.sessionToken
  await store.init()
  isResuming.value = hadToken && store.currentStep > 1
})

async function handleNext(stepData) {
  const step = currentStep.value

  // Converte data para ISO antes de enviar
  if (step === 1 && stepData.birth_date) {
    stepData.birth_date = dateToISO(stepData.birth_date)
  }

  const ok = await store.saveStep(step, stepData)
  if (!ok) return

  if (step < 3) {
    store.currentStep = step + 1
  } else {
    // Concluído — redireciona para tela de sucesso
    router.push({ name: 'success' })
  }
}

async function handleReset() {
  store.clearSession()
  await store.init()
  isResuming.value = false
}
</script>

<style scoped>
.event-header { }

.brand-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  background: #EEF2FF;
  color: #1A56DB;
  border-radius: 999px;
  padding: 4px 14px;
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.3px;
}

.event-title {
  font-size: clamp(1.3rem, 3vw, 1.75rem);
  font-weight: 800;
  line-height: 1.3;
  color: #111827;
  max-width: 600px;
  margin: 0 auto;
}

.event-title .highlight {
  color: #1A56DB;
  position: relative;
}

/* Stepper customizado */
.stepper-header {
  display: flex;
  align-items: center;
  padding: 20px 24px;
  background: #F9FAFB;
  border-bottom: 1px solid #E5E7EB;
  gap: 0;
}

.step-item {
  display: flex;
  align-items: center;
  gap: 10px;
  flex: 1;
  position: relative;
}

.step-circle {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 13px;
  font-weight: 700;
  flex-shrink: 0;
  background: #E5E7EB;
  color: #6B7280;
  transition: all 0.3s ease;
}

.step-item.active .step-circle {
  background: #1A56DB;
  color: #fff;
  box-shadow: 0 0 0 4px rgba(26,86,219,0.2);
}

.step-item.completed .step-circle {
  background: #057A55;
  color: #fff;
}

.step-info {
  display: flex;
  flex-direction: column;
}

.step-label {
  font-size: 10px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #9CA3AF;
  font-weight: 600;
}

.step-name {
  font-size: 13px;
  font-weight: 700;
  color: #374151;
}

.step-item.active .step-name  { color: #1A56DB; }
.step-item.completed .step-name { color: #057A55; }

.step-connector {
  flex: 1;
  height: 2px;
  background: #E5E7EB;
  margin: 0 8px;
  min-width: 20px;
}

.step-item.completed .step-connector { background: #057A55; }

.step-content-header {
  display: flex;
  align-items: center;
}

/* Transição entre passos */
.slide-fade-enter-active,
.slide-fade-leave-active {
  transition: all 0.25s ease;
}
.slide-fade-enter-from { opacity: 0; transform: translateX(20px); }
.slide-fade-leave-to   { opacity: 0; transform: translateX(-20px); }

@media (max-width: 600px) {
  .step-info { display: none; }
  .stepper-header { justify-content: center; gap: 8px; }
}
</style>
