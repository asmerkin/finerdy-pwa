<script setup lang="ts">
interface CategoryBalance {
  id: number
  name: string
  transaction_type: 'income' | 'outcome'
  reference_balance: string
}

interface IncomeStatementData {
  categories: CategoryBalance[]
  exchange_difference: string
  from: string
  to: string
}

const route = useRoute()
const router = useRouter()
const { formatMoney, getDefaultCurrency } = useMoney()
const { formatDate } = useDate()

// Filter state
const fromDate = ref(route.query.from as string || '')
const toDate = ref(route.query.to as string || '')

// Fetch income statement data
const { data, pending, refresh } = await useApi<IncomeStatementData>('/reports/income-statement', {
  params: computed(() => ({
    from: fromDate.value || undefined,
    to: toDate.value || undefined,
  })),
})

const categories = computed(() => data.value?.categories || [])
const exchangeDifference = computed(() => data.value?.exchange_difference || '0.00')
const currentFrom = computed(() => data.value?.from || '')
const currentTo = computed(() => data.value?.to || '')

const incomeCategories = computed(() => {
  return categories.value.filter(cat => cat.transaction_type === 'income')
})

const outcomeCategories = computed(() => {
  return categories.value.filter(cat => cat.transaction_type === 'outcome')
})

const totalIncome = computed(() => {
  return incomeCategories.value.reduce((sum, cat) => {
    return sum + parseFloat(cat.reference_balance ?? '0')
  }, 0)
})

const totalOutcome = computed(() => {
  return outcomeCategories.value.reduce((sum, cat) => {
    return sum + parseFloat(cat.reference_balance ?? '0')
  }, 0)
})

const netResult = computed(() => {
  return totalIncome.value + totalOutcome.value
})

const netResultAdjusted = computed(() => {
  const base = netResult.value
  const exchange = parseFloat(exchangeDifference.value ?? '0')
  return base + exchange
})

const applyFilters = () => {
  router.push({
    query: {
      from: fromDate.value || undefined,
      to: toDate.value || undefined,
    },
  })
  refresh()
}

const clearFilters = () => {
  fromDate.value = ''
  toDate.value = ''
  applyFilters()
}

