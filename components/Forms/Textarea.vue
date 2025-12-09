<script setup lang="ts">
const props = withDefaults(defineProps<{
  modelValue?: string
  label?: string
  error?: string
  placeholder?: string
  rows?: number
}>(), {
  rows: 3,
})

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <textarea
      :value="modelValue"
      :rows="rows"
      :placeholder="placeholder"
      class="w-full rounded-md shadow-sm focus:ring-primary-500 focus:border-primary-500"
      :class="error ? 'border-red-300' : 'border-gray-300'"
      @input="emit('update:modelValue', ($event.target as HTMLTextAreaElement).value)"
    />
    <p v-if="error" class="mt-1 text-sm text-red-600">
      {{ error }}
    </p>
  </div>
</template>
