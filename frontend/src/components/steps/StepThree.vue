<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row>
      <!-- Celular via Web Component nativo -->
      <v-col cols="12" sm="6">
        <div class="wc-wrapper">
          <phone-input
            ref="mobileRef"
            label="Celular"
            type="mobile"
            placeholder="(00) 00000-0000"
            :value="fields.mobile_phone"
            :error="errors.mobile_phone"
            required
            @phone-change="onMobileChange"
            @phone-blur="validateField('mobile_phone')"
          />
        </div>
      </v-col>

      <!-- Telefone fixo via Web Component nativo -->
      <v-col cols="12" sm="6">
        <div class="wc-wrapper">
          <phone-input
            label="Telefone Fixo (opcional)"
            type="landline"
            placeholder="(00) 0000-0000"
            :value="fields.landline_phone"
            :error="errors.landline_phone"
            @phone-change="onLandlineChange"
            @phone-blur="validateField('landline_phone')"
          />
        </div>
      </v-col>
    </v-row>

    <v-divider class="my-6" />

    <!-- Resumo dos dados antes de finalizar -->
    <v-card variant="tonal" color="primary" rounded="lg" class="mb-6 pa-4">
      <div class="text-subtitle-2 font-weight-bold mb-3">
        <v-icon size="16" class="mr-1">mdi-eye-outline</v-icon>
        Resumo do cadastro
      </div>
      <v-row dense>
        <v-col cols="12" sm="6">
          <div class="summary-item">
            <span class="label">Nome</span>
            <span class="value">{{ initial.full_name || '—' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">E-mail</span>
            <span class="value">{{ initial.email || '—' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Nascimento</span>
            <span class="value">{{ displayDate }}</span>
          </div>
        </v-col>
        <v-col cols="12" sm="6">
          <div class="summary-item">
            <span class="label">Endereço</span>
            <span class="value">{{ displayAddress }}</span>
          </div>
          <div class="summary-item">
            <span class="label">CEP</span>
            <span class="value">{{ initial.zip_code || '—' }}</span>
          </div>
          <div class="summary-item">
            <span class="label">Cidade/UF</span>
            <span class="value">{{ displayCityState }}</span>
          </div>
        </v-col>
      </v-row>
    </v-card>

    <v-row>
      <v-col cols="12" class="d-flex justify-space-between">
        <v-btn
          variant="outlined"
          color="primary"
          size="large"
          prepend-icon="mdi-arrow-left"
          :disabled="loading"
          @click="emit('back')"
        >
          Voltar
        </v-btn>
        <v-btn
          type="submit"
          color="success"
          size="large"
          :loading="loading"
          :disabled="loading"
          append-icon="mdi-check"
          min-width="180"
        >
          Finalizar Inscrição
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { reactive, computed, onMounted } from 'vue'
import { stepThreeSchema } from '@/validators/schemas'
import { useMask } from '@/composables/useMask'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['next', 'back'])

const { dateFromISO } = useMask()

const fields = reactive({
  mobile_phone:   '',
  landline_phone: '',
})

const errors = reactive({
  mobile_phone:   '',
  landline_phone: '',
})

const displayDate    = computed(() => dateFromISO(props.initial.birth_date) || '—')
const displayAddress = computed(() =>
  props.initial.street
    ? `${props.initial.street}, ${props.initial.number}`
    : '—'
)
const displayCityState = computed(() =>
  props.initial.city
    ? `${props.initial.city} / ${props.initial.state}`
    : '—'
)

onMounted(() => {
  fields.mobile_phone   = props.initial.mobile_phone   || ''
  fields.landline_phone = props.initial.landline_phone || ''
})

function onMobileChange(e)   { fields.mobile_phone   = e.detail.value }
function onLandlineChange(e) { fields.landline_phone = e.detail.value }

async function validateField(field) {
  try {
    await stepThreeSchema.validateAt(field, fields)
    errors[field] = ''
  } catch (err) {
    errors[field] = err.message
  }
}

async function handleSubmit() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  try {
    await stepThreeSchema.validate(fields, { abortEarly: false })
    emit('next', { ...fields })
  } catch (err) {
    err.inner?.forEach((e) => {
      if (e.path in errors) errors[e.path] = e.message
    })
  }
}
</script>

<style scoped>
.wc-wrapper { margin-bottom: 4px; }
.summary-item {
  display: flex;
  flex-direction: column;
  margin-bottom: 8px;
}
.summary-item .label {
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: rgba(0,0,0,0.5);
}
.summary-item .value {
  font-size: 14px;
  color: rgba(0,0,0,0.85);
  font-weight: 500;
}
</style>
