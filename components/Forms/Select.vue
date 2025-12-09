<script setup lang="ts">
export interface SelectOption {
  value: string | number
  label: string
}

const props = withDefaults(defineProps<{
  modelValue?: string | number
  label?: string
  error?: string
  options: SelectOption[]
  placeholder?: string
  required?: boolean
  disabled?: boolean
}>(), {})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectClasses = computed(() => [
  'mt-1 block w-full rounded-md shadow-sm sm:text-sm',
  props.error
    ? 'border-danger-300 text-danger-900 focus:border-danger-500 focus:ring-danger-500'
    : 'border-gray-300 focus:border-primary-500 focus:ring-primary-500',
  props.disabled ? 'bg-gray-100 cursor-not-allowed' : '',
])
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700">
      {{ label }}
      <span v-if="required" class="text-danger-500">*</span>
    </label>
    <select
      :value="modelValue"
      :required="required"
      :disabled="disabled"
      :class="selectClasses"
      @change="emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
    >
      <option v-if="placeholder" value="">
        {{ placeholder }}
      </option>
      <option
        v-for="option in options"
        :key="option.value"
        :value="option.value"
      >
        {{ option.label }}
      </option>
    </select>
    <p v-if="error" class="mt-1 text-sm text-danger-600">
      {{ error }}
    </p>
  </div>
</template>
