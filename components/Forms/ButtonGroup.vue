<script setup lang="ts">
interface Option {
  value: string
  label: string
}

const props = defineProps<{
  modelValue: string
  options: Option[]
  label?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: string]
}>()

const selectOption = (value: string) => {
  emit('update:modelValue', value)
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-2">
      {{ label }}
    </label>
    <div class="inline-flex rounded-md shadow-sm w-full">
      <button
        v-for="(option, index) in options"
        :key="option.value"
        type="button"
        class="flex-1 px-4 py-2 text-sm font-medium transition-colors focus:z-10 focus:outline-none focus:ring-2 focus:ring-primary-500"
        :class="[
          modelValue === option.value
            ? 'bg-primary-600 text-white'
            : 'bg-white text-gray-700 hover:bg-gray-50',
          index === 0 ? 'rounded-l-md border' : '',
          index === options.length - 1 ? 'rounded-r-md border-t border-b border-r' : '',
          index > 0 && index < options.length - 1 ? 'border-t border-b border-r' : '',
          index === 0 ? 'border-gray-300' : 'border-gray-300',
        ]"
        @click="selectOption(option.value)"
      >
        {{ option.label }}
      </button>
    </div>
  </div>
</template>
