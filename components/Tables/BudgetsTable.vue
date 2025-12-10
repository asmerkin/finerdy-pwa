<script setup lang="ts">
import { PencilIcon, TrashIcon, ArchiveBoxIcon, ArchiveBoxArrowDownIcon } from '@heroicons/vue/24/outline'
import type { Budget } from '~/types'

const { t } = useI18n()

const props = defineProps<{
  budgets: Budget[]
  showArchived?: boolean
}>()

const emit = defineEmits<{
  delete: []
  archive: []
  unarchive: []
}>()

const { formatMoney } = useMoney()
const { del, post } = useApiMutation()

const showConfirmDialog = ref(false)
const confirmAction = ref<'delete' | 'archive' | 'unarchive'>('delete')
const selectedBudget = ref<Budget | null>(null)
const isProcessing = ref(false)

const confirmTitle = computed(() => {
  if (!selectedBudget.value) return ''
  switch (confirmAction.value) {
    case 'delete':
      return t('budgets.deleteConfirmTitle')
    case 'archive':
      return t('budgets.archiveConfirmTitle')
    case 'unarchive':
      return t('budgets.unarchiveConfirmTitle')
  }
})

const confirmMessage = computed(() => {
  if (!selectedBudget.value) return ''
  switch (confirmAction.value) {
    case 'delete':
      return t('budgets.deleteConfirm', { name: selectedBudget.value.name })
    case 'archive':
      return t('budgets.archiveConfirm', { name: selectedBudget.value.name })
    case 'unarchive':
      return t('budgets.unarchiveConfirm', { name: selectedBudget.value.name })
  }
})

const openConfirmDialog = (budget: Budget, action: 'delete' | 'archive' | 'unarchive') => {
  selectedBudget.value = budget
  confirmAction.value = action
  showConfirmDialog.value = true
}

const handleConfirm = async () => {
  if (!selectedBudget.value) return

  isProcessing.value = true
  try {
    switch (confirmAction.value) {
      case 'delete':
        await del(`/budgets/${selectedBudget.value.id}`)
        emit('delete')
        break
      case 'archive':
        await post(`/budgets/${selectedBudget.value.id}/archive`)
        emit('archive')
        break
      case 'unarchive':
        await post(`/budgets/${selectedBudget.value.id}/unarchive`)
        emit('unarchive')
        break
    }
  }
  catch (error) {
    console.error('Action failed:', error)
  }
  finally {
    isProcessing.value = false
    showConfirmDialog.value = false
    selectedBudget.value = null
  }
}
</script>

