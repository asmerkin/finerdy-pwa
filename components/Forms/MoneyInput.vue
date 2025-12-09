<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string | number
  currency?: string
  label?: string
  error?: string
  allowNegative?: boolean
}>(), {
  currency: 'USD',
  allowNegative: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref(String(props.modelValue || ''))

const displayCurrency = computed(() => props.currency || 'USD')

watch(() => props.modelValue, (newValue) => {
  localValue.value = String(newValue || '')
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value = target.value

  // Reemplazar coma por punto para compatibilidad
  value = value.replace(',', '.')

  // Validar que solo contenga números, punto y opcionalmente signo negativo
  if (props.allowNegative) {
    value = value.replace(/[^0-9.-]/g, '')
  }
  else {
    value = value.replace(/[^0-9.]/g, '')
  }

  // Permitir solo un punto decimal
  const parts = value.split('.')
  if (parts.length > 2) {
    value = parts[0] + '.' + parts.slice(1).join('')
  }

  localValue.value = value
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <div class="relative rounded-md shadow-sm">
      <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">{{ displayCurrency }}</span>
      </div>
      <input
        :value="localValue"
        type="text"
        inputmode="decimal"
        class="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
        :class="error ? 'border-red-300' : 'border-gray-300'"
        style="padding-left: 3rem;"
        @input="handleInput"
      >
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
