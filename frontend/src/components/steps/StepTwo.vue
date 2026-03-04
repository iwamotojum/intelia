<template>
  <v-form @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12" sm="8">
        <v-text-field
          v-model="fields.street"
          label="Rua / Logradouro"
          prepend-inner-icon="mdi-map-marker-outline"
          :error-messages="errors.street"
          :disabled="loading"
          autocomplete="street-address"
          @blur="validateField('street')"
        />
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="fields.number"
          label="Número"
          prepend-inner-icon="mdi-home-outline"
          :error-messages="errors.number"
          :disabled="loading"
          @blur="validateField('number')"
        />
      </v-col>

      <v-col cols="12" sm="4">
        <v-text-field
          v-model="fields.zip_code"
          label="CEP"
          prepend-inner-icon="mdi-mailbox-outline"
          placeholder="00000-000"
          :error-messages="errors.zip_code"
          :disabled="loading"
          inputmode="numeric"
          autocomplete="postal-code"
          @input="fields.zip_code = maskCep($event.target.value)"
          @blur="validateField('zip_code')"
        />
      </v-col>

      <v-col cols="12" sm="5">
        <v-text-field
          v-model="fields.city"
          label="Cidade"
          prepend-inner-icon="mdi-city-variant-outline"
          :error-messages="errors.city"
          :disabled="loading"
          autocomplete="address-level2"
          @blur="validateField('city')"
        />
      </v-col>

      <v-col cols="12" sm="3">
        <v-select
          v-model="fields.state"
          label="Estado"
          :items="BR_STATES"
          prepend-inner-icon="mdi-map-outline"
          :error-messages="errors.state"
          :disabled="loading"
          @update:modelValue="validateField('state')"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2">
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
          color="primary"
          size="large"
          :loading="loading"
          :disabled="loading"
          append-icon="mdi-arrow-right"
          min-width="160"
        >
          Próximo
        </v-btn>
      </v-col>
    </v-row>
  </v-form>
</template>

<script setup>
import { reactive, onMounted } from 'vue'
import { stepTwoSchema } from '@/validators/schemas'
import { useMask } from '@/composables/useMask'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['next', 'back'])

const { maskCep } = useMask()

const BR_STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
]

const fields = reactive({
  street:   '',
  number:   '',
  zip_code: '',
  city:     '',
  state:    '',
})

const errors = reactive({
  street:   '',
  number:   '',
  zip_code: '',
  city:     '',
  state:    '',
})

onMounted(() => {
  if (props.initial) {
    Object.keys(fields).forEach((k) => {
      if (props.initial[k]) fields[k] = props.initial[k]
    })
  }
})

async function validateField(field) {
  try {
    await stepTwoSchema.validateAt(field, fields)
    errors[field] = ''
  } catch (err) {
    errors[field] = err.message
  }
}

async function handleSubmit() {
  Object.keys(errors).forEach((k) => (errors[k] = ''))
  try {
    await stepTwoSchema.validate(fields, { abortEarly: false })
    emit('next', { ...fields })
  } catch (err) {
    err.inner?.forEach((e) => {
      if (e.path in errors) errors[e.path] = e.message
    })
  }
}
</script>
