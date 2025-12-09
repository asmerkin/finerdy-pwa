<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  error?: string
  help?: string
  allowEmpty?: boolean
}>(), {
  allowEmpty: false,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const localValue = ref('')
const isInitialized = ref(false)

const getTimezoneOffset = () => {
  const now = new Date()
  const offsetMinutes = now.getTimezoneOffset()
  const sign = offsetMinutes <= 0 ? '+' : '-'
  const absOffset = Math.abs(offsetMinutes)
  const hours = String(Math.floor(absOffset / 60)).padStart(2, '0')
  const minutes = String(absOffset % 60).padStart(2, '0')
  return `${sign}${hours}:${minutes}`
}

const parseISOToLocal = (isoString: string) => {
  if (!isoString) return ''
  const date = new Date(isoString)
  const year = date.getFullYear()
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const day = String(date.getDate()).padStart(2, '0')
  const hours = String(date.getHours()).padStart(2, '0')
  const minutes = String(date.getMinutes()).padStart(2, '0')
  return `${year}-${month}-${day}T${hours}:${minutes}`
}

const localToISO = (localDateTime: string) => {
  if (!localDateTime) return ''
  const offset = getTimezoneOffset()
  return `${localDateTime}:00${offset}`
}

onMounted(() => {
  if (props.modelValue) {
    localValue.value = parseISOToLocal(props.modelValue)
    nextTick(() => {
      emit('update:modelValue', localToISO(localValue.value))
      isInitialized.value = true
    })
  }
  else if (!props.allowEmpty) {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')
    const hours = String(now.getHours()).padStart(2, '0')
    const minutes = String(now.getMinutes()).padStart(2, '0')
    localValue.value = `${year}-${month}-${day}T${hours}:${minutes}`
    emit('update:modelValue', localToISO(localValue.value))
    isInitialized.value = true
  }
})

watch(() => props.modelValue, (newValue) => {
  if (isInitialized.value && newValue) {
    const expectedLocal = parseISOToLocal(newValue)
    if (expectedLocal !== localValue.value) {
      localValue.value = expectedLocal
    }
  }
})

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  localValue.value = target.value
  emit('update:modelValue', localToISO(target.value))
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <input
      :value="localValue"
      type="datetime-local"
      class="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
      :class="error ? 'border-red-300' : 'border-gray-300'"
      @input="handleInput"
    >
    <p v-if="help && !error" class="mt-1 text-xs text-gray-500">
      {{ help }}
    </p>
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