<template>
  <!-- Mobile Cards -->
  <div class="lg:hidden space-y-4">
    <div
      v-for="budget in budgets"
      :key="budget.id"
      class="bg-white border border-gray-200 rounded-lg p-4"
    >
      <div class="flex justify-between items-start mb-3">
        <div class="flex-1">
          <h3 class="font-semibold text-gray-900">{{ budget.name }}</h3>
          <p class="text-sm text-gray-600">{{ budget.category?.name }}</p>
          <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800 mt-1">
            {{ budget.period_label }}
          </span>
        </div>
        <span
          class="font-mono text-lg ml-2"
          :class="budget.is_exceeded ? 'text-danger-600' : 'text-gray-900'"
        >
          {{ formatMoney(budget.amount, budget.currency) }}
        </span>
      </div>

      <!-- Progress Bar -->
      <div v-if="!showArchived" class="mb-3">
        <div class="flex justify-between text-xs mb-1 text-gray-600">
          <span>{{ t('budgets.spent') }}: {{ formatMoney(budget.current_spending, budget.currency) }}</span>
          <span>{{ t('budgets.remaining') }}: {{ formatMoney(budget.remaining, budget.currency) }}</span>
        </div>
        <BudgetsBudgetProgressBar :percentage="budget.percentage_used" :show-label="false" />
      </div>

      <!-- Archived info -->
      <div v-else class="mb-3">
        <p class="text-xs text-gray-500">{{ t('common.archived') }}: {{ budget.archived_at }}</p>
      </div>

      <!-- Actions -->
      <div class="flex gap-2 pt-3 border-t border-gray-200">
        <FormsIconButton
          v-if="!showArchived"
          :to="`/budgets/${budget.id}/edit`"
          :icon="PencilIcon"
          :label="t('common.edit')"
          variant="ghost"
          size="sm"
        />
        <FormsIconButton
          v-if="showArchived"
          :icon="ArchiveBoxArrowDownIcon"
          :label="t('budgets.unarchive')"
          variant="secondary"
          size="sm"
          @click="openConfirmDialog(budget, 'unarchive')"
        />
        <FormsIconButton
          v-if="!showArchived"
          :icon="ArchiveBoxIcon"
          :label="t('budgets.archive')"
          variant="secondary"
          size="sm"
          @click="openConfirmDialog(budget, 'archive')"
        />
        <FormsIconButton
          :icon="TrashIcon"
          :label="t('common.delete')"
          variant="danger"
          size="sm"
          @click="openConfirmDialog(budget, 'delete')"
        />
      </div>
    </div>
  </div>

  <!-- Desktop Table -->
  <div class="hidden lg:block overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead>
        <tr class="bg-gray-50">
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.name') }}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('budgets.category') }}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.amount') }}</th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('budgets.period') }}</th>
          <th v-if="!showArchived" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('budgets.spent') }}</th>
          <th v-if="!showArchived" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('budgets.remaining') }}</th>
          <th v-if="!showArchived" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('budgets.progress') }}</th>
          <th v-if="showArchived" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.archived') }}</th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">{{ t('common.actions') }}</th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="budget in budgets"
          :key="budget.id"
          class="hover:bg-gray-50"
        >
          <td class="px-6 py-4 whitespace-nowrap font-semibold text-sm text-gray-900">{{ budget.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{{ budget.category?.name }}</td>
          <td class="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">{{ formatMoney(budget.amount, budget.currency) }}</td>
          <td class="px-6 py-4 whitespace-nowrap">
            <span class="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
              {{ budget.period_label }}
            </span>
          </td>
          <td v-if="!showArchived" class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono text-gray-500">
            {{ formatMoney(budget.current_spending, budget.currency) }}
          </td>
          <td
            v-if="!showArchived"
            class="px-6 py-4 whitespace-nowrap text-right text-sm font-mono"
            :class="budget.is_exceeded ? 'text-danger-600' : 'text-success-600'"
          >
            {{ formatMoney(budget.remaining, budget.currency) }}
          </td>
          <td v-if="!showArchived" class="px-6 py-4 whitespace-nowrap">
            <div class="flex items-center gap-2">
              <div class="flex-1">
                <BudgetsBudgetProgressBar :percentage="budget.percentage_used" :show-label="false" size="sm" />
              </div>
              <span class="text-xs font-semibold w-12 text-right text-gray-500">
                {{ budget.percentage_used.toFixed(0) }}%
              </span>
            </div>
          </td>
          <td v-if="showArchived" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ budget.archived_at }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex gap-1 justify-end">
              <FormsIconButton
                v-if="!showArchived"
                :to="`/budgets/${budget.id}/edit`"
                :icon="PencilIcon"
                :label="t('common.edit')"
                variant="ghost"
                size="sm"
              />
              <FormsIconButton
                v-if="showArchived"
                :icon="ArchiveBoxArrowDownIcon"
                :label="t('budgets.unarchive')"
                variant="secondary"
                size="sm"
                @click="openConfirmDialog(budget, 'unarchive')"
              />
              <FormsIconButton
                v-if="!showArchived"
                :icon="ArchiveBoxIcon"
                :label="t('budgets.archive')"
                variant="secondary"
                size="sm"
                @click="openConfirmDialog(budget, 'archive')"
              />
              <FormsIconButton
                :icon="TrashIcon"
                :label="t('common.delete')"
                variant="danger"
                size="sm"
                @click="openConfirmDialog(budget, 'delete')"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>

  <!-- Confirm Dialog -->
  <CommonConfirmDialog
    :open="showConfirmDialog"
    :title="confirmTitle"
    :message="confirmMessage"
    :confirm-text="t('common.confirm')"
    :cancel-text="t('common.cancel')"
    @confirm="handleConfirm"
    @cancel="showConfirmDialog = false"
  />
</template>
