<script setup lang="ts">
import { FunnelIcon, ChevronDownIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

interface Account {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface Budget {
  id: number
  name: string
  category?: Category
}

interface Filters {
  accounts: number[]
  categories: number[]
  budgets: number[]
  from: string
  until: string
}

const props = defineProps<{
  modelValue: Filters
  accounts: Account[]
  categories: Category[]
  budgets: Budget[]
}>()

const emit = defineEmits<{
  'update:modelValue': [value: Filters]
  'apply': []
  'clear': []
}>()

const isExpanded = ref(false)

const hasActiveFilters = computed(() => {
  return (
    (props.modelValue.accounts && props.modelValue.accounts.length > 0)
    || (props.modelValue.categories && props.modelValue.categories.length > 0)
    || (props.modelValue.budgets && props.modelValue.budgets.length > 0)
    || props.modelValue.from
    || props.modelValue.until
  )
})

const activeFiltersCount = computed(() => {
  let count = 0
  if (props.modelValue.accounts?.length > 0) count += props.modelValue.accounts.length
  if (props.modelValue.categories?.length > 0) count += props.modelValue.categories.length
  if (props.modelValue.budgets?.length > 0) count += props.modelValue.budgets.length
  if (props.modelValue.from) count++
  if (props.modelValue.until) count++
  return count
})

const form = ref<Filters>({
  categories: props.modelValue.categories || [],
  accounts: props.modelValue.accounts || [],
  budgets: props.modelValue.budgets || [],
  from: props.modelValue.from || '',
  until: props.modelValue.until || '',
})

// Sincronizar form cuando los props cambian (al limpiar filtros)
watch(() => props.modelValue, (newFilters) => {
  form.value = {
    categories: newFilters.categories || [],
    accounts: newFilters.accounts || [],
    budgets: newFilters.budgets || [],
    from: newFilters.from || '',
    until: newFilters.until || '',
  }
}, { deep: true })

const dateRange = computed({
  get: () => ({ from: form.value.from, until: form.value.until }),
  set: (value: { from: string, until: string }) => {
    form.value.from = value.from
    form.value.until = value.until
  },
})

const applyFilters = () => {
  emit('update:modelValue', { ...form.value })
  emit('apply')
}

const clearFilters = () => {
  form.value = {
    categories: [],
    accounts: [],
    budgets: [],
    from: '',
    until: '',
  }
  emit('update:modelValue', { ...form.value })
  emit('clear')
}

// Create budget options with category name for clarity
const budgetOptions = computed(() => {
  return props.budgets.map(b => ({
    id: b.id,
    name: b.category ? `${b.name} (${b.category.name})` : b.name,
  }))
})
</script>

<template>
  <div class="bg-white rounded-lg shadow">
    <!-- Mobile Toggle Button -->
    <button
      class="lg:hidden w-full flex items-center justify-between p-4"
      @click="isExpanded = !isExpanded"
    >
      <div class="flex items-center gap-2">
        <FunnelIcon class="h-5 w-5 text-gray-500" />
        <span class="font-medium text-gray-700">{{ t('filters.filters') }}</span>
        <span
          v-if="hasActiveFilters"
          class="inline-flex items-center justify-center px-2 py-0.5 text-xs font-medium bg-primary-100 text-primary-700 rounded-full"
        >
          {{ activeFiltersCount }}
        </span>
      </div>
      <ChevronDownIcon
        class="h-5 w-5 text-gray-500 transition-transform duration-200"
        :class="{ 'rotate-180': isExpanded }"
      />
    </button>

    <!-- Filters Content - Always visible on desktop, collapsible on mobile -->
    <div
      class="transition-all duration-200 lg:block"
      :class="isExpanded ? 'block' : 'hidden lg:block'"
    >
      <div class="p-4 pt-0 lg:pt-4 space-y-4">
        <!-- Date Range Presets -->
        <FiltersDateRangePresets v-model="dateRange" />

        <!-- Filters Grid -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('filters.from') }}
            </label>
            <input
              v-model="form.from"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>

          <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">
              {{ t('filters.until') }}
            </label>
            <input
              v-model="form.until"
              type="date"
              class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
            >
          </div>

          <FiltersMultiSelectListbox
            v-model="form.accounts"
            :options="accounts"
            :label="t('filters.accounts')"
            :placeholder="t('filters.allAccounts')"
            :all-text="t('common.all')"
          />

          <FiltersMultiSelectListbox
            v-model="form.categories"
            :options="categories"
            :label="t('filters.categories')"
            :placeholder="t('filters.allCategories')"
            :all-text="t('common.all')"
          />

          <FiltersMultiSelectListbox
            v-model="form.budgets"
            :options="budgetOptions"
            :label="t('filters.budgets')"
            :placeholder="t('filters.allBudgets')"
            :all-text="t('common.all')"
          />
        </div>

        <div class="flex justify-end space-x-2">
          <button
            type="button"
            class="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            @click="clearFilters"
          >
            {{ t('filters.clear') }}
          </button>
          <button
            type="button"
            class="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary-600 hover:bg-primary-700"
            @click="applyFilters"
          >
            {{ t('common.apply') }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>
