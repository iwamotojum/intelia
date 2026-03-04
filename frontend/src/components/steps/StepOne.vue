<template>
  <v-form ref="formRef" @submit.prevent="handleSubmit">
    <v-row>
      <v-col cols="12">
        <v-text-field
          v-model="fields.full_name"
          label="Nome Completo"
          prepend-inner-icon="mdi-account-outline"
          :error-messages="errors.full_name"
          :disabled="loading"
          autocomplete="name"
          counter="150"
          @blur="validateField('full_name')"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fields.birth_date"
          label="Data de Nascimento"
          prepend-inner-icon="mdi-calendar-outline"
          placeholder="DD/MM/AAAA"
          :error-messages="errors.birth_date"
          :disabled="loading"
          inputmode="numeric"
          autocomplete="bday"
          @input="fields.birth_date = maskDate($event.target.value)"
          @blur="validateField('birth_date')"
        />
      </v-col>

      <v-col cols="12" sm="6">
        <v-text-field
          v-model="fields.email"
          label="E-mail"
          type="email"
          prepend-inner-icon="mdi-email-outline"
          :error-messages="errors.email"
          :disabled="loading"
          autocomplete="email"
          @blur="validateField('email')"
        />
      </v-col>
    </v-row>

    <v-row class="mt-2">
      <v-col cols="12" class="d-flex justify-end">
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
import { reactive, ref, onMounted } from 'vue'
import { useForm } from 'vee-validate'
import { toTypedSchema } from '@vee-validate/yup'
import { stepOneSchema } from '@/validators/schemas'
import { useMask } from '@/composables/useMask'

const props = defineProps({
  initial: { type: Object, default: () => ({}) },
  loading: { type: Boolean, default: false },
})
const emit = defineEmits(['next'])

const { maskDate, dateFromISO } = useMask()

const fields = reactive({
  full_name:  '',
  birth_date: '',
  email:      '',
})

const errors = reactive({
  full_name:  '',
  birth_date: '',
  email:      '',
})

const { validate, setValues } = useForm({
  validationSchema: toTypedSchema(stepOneSchema),
  initialValues: fields,
})

onMounted(() => {
  if (props.initial) {
    fields.full_name  = props.initial.full_name  || ''
    fields.birth_date = props.initial.birth_date
      ? dateFromISO(props.initial.birth_date)
      : ''
    fields.email      = props.initial.email || ''
    setValues({ ...fields })
  }
})

async function validateField(field) {
  try {
    await stepOneSchema.validateAt(field, fields)
    errors[field] = ''
  } catch (err) {
    errors[field] = err.message
  }
}

async function handleSubmit() {
  // Limpa erros anteriores
  Object.keys(errors).forEach((k) => (errors[k] = ''))

  try {
    await stepOneSchema.validate(fields, { abortEarly: false })
    emit('next', { ...fields })
  } catch (err) {
    err.inner?.forEach((e) => {
      if (e.path in errors) errors[e.path] = e.message
    })
  }
}
</script>
