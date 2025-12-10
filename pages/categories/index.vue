<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Category } from '~/types'

const { t } = useI18n()

// Fetch categories
const { data, pending, refresh } = await useApi<{
  categories: Category[]
}>('/categories')

const categories = computed(() => data.value?.categories || [])

// Group categories by transaction type
const incomeCategories = computed(() => {
  return categories.value.filter(category => category.transaction_type === 'income')
})

const outcomeCategories = computed(() => {
  return categories.value.filter(category => category.transaction_type === 'outcome')
})

const handleDelete = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('categories.title') }}
      </h2>
      <FormsIconButton
        to="/categories/create"
        :icon="PlusIcon"
        :label="t('categories.new')"
        variant="primary"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <CommonCard v-else-if="categories.length === 0" :title="t('categories.empty')">
      <p class="text-gray-600">
        {{ t('categories.emptyDescription') }}
      </p>
      <div class="mt-4">
        <FormsFormButton to="/categories/create" variant="primary">
          {{ t('categories.createFirst') }}
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Categories grouped by transaction type -->
    <div v-else class="space-y-6">
      <!-- Income Categories -->
      <CommonCard :title="t('categories.incomeCategories')">
        <div v-if="incomeCategories.length === 0" class="text-gray-500 text-sm py-4">
          {{ t('categories.noIncomeCategories') }}
        </div>
        <TablesCategoriesTable
          v-else
          :categories="incomeCategories"
          @delete="handleDelete"
        />
      </CommonCard>

      <!-- Outcome/Expense Categories -->
      <CommonCard :title="t('categories.expenseCategories')">
        <div v-if="outcomeCategories.length === 0" class="text-gray-500 text-sm py-4">
          {{ t('categories.noExpenseCategories') }}
        </div>
        <TablesCategoriesTable
          v-else
          :categories="outcomeCategories"
          @delete="handleDelete"
        />
      </CommonCard>
    </div>
  </div>
</template>
