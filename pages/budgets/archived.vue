<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'
import type { Budget } from '~/types'

const { t } = useI18n()

// Fetch archived budgets
const { data, pending, refresh } = await useApi<{
  budgets: Budget[]
}>('/budgets/archived')

const budgets = computed(() => data.value?.budgets || [])

const handleDelete = () => {
  refresh()
}

const handleUnarchive = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ t('budgets.archivedBudgets') }}
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          {{ t('budgets.archivedDescription') }}
        </p>
      </div>
      <FormsIconButton
        to="/budgets"
        :icon="ArrowLeftIcon"
        :label="t('common.back')"
        variant="secondary"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <CommonCard v-else-if="budgets.length === 0" :title="t('budgets.noArchivedBudgets')">
      <p class="text-gray-600">
        {{ t('budgets.archivedWillAppearHere') }}
      </p>
      <div class="mt-4">
        <FormsFormButton to="/budgets" variant="primary">
          {{ t('budgets.viewActiveBudgets') }}
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Archived Budgets List -->
    <CommonCard v-else>
      <TablesBudgetsTable
        :budgets="budgets"
        :show-archived="true"
        @delete="handleDelete"
        @unarchive="handleUnarchive"
      />
    </CommonCard>
  </div>
</template>