const currency = getDefaultCurrency()
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        Estado de Resultados
      </h2>
    </div>

    <!-- Filtros de fecha -->
    <CommonCard>
      <form class="flex flex-wrap gap-4 items-end" @submit.prevent="applyFilters">
        <div class="flex-1 min-w-[150px]">
          <label for="from" class="block text-sm font-medium text-gray-700 mb-1">
            Desde
          </label>
          <input
            id="from"
            v-model="fromDate"
            type="date"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
        </div>

        <div class="flex-1 min-w-[150px]">
          <label for="to" class="block text-sm font-medium text-gray-700 mb-1">
            Hasta
          </label>
          <input
            id="to"
            v-model="toDate"
            type="date"
            class="w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
          >
        </div>

        <div class="flex gap-2">
          <FormsFormButton type="submit" variant="primary">
            Aplicar
          </FormsFormButton>
          <FormsFormButton type="button" variant="secondary" @click="clearFilters">
            Limpiar
          </FormsFormButton>
        </div>
      </form>

      <div v-if="currentFrom && currentTo" class="mt-3 text-sm text-gray-600">
        <strong>Período:</strong> {{ formatDate(currentFrom) }} - {{ formatDate(currentTo) }}
      </div>
    </CommonCard>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <template v-else>
      <!-- Resumen visual -->
      <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div class="bg-green-50 p-4 rounded-lg border border-green-200">
          <div class="text-sm text-green-700 font-medium">
            Total Ingresos
          </div>
          <div class="text-2xl font-bold text-green-900 mt-1">
            {{ formatMoney(totalIncome) }}
          </div>
        </div>

        <div class="bg-red-50 p-4 rounded-lg border border-red-200">
          <div class="text-sm text-red-700 font-medium">
            Total Gastos
          </div>
          <div class="text-2xl font-bold text-red-900 mt-1">
            {{ formatMoney(Math.abs(totalOutcome)) }}
          </div>
        </div>

        <!-- Exchange Difference Card -->
        <div
          v-if="parseFloat(exchangeDifference) !== 0"
          :class="[
            'p-4 rounded-lg border',
            parseFloat(exchangeDifference) >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
          ]"
        >
          <div
            :class="[
              'text-sm font-medium',
              parseFloat(exchangeDifference) >= 0 ? 'text-green-700' : 'text-red-700',
            ]"
          >
            Dif. Cambio
          </div>
          <div
            :class="[
              'text-2xl font-bold mt-1',
              parseFloat(exchangeDifference) >= 0 ? 'text-green-900' : 'text-red-900',
            ]"
          >
            {{ formatMoney(Math.abs(parseFloat(exchangeDifference))) }}
          </div>
        </div>

        <div
          :class="[
            'p-4 rounded-lg border',
            netResultAdjusted >= 0 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200',
          ]"
        >
          <div
            :class="[
              'text-sm font-medium',
              netResultAdjusted >= 0 ? 'text-green-700' : 'text-red-700',
            ]"
          >
            Resultado Neto
          </div>
          <div
            :class="[
              'text-2xl font-bold mt-1',
              netResultAdjusted >= 0 ? 'text-green-900' : 'text-red-900',
            ]"
          >
            {{ formatMoney(netResultAdjusted) }}
          </div>
        </div>
      </div>

      <!-- Tabla detallada -->
      <CommonCard>
        <!-- Mobile Card View -->
        <div class="lg:hidden space-y-4">
          <!-- Ingresos Section -->
          <div class="bg-green-50 rounded-lg p-3">
            <h4 class="font-semibold text-green-800">
              Ingresos
            </h4>
          </div>
          <div
            v-for="category in incomeCategories"
            :key="category.id"
            class="flex justify-between items-center py-2 px-3 border-b border-gray-100"
          >
            <span class="text-sm text-gray-900">{{ category.name }}</span>
            <span class="text-sm font-medium text-green-700">{{ formatMoney(category.reference_balance) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-green-100 rounded">
            <span class="font-bold text-green-900">Total Ingresos</span>
            <span class="font-bold text-green-900">{{ formatMoney(totalIncome) }}</span>
          </div>

          <!-- Egresos Section -->
          <div class="bg-red-50 rounded-lg p-3 mt-4">
            <h4 class="font-semibold text-red-800">
              Gastos
            </h4>
          </div>
          <div
            v-for="category in outcomeCategories"
            :key="category.id"
            class="flex justify-between items-center py-2 px-3 border-b border-gray-100"
          >
            <span class="text-sm text-gray-900">{{ category.name }}</span>
            <span class="text-sm font-medium text-red-700">{{ formatMoney(Math.abs(parseFloat(category.reference_balance))) }}</span>
          </div>
          <div class="flex justify-between items-center py-2 px-3 bg-red-100 rounded">
            <span class="font-bold text-red-900">Total Gastos</span>
            <span class="font-bold text-red-900">{{ formatMoney(Math.abs(totalOutcome)) }}</span>
          </div>

          <!-- Exchange Gains/Losses -->
          <template v-if="parseFloat(exchangeDifference) !== 0">
            <div
              :class="[
                'rounded-lg p-3 mt-4',
                parseFloat(exchangeDifference) >= 0 ? 'bg-green-50' : 'bg-red-50',
              ]"
            >
              <h4
                :class="[
                  'font-semibold',
                  parseFloat(exchangeDifference) >= 0 ? 'text-green-800' : 'text-red-800',
                ]"
              >
                Diferencias de Cambio
              </h4>
            </div>
            <div class="flex justify-between items-center py-2 px-3 border-b border-gray-100">
              <span class="text-sm text-gray-900">Ganancias/Pérdidas por tipo de cambio</span>
              <span
                :class="[
                  'text-sm font-medium',
                  parseFloat(exchangeDifference) >= 0 ? 'text-green-700' : 'text-red-700',
                ]"
              >
                {{ formatMoney(Math.abs(parseFloat(exchangeDifference))) }}
              </span>
            </div>
          </template>

          <!-- Resultado Neto -->
          <div
            :class="[
              'flex justify-between items-center py-3 px-3 rounded mt-4',
              netResultAdjusted >= 0 ? 'bg-green-50' : 'bg-red-50',
            ]"
          >
            <span class="font-bold text-lg text-gray-900">Resultado Neto</span>
            <span
              :class="[
                'font-bold text-lg',
                netResultAdjusted >= 0 ? 'text-green-700' : 'text-red-700',
              ]"
            >
              {{ formatMoney(netResultAdjusted) }}
            </span>
          </div>
        </div>

        <!-- Desktop Table -->
        <div class="hidden lg:block overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-200">
            <thead class="bg-gray-50">
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Categoría
                </th>
                <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Monto
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <!-- Ingresos Section -->
              <tr class="bg-green-50">
                <td colspan="2" class="px-6 py-3 font-semibold text-green-800">
                  Ingresos
                </td>
              </tr>
              <tr v-for="category in incomeCategories" :key="category.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-12">
                  {{ category.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-green-700 text-right font-medium">
                  {{ formatMoney(category.reference_balance) }}
                </td>
              </tr>
              <tr class="bg-green-100">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-900">
                  Total Ingresos
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-green-900 text-right">
                  {{ formatMoney(totalIncome) }}
                </td>
              </tr>

              <!-- Egresos Section -->
              <tr class="bg-red-50">
                <td colspan="2" class="px-6 py-3 font-semibold text-red-800">
                  Gastos
                </td>
              </tr>
              <tr v-for="category in outcomeCategories" :key="category.id">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-12">
                  {{ category.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-red-700 text-right font-medium">
                  {{ formatMoney(Math.abs(parseFloat(category.reference_balance))) }}
                </td>
              </tr>
              <tr class="bg-red-100">
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-900">
                  Total Gastos
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-bold text-red-900 text-right">
                  {{ formatMoney(Math.abs(totalOutcome)) }}
                </td>
              </tr>

              <!-- Exchange Gains/Losses Section -->
              <template v-if="parseFloat(exchangeDifference) !== 0">
                <tr :class="parseFloat(exchangeDifference) >= 0 ? 'bg-green-50' : 'bg-red-50'">
                  <td
                    colspan="2"
                    :class="[
                      'px-6 py-3 font-semibold',
                      parseFloat(exchangeDifference) >= 0 ? 'text-green-800' : 'text-red-800',
                    ]"
                  >
                    Diferencias de Cambio
                  </td>
                </tr>
                <tr>
                  <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 pl-12">
                    Ganancias/Pérdidas por tipo de cambio
                  </td>
                  <td
                    :class="[
                      'px-6 py-4 whitespace-nowrap text-sm text-right font-medium',
                      parseFloat(exchangeDifference) >= 0 ? 'text-green-700' : 'text-red-700',
                    ]"
                  >
                    {{ formatMoney(Math.abs(parseFloat(exchangeDifference))) }}
                  </td>
                </tr>
              </template>

              <!-- Resultado Neto -->
              <tr :class="netResultAdjusted >= 0 ? 'bg-green-50' : 'bg-red-50'">
                <td class="px-6 py-4 whitespace-nowrap text-lg font-bold text-gray-900">
                  Resultado Neto
                </td>
                <td
                  :class="[
                    'px-6 py-4 whitespace-nowrap text-lg font-bold text-right',
                    netResultAdjusted >= 0 ? 'text-green-700' : 'text-red-700',
                  ]"
                >
                  {{ formatMoney(netResultAdjusted) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </CommonCard>
    </template>
  </div>
</template>
