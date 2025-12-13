<script setup lang="ts">
import {
  Listbox,
  ListboxButton,
  ListboxOptions,
  ListboxOption,
} from '@headlessui/vue'
import { CheckIcon, ChevronUpDownIcon } from '@heroicons/vue/24/outline'

interface Option {
  id: number
  name: string
}

const props = defineProps<{
  modelValue: number[]
  options: Option[]
  label?: string
  placeholder?: string
  allText?: string
}>()

const emit = defineEmits<{
  'update:modelValue': [value: number[]]
}>()

const haptics = useHaptics()

const selected = computed({
  get: () => props.modelValue,
  set: (value) => {
    haptics.selection()
    emit('update:modelValue', value)
  },
})

const displayText = computed(() => {
  if (!selected.value || selected.value.length === 0) {
    return props.allText || 'Todos'
  }

  if (selected.value.length <= 2) {
    const selectedOptions = props.options.filter(opt =>
      selected.value.some(id => id == opt.id),
    )
    return selectedOptions.map(opt => opt.name).join(', ')
  }

  return `${selected.value.length} seleccionados`
})

const isSelected = (optionId: number) => {
  return selected.value.some(id => id == optionId)
}
</script>

<template>
  <div>
    <label v-if="label" class="block text-sm font-medium text-gray-700 mb-1">
      {{ label }}
    </label>
    <Listbox v-model="selected" multiple>
      <div class="relative">
        <ListboxButton
          class="relative w-full cursor-pointer rounded-md border border-gray-300 bg-white py-2 pl-3 pr-10 text-left shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 text-sm"
        >
          <span class="block truncate">{{ displayText }}</span>
          <span class="pointer-events-none absolute inset-y-0 right-0 flex items-center pr-2">
            <ChevronUpDownIcon class="h-5 w-5 text-gray-400" aria-hidden="true" />
          </span>
        </ListboxButton>

        <transition
          leave-active-class="transition ease-in duration-75"
          leave-from-class="opacity-100"
          leave-to-class="opacity-0"
          enter-active-class="transition ease-out duration-100"
          enter-from-class="opacity-0"
          enter-to-class="opacity-100"
        >
          <ListboxOptions
            class="absolute z-50 mt-1 max-h-60 w-full overflow-auto rounded-md bg-white py-1 text-sm shadow-xl border border-gray-200 focus:outline-none"
          >
            <ListboxOption
              v-for="option in options"
              :key="option.id"
              v-slot="{ active }"
              :value="option.id"
              class="cursor-pointer select-none"
            >
              <div
                :class="[
                  'relative py-2.5 pl-10 pr-4 transition-colors',
                  active && !isSelected(option.id) ? 'bg-gray-100' : '',
                  isSelected(option.id) ? 'bg-primary-50 text-primary-700' : 'text-gray-900',
                ]"
              >
                <span class="block truncate font-medium">
                  {{ option.name }}
                </span>
                <span
                  v-if="isSelected(option.id)"
                  class="absolute inset-y-0 left-0 flex items-center pl-3 text-primary-600"
                >
                  <CheckIcon class="h-5 w-5" aria-hidden="true" />
                </span>
              </div>
            </ListboxOption>
          </ListboxOptions>
        </transition>
      </div>
    </Listbox>
  </div>
</template>
