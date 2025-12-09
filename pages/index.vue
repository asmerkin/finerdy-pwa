<script setup lang="ts">
import {
  BanknotesIcon,
  PlusIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
} from '@heroicons/vue/24/outline'

definePageMeta({
  middleware: 'auth',
})

const auth = useAuthStore()

// Fetch dashboard data
const { data: dashboardData, pending } = await useApi<{
  criticalBudgets: any[]
}>('/dashboard')

const criticalBudgets = computed(() => dashboardData.value?.criticalBudgets || [])

const quickActions = [
  {
    name: 'Nueva Cuenta',
    description: 'Agrega una nueva cuenta bancaria o de efectivo',
    to: '/accounts/create',
    icon: BanknotesIcon,
  },
  {
    name: 'Nueva Transacción',
    description: 'Registra un ingreso o gasto',
    to: '/transactions/create',
    icon: PlusIcon,
  },
  {
    name: 'Transferencia',
    description: 'Mueve dinero entre cuentas',
    to: '/transactions/transfer/create',
    icon: ArrowsRightLeftIcon,
  },
  {
    name: 'Cambio de Moneda',
    description: 'Convierte entre diferentes monedas',
    to: '/transactions/exchange/create',
    icon: CurrencyDollarIcon,
  },
]
</script>

<template>
  <div class="space-y-6">
    <div>
      <h2 class="text-2xl font-bold leading-7 text-gray-900 sm:text-3xl sm:truncate">
        Dashboard
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

    <!-- Critical Budgets Widget -->
    <Card v-if="criticalBudgets.length > 0" title="Presupuestos Críticos">
      <template #header>
        <div class="flex items-center justify-between px-4 py-5 sm:px-6 border-b border-gray-200">
          <h3 class="text-lg font-semibold">
            Presupuestos Críticos
          </h3>
          <NuxtLink to="/budgets" class="text-sm text-primary-600 hover:text-primary-700">
            Ver todos
          </NuxtLink>
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
            {{ budget.category?.name }} • {{ budget.period_label }}
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
    </Card>

    <!-- Welcome Card -->
    <Card title="Bienvenido a Finerdy">
      <p class="text-gray-600">
        Gestiona tus finanzas personales de manera simple y efectiva.
        Registra tus ingresos, gastos, y mantén el control de tu dinero.
      </p>
      <div class="mt-4 flex flex-wrap gap-3">
        <FormButton to="/accounts" variant="primary">
          Ver Cuentas
        </FormButton>
        <FormButton to="/transactions" variant="secondary">
          Ver Transacciones
        </FormButton>
      </div>
    </Card>
  </div>
</template>
