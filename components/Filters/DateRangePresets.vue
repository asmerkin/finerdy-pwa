<script setup lang="ts">
import { startOfDay, endOfDay, startOfWeek, endOfWeek, startOfMonth, endOfMonth, startOfYear, endOfYear, subMonths, format } from 'date-fns'

const { t } = useI18n()

interface DateRange {
  from: string
  until: string
}

const props = defineProps<{
  modelValue: DateRange
}>()

const emit = defineEmits<{
  'update:modelValue': [value: DateRange]
}>()

const presets = computed(() => [
  { label: t('filters.presets.today'), value: 'today' },
  { label: t('filters.presets.thisWeek'), value: 'this-week' },
  { label: t('filters.presets.thisMonth'), value: 'this-month' },
  { label: t('filters.presets.lastMonth'), value: 'last-month' },
  { label: t('filters.presets.thisYear'), value: 'this-year' },
])

const getPresetRange = (preset: string): DateRange => {
  const now = new Date()
  let start: Date
  let end: Date

  switch (preset) {
    case 'today':
      start = startOfDay(now)
      end = endOfDay(now)
      break
    case 'this-week':
      start = startOfWeek(now, { weekStartsOn: 1 }) // Lunes
      end = endOfWeek(now, { weekStartsOn: 1 })
      break
    case 'this-month':
      start = startOfMonth(now)
      end = endOfMonth(now)
      break
    case 'last-month':
      const lastMonth = subMonths(now, 1)
      start = startOfMonth(lastMonth)
      end = endOfMonth(lastMonth)
      break
    case 'this-year':
      start = startOfYear(now)
      end = endOfYear(now)
      break
    default:
      return { from: '', until: '' }
  }

  return {
    from: format(start, 'yyyy-MM-dd'),
    until: format(end, 'yyyy-MM-dd'),
  }
}

const selectPreset = (presetValue: string) => {
  const range = getPresetRange(presetValue)
  emit('update:modelValue', range)
}

const isPresetActive = (presetValue: string): boolean => {
  if (!props.modelValue.from || !props.modelValue.until) return false

  const range = getPresetRange(presetValue)
  return range.from === props.modelValue.from && range.until === props.modelValue.until
}
</script>

<template>
  <div>
    <label class="block text-sm font-medium text-gray-700 mb-2">
      {{ t('filters.quickRanges') }}
    </label>
    <div class="flex flex-wrap gap-2">
      <button
        v-for="preset in presets"
        :key="preset.value"
        type="button"
        :class="[
          'px-3 py-1.5 text-xs font-medium rounded-md border transition-colors',
          isPresetActive(preset.value)
            ? 'bg-primary-50 border-primary-500 text-primary-700 hover:bg-primary-100'
            : 'bg-white border-gray-300 text-gray-700 hover:bg-gray-50',
        ]"
        @click="selectPreset(preset.value)"
      >
        {{ preset.label }}
      </button>
    </div>
  </div>
</template>
