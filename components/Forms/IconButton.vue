<script setup lang="ts">
import type { Component } from 'vue'

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  to?: string
  variant?: Variant
  icon: Component
  label?: string
  size?: Size
  type?: 'button' | 'submit' | 'reset'
}>(), {
  variant: 'primary',
  size: 'md',
  type: 'button',
})

const emit = defineEmits<{
  click: [event: MouseEvent]
}>()

const variantClasses: Record<Variant, string> = {
  primary: 'text-primary-600 hover:bg-primary-50 focus:ring-primary-500',
  secondary: 'text-gray-600 hover:bg-gray-100 focus:ring-gray-500',
  danger: 'text-danger-600 hover:bg-danger-50 focus:ring-danger-500',
  ghost: 'text-gray-500 hover:bg-gray-50 focus:ring-gray-400',
}

const sizeClasses: Record<Size, string> = {
  sm: 'gap-1.5 px-2 py-1.5 text-xs',
  md: 'gap-2 px-3 py-2 text-sm',
  lg: 'gap-2.5 px-4 py-2.5 text-base',
}

const iconSizes: Record<Size, string> = {
  sm: 'h-4 w-4',
  md: 'h-5 w-5',
  lg: 'h-6 w-6',
}

const handleClick = (e: MouseEvent) => emit('click', e)
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    ]"
  >
    <component :is="icon" :class="iconSizes[size]" />
    <span v-if="label">{{ label }}</span>
  </NuxtLink>
  <button
    v-else
    :type="type"
    :class="[
      variantClasses[variant],
      sizeClasses[size],
      'inline-flex items-center font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
    ]"
    @click="handleClick"
  >
    <component :is="icon" :class="iconSizes[size]" />
    <span v-if="label">{{ label }}</span>
  </button>
</template>
