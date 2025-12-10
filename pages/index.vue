<script setup lang="ts">
import {
  BanknotesIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'

// No middleware needed - global auth middleware handles protection

const { t } = useI18n()
const auth = useAuthStore()

// Fetch dashboard data
const { data: dashboardData, pending } = await useApi<{
  criticalBudgets: any[]
}>('/dashboard')

const criticalBudgets = computed(() => dashboardData.value?.criticalBudgets || [])

const quickActions = computed(() => [
  {
    name: t('dashboard.newAccount'),
    description: t('dashboard.newAccountDescription'),
    to: '/accounts/create',
    icon: BanknotesIcon,
  },
  {
    name: t('dashboard.newTransaction'),
    description: t('dashboard.newTransactionDescription'),
    to: '/transactions/create',
    icon: PlusIcon,
  },
  {
    name: t('dashboard.transfer'),
    description: t('dashboard.transferDescription'),
    to: '/transactions/transfer/create',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: t('dashboard.currencyExchange'),
    description: t('dashboard.currencyExchangeDescription'),
    to: '/transactions/exchange/create',
    icon: CurrencyDollarIcon,
  },
])
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        {{ t('dashboard.title') }}
      </h2>
    </div>

    <!-- Quick Actions -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <NuxtLink
        v-for="action in quickActions"
        :key="action.name"
        :to="action.to"
        class="relative block p-6 bg-white border border-gray-200 rounded-lg shadow hover:bg-gray-50 transition-colors group"
      >
        <div class="flex items-center gap-3 mb-2">
          <component :is="action.icon" class="h-6 w-6 text-primary-600" />
          <h3 class="text-lg font-semibold text-gray-900">
            {{ action.name }}
          </h3>
        </div>
        <p class="text-sm text-gray-600">
          {{ action.description }}
        </p>
      </NuxtLink>
    </div>

    <!-- Critical Budgets Widget (TODO: Implement budgets feature) -->
    <CommonCard v-if="criticalBudgets.length > 0" :title="t('dashboard.criticalBudgets')">
      <template #header>
        <div class="flex items-center justify-between px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold">
            {{ t('dashboard.criticalBudgets') }}
          </h3>
        </div>
      </template>

      <div class="space-y-4">
        <div
          v-for="budget in criticalBudgets"
          :key="budget.id"
          class="border-l-4 pl-3"
          :class="budget.is_exceeded ? 'border-danger-500' : 'border-yellow-500'"
        >
          <div class="flex items-center justify-between mb-1">
            <span class="text-sm font-medium text-gray-900">
              {{ budget.name }}
            </span>
            <span
              class="text-xs font-semibold"
              :class="budget.is_exceeded ? 'text-danger-600' : 'text-yellow-600'"
            >
              {{ budget.percentage_used.toFixed(0) }}%
            </span>
          </div>
          <div class="text-xs text-gray-500 mb-2">
            {{ budget.category?.name }} - {{ budget.period_label }}
          </div>
          <div class="w-full bg-gray-200 rounded-full h-2">
            <div
              class="h-2 rounded-full"
              :class="budget.is_exceeded ? 'bg-danger-500' : 'bg-yellow-500'"
              :style="{ width: `${Math.min(budget.percentage_used, 100)}%` }"
            />
          </div>
        </div>
      </div>
    </CommonCard>

    <!-- Welcome Card -->
    <CommonCard :title="t('dashboard.welcome')">
      <p class="text-gray-600">
        {{ t('dashboard.welcomeDescription') }}
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <FormsFormButton to="/accounts" variant="primary">
          {{ t('dashboard.viewAccounts') }}
        </FormsFormButton>
        <FormsFormButton to="/transactions" variant="secondary">
          {{ t('dashboard.viewTransactions') }}
        </FormsFormButton>
      </div>
    </CommonCard>
  </div>
</template>
