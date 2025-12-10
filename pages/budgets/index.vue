<script setup lang="ts">
import { PlusIcon, ArchiveBoxIcon, ChartBarIcon } from '@heroicons/vue/24/outline'
import type { Budget } from '~/types'

const { t } = useI18n()

// Fetch budgets
const { data, pending, refresh } = await useApi<{
  budgets: Budget[]
  currency: string
}>('/budgets')

const budgets = computed(() => data.value?.budgets || [])

const handleDelete = () => {
  refresh()
}

const handleArchive = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('budgets.title') }}
      </h2>
      <div class="flex flex-wrap gap-2">
        <FormsIconButton
          to="/budgets/archived"
          :icon="ArchiveBoxIcon"
          :label="t('budgets.archived')"
          variant="secondary"
        />
        <FormsIconButton
          to="/budgets/reports"
          :icon="ChartBarIcon"
          :label="t('budgets.reports')"
          variant="secondary"
        />
        <FormsIconButton
          to="/budgets/create"
          :icon="PlusIcon"
          :label="t('budgets.new')"
          variant="primary"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty State -->
    <CommonCard v-else-if="budgets.length === 0" :title="t('budgets.empty')">
      <p class="text-gray-600">
        {{ t('budgets.emptyDescription') }}
      </p>
      <div class="mt-4">
        <FormsFormButton to="/budgets/create" variant="primary">
          {{ t('budgets.createFirst') }}
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Budgets List -->
    <CommonCard v-else>
      <TablesBudgetsTable
        :budgets="budgets"
        @delete="handleDelete"
        @archive="handleArchive"
      />
    </CommonCard>
  </div>
</template>
