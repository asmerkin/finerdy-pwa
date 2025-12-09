<script setup lang="ts">
type Variant = 'primary' | 'secondary' | 'danger' | 'ghost'
type Size = 'sm' | 'md' | 'lg'

const props = withDefaults(defineProps<{
  type?: 'submit' | 'button' | 'reset'
  variant?: Variant
  loading?: boolean
  disabled?: boolean
  size?: Size
  to?: string
}>(), {
  type: 'submit',
  variant: 'primary',
  loading: false,
  disabled: false,
  size: 'md',
})

const variantClasses: Record<Variant, string> = {
  primary: 'bg-primary-600 hover:bg-primary-700 focus:ring-primary-500 text-white border-transparent',
  secondary: 'bg-white hover:bg-gray-50 focus:ring-primary-500 text-gray-700 border-gray-300',
  danger: 'bg-danger-600 hover:bg-danger-700 focus:ring-danger-500 text-white border-transparent',
  ghost: 'bg-transparent hover:bg-gray-100 focus:ring-primary-500 text-gray-700 border-transparent',
}

const sizeClasses: Record<Size, string> = {
  sm: 'px-3 py-1.5 text-xs',
  md: 'px-4 py-2 text-sm',
  lg: 'px-6 py-3 text-base',
}

const isDisabled = computed(() => props.disabled || props.loading)

const buttonClasses = computed(() => [
  variantClasses[props.variant],
  sizeClasses[props.size],
  'inline-flex justify-center items-center border font-medium rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2 transition-colors',
  isDisabled.value ? 'opacity-50 cursor-not-allowed' : '',
])
</script>

<template>
  <NuxtLink
    v-if="to"
    :to="to"
    :class="buttonClasses"
  >
    <CommonLoadingSpinner v-if="loading" size="sm" class="mr-2" />
    <slot />
  </NuxtLink>
  <button
    v-else
    :type="type"
    :disabled="isDisabled"
    :class="buttonClasses"
  >
    <CommonLoadingSpinner v-if="loading" size="sm" class="mr-2" />
    <slot />
  </button>
</template>
