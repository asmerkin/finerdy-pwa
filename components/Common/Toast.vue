<script setup lang="ts">
import { computed } from 'vue'
import {
  CheckCircleIcon,
  ExclamationCircleIcon,
  InformationCircleIcon,
  XMarkIcon,
} from '@heroicons/vue/24/outline'

export interface Toast {
  id: string
  type: 'success' | 'error' | 'info' | 'warning'
  message: string
  duration?: number
}

const props = defineProps<{
  toast: Toast
}>()

const emit = defineEmits<{
  close: []
}>()

const icon = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return CheckCircleIcon
    case 'error':
      return ExclamationCircleIcon
    case 'warning':
      return ExclamationCircleIcon
    case 'info':
      return InformationCircleIcon
  }
})

const bgColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'bg-green-50 border-green-500'
    case 'error':
      return 'bg-red-50 border-red-500'
    case 'warning':
      return 'bg-yellow-50 border-yellow-500'
    case 'info':
      return 'bg-blue-50 border-blue-500'
  }
})

const iconColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-600'
    case 'error':
      return 'text-red-600'
    case 'warning':
      return 'text-yellow-600'
    case 'info':
      return 'text-blue-600'
  }
})

const textColor = computed(() => {
  switch (props.toast.type) {
    case 'success':
      return 'text-green-900'
    case 'error':
      return 'text-red-900'
    case 'warning':
      return 'text-yellow-900'
    case 'info':
      return 'text-blue-900'
  }
})
</script>

<template>
  <div
    :class="[
      'pointer-events-auto w-full max-w-sm overflow-hidden rounded-lg border-l-4 shadow-lg',
      bgColor,
    ]"
  >
    <div class="p-4">
      <div class="flex items-start">
        <div class="flex-shrink-0">
          <component :is="icon" :class="['h-6 w-6', iconColor]" />
        </div>
        <div class="ml-3 w-0 flex-1 pt-0.5">
          <p :class="['text-sm font-medium', textColor]">
            {{ toast.message }}
          </p>
        </div>
        <div class="ml-4 flex flex-shrink-0">
          <button
            type="button"
            @click="emit('close')"
            :class="[
              'inline-flex rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2',
              textColor,
              toast.type === 'success' && 'hover:text-green-700 focus:ring-green-500',
              toast.type === 'error' && 'hover:text-red-700 focus:ring-red-500',
              toast.type === 'warning' && 'hover:text-yellow-700 focus:ring-yellow-500',
              toast.type === 'info' && 'hover:text-blue-700 focus:ring-blue-500',
            ]"
          >
            <span class="sr-only">Cerrar</span>
            <XMarkIcon class="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
