<script setup lang="ts">
import { XMarkIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()

interface Account {
  id: number
  name: string
}

interface Category {
  id: number
  name: string
}

interface Filters {
  accounts: number[]
  categories: number[]
  from: string
  until: string
}

const props = defineProps<{
  filters: Filters
  accounts: Account[]
  categories: Category[]
}>()

const emit = defineEmits<{
  remove: [filterKey: string, valueId?: number]
  clearAll: []
}>()

const { formatDate } = useDate()

const hasActiveFilters = computed(() => {
  return (
    (props.filters.accounts && props.filters.accounts.length > 0)
    || (props.filters.categories && props.filters.categories.length > 0)
    || props.filters.from
    || props.filters.until
  )
})

const getAccountName = (accountId: number): string => {
  const account = props.accounts.find(a => a.id == accountId)
  return account ? account.name : t('filters.unknown')
}

const getCategoryName = (categoryId: number): string => {
  const category = props.categories.find(c => c.id == categoryId)
  return category ? category.name : t('filters.unknown')
}

const removePill = (filterKey: string, valueId?: number) => {
  emit('remove', filterKey, valueId)
}

const clearAll = () => {
  emit('clearAll')
}
</script>

<template>
  <div v-if="hasActiveFilters" class="bg-white rounded-lg border border-gray-200 p-4">
    <div class="flex flex-wrap items-center gap-2">
      <span class="text-sm font-medium text-gray-600">{{ t('filters.activeFilters') }}</span>

      <!-- Account Pills -->
      <span
        v-for="accountId in filters.accounts"
        :key="`account-${accountId}`"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
      >
        {{ t('filters.account') }}: {{ getAccountName(accountId) }}
        <button
          type="button"
          class="hover:text-primary-600 transition-colors"
          @click="removePill('accounts', accountId)"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </span>

      <!-- Category Pills -->
      <span
        v-for="categoryId in filters.categories"
        :key="`category-${categoryId}`"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
      >
        {{ t('filters.category') }}: {{ getCategoryName(categoryId) }}
        <button
          type="button"
          class="hover:text-primary-600 transition-colors"
          @click="removePill('categories', categoryId)"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </span>

      <!-- Date From Pill -->
      <span
        v-if="filters.from"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
      >
        {{ t('filters.from') }}: {{ formatDate(filters.from) }}
        <button
          type="button"
          class="hover:text-primary-600 transition-colors"
          @click="removePill('from')"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </span>

      <!-- Date Until Pill -->
      <span
        v-if="filters.until"
        class="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200"
      >
        {{ t('filters.until') }}: {{ formatDate(filters.until) }}
        <button
          type="button"
          class="hover:text-primary-600 transition-colors"
          @click="removePill('until')"
        >
          <XMarkIcon class="h-3 w-3" />
        </button>
      </span>

      <!-- Clear All Button -->
      <button
        type="button"
        class="text-xs font-medium text-primary-600 hover:text-primary-700 underline ml-2"
        @click="clearAll"
      >
        {{ t('filters.clearAll') }}
      </button>
    </div>
  </div>
</template>
