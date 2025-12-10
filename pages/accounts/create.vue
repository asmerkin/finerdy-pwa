<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

const router = useRouter()
const { post } = useApiMutation()
const auth = useAuthStore()
const toast = useToast()

const form = reactive({
  name: '',
  currency: auth.workspace?.default_currency || 'USD',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// Currency options
const currencies = [
  { value: 'USD', label: 'USD - Dólar estadounidense' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'ARS', label: 'ARS - Peso argentino' },
  { value: 'MXN', label: 'MXN - Peso mexicano' },
  { value: 'CLP', label: 'CLP - Peso chileno' },
  { value: 'COP', label: 'COP - Peso colombiano' },
  { value: 'BRL', label: 'BRL - Real brasileño' },
  { value: 'GBP', label: 'GBP - Libra esterlina' },
  { value: 'JPY', label: 'JPY - Yen japonés' },
]

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await post('/accounts', form)
    toast.success('Cuenta creada exitosamente')
    router.push('/accounts')
  }
  catch (error: any) {
    errors.value = error.data?.errors || {}
    toast.error('Ocurrió un error al crear la cuenta')
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/accounts"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        Nueva Cuenta
      </h2>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsInput
          v-model="form.name"
          label="Nombre"
          :error="errors.name?.[0]"
          placeholder="Ej: Banco Nación, Efectivo..."
          required
        />

        <FormsSelect
          v-model="form.currency"
          label="Moneda"
          :error="errors.currency?.[0]"
          :options="currencies"
          placeholder="Seleccionar moneda"
          required
        />

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/accounts"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </NuxtLink>
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Crear Cuenta
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
