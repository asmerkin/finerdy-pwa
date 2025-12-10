<script setup lang="ts">
defineProps<{
  percentage: number
  showLabel?: boolean
  size?: 'sm' | 'md' | 'lg'
}>()

const progressColor = (percentage: number) => {
  if (percentage > 100) return 'bg-danger-600'
  if (percentage > 90) return 'bg-danger-500'
  if (percentage > 70) return 'bg-yellow-500'
  return 'bg-success-500'
}

const barHeight = (size: string) => {
  return {
    sm: 'h-1.5',
    md: 'h-2',
    lg: 'h-3',
  }[size] || 'h-2'
}

const labelSize = (size: string) => {
  return {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-base',
  }[size] || 'text-sm'
}
</script>

<template>
  <div class="w-full">
    <div v-if="showLabel !== false" class="flex justify-between items-center mb-1">
      <span :class="['font-semibold', labelSize(size || 'md')]">
        {{ percentage.toFixed(0) }}%
      </span>
    </div>
    <div :class="['bg-gray-200 rounded-full overflow-hidden', barHeight(size || 'md')]">
      <div
        :class="['h-full transition-all duration-300', progressColor(percentage)]"
        :style="{ width: `${Math.min(100, percentage)}%` }"
      />
    </div>
  </div>
</template>
