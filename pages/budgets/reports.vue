<script setup lang="ts">
import { ArrowLeftIcon } from '@heroicons/vue/24/outline'

interface BudgetReportItem {
  budget_id: number
  budget_name: string
  category_name: string
  budgeted: number
  spent: number
  difference: number
  percentage: number
}

interface BudgetSummary {
  total_budgeted: number
  total_spent: number
  difference: number
}

const { t } = useI18n()
const { formatMoney } = useMoney()

// Fetch budget reports
const { data, pending } = await useApi<{
  report: BudgetReportItem[]
  summary: BudgetSummary
}>('/budgets/reports')

const report = computed(() => data.value?.report || [])
const summary = computed(() => data.value?.summary || { total_budgeted: 0, total_spent: 0, difference: 0 })
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ t('budgets.budgetAnalysis') }}
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          {{ t('budgets.budgetAnalysisDescription') }}
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

    <template v-else>
      <!-- Summary Cards -->
      <div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <CommonCard>
          <div class="text-sm text-gray-600 mb-1">{{ t('budgets.totalBudgeted') }}</div>
          <div class="text-2xl font-bold text-gray-900 font-mono">
            {{ formatMoney(summary.total_budgeted) }}
          </div>
        </CommonCard>

        <CommonCard>
          <div class="text-sm text-gray-600 mb-1">{{ t('budgets.totalSpent') }}</div>
          <div
            class="text-2xl font-bold font-mono"
            :class="summary.total_spent > summary.total_budgeted ? 'text-danger-600' : 'text-gray-900'"
          >
            {{ formatMoney(summary.total_spent) }}
          </div>
        </CommonCard>

        <CommonCard>
          <div class="text-sm text-gray-600 mb-1">{{ t('budgets.difference') }}</div>
          <div
            class="text-2xl font-bold font-mono"
            :class="summary.difference >= 0 ? 'text-success-600' : 'text-danger-600'"
          >
            {{ formatMoney(Math.abs(summary.difference)) }}
            <span class="text-sm font-normal">
              {{ summary.difference >= 0 ? t('budgets.saved') : t('budgets.exceeded') }}
            </span>
          </div>
        </CommonCard>
      </div>

      <!-- Empty State -->
      <CommonCard v-if="report.length === 0" :title="t('budgets.noReportData')">
        <p class="text-gray-600">
          {{ t('budgets.noReportDataDescription') }}
        </p>
        <div class="mt-4">
          <FormsFormButton to="/budgets/create" variant="primary">
            {{ t('budgets.createFirst') }}
          </FormsFormButton>
        </div>
      </CommonCard>

      <!-- Detailed Table -->
      <CommonCard v-else>
        <!-- Mobile Cards -->
        <div class="lg:hidden space-y-4">
          <div
            v-for="item in report"
            :key="item.budget_id"
            class="border rounded-lg p-4"
          >
            <div class="flex justify-between items-start mb-3">
              <div>
                <h3 class="font-semibold text-gray-900">{{ item.budget_name }}</h3>
                <p class="text-sm text-gray-600">{{ item.category_name }}</p>
              </div>
            </div>

            <div class="space-y-2 text-sm mb-3">
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('budgets.budgeted') }}:</span>
                <span class="font-mono font-semibold">{{ formatMoney(item.budgeted) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('budgets.spent') }}:</span>
                <span class="font-mono font-semibold">{{ formatMoney(item.spent) }}</span>
              </div>
              <div class="flex justify-between">
                <span class="text-gray-600">{{ t('budgets.difference') }}:</span>
                <span
                  class="font-mono font-semibold"
                  :class="item.difference >= 0 ? 'text-success-600' : 'text-danger-600'"
                >
                  {{ item.difference >= 0 ? '+' : '' }}{{ formatMoney(item.difference) }}
                </span>
              </div>
            </div>

            <BudgetsBudgetProgressBar :percentage="item.percentage" />
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full">
            <thead>
              <tr class="border-b">
                <th class="text-left py-3 px-4">{{ t('budgets.category') }}</th>
                <th class="text-left py-3 px-4">{{ t('budgets.budget') }}</th>
                <th class="text-right py-3 px-4">{{ t('budgets.budgeted') }}</th>
                <th class="text-right py-3 px-4">{{ t('budgets.spent') }}</th>
                <th class="text-right py-3 px-4">{{ t('budgets.difference') }}</th>
                <th class="text-left py-3 px-4">{{ t('budgets.progress') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="item in report"
                :key="item.budget_id"
                class="border-b hover:bg-gray-50 transition-colors"
              >
                <td class="py-3 px-4">{{ item.category_name }}</td>
                <td class="py-3 px-4">{{ item.budget_name }}</td>
                <td class="py-3 px-4 text-right font-mono">{{ formatMoney(item.budgeted) }}</td>
                <td class="py-3 px-4 text-right font-mono">{{ formatMoney(item.spent) }}</td>
                <td
                  class="py-3 px-4 text-right font-mono"
                  :class="item.difference >= 0 ? 'text-success-600' : 'text-danger-600'"
                >
                  {{ item.difference >= 0 ? '+' : '' }}{{ formatMoney(item.difference) }}
                </td>
                <td class="py-3 px-4">
                  <BudgetsBudgetProgressBar :percentage="item.percentage" size="sm" />
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CommonCard>
    </template>
  </div>
</template>
