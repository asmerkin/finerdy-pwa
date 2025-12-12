<script setup lang="ts">
import { PlusIcon, ArrowsRightLeftIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account, Category, Budget } from '~/types'

const route = useRoute()
const router = useRouter()
const auth = useAuthStore()

// Get workspace reference currency
const referenceCurrency = computed(() => auth.workspace?.default_currency || null)

// Filter state from URL query params
const filters = ref({
  accounts: (route.query.accounts as string[] | undefined)?.map(Number) || [],
  categories: (route.query.categories as string[] | undefined)?.map(Number) || [],
  budgets: (route.query.budgets as string[] | undefined)?.map(Number) || [],
  from: (route.query.from as string) || '',
  until: (route.query.until as string) || '',
})

// Build query params for API
const queryParams = computed(() => {
  const params: Record<string, any> = {}
  if (filters.value.accounts.length > 0) {
    params.accounts = filters.value.accounts
  }
  if (filters.value.categories.length > 0) {
    params.categories = filters.value.categories
  }
  if (filters.value.budgets.length > 0) {
    params.budgets = filters.value.budgets
  }
  if (filters.value.from) {
    params.from = filters.value.from
  }
  if (filters.value.until) {
    params.until = filters.value.until
  }
  return params
})

// Fetch all data in parallel
const [
  { data, pending, refresh },
  { data: accountsData },
  { data: categoriesData },
  { data: budgetsData },
] = await Promise.all([
  useApi<{ transactions: Transaction[] }>('/transactions', { query: queryParams }),
  useApi<{ accounts: Account[] }>('/accounts'),
  useApi<{ categories: Category[] }>('/categories'),
  useApi<{ budgets: Budget[] }>('/budgets'),
])

const transactions = computed(() => data.value?.transactions || [])
const accounts = computed(() => accountsData.value?.accounts || [])
const categories = computed(() => categoriesData.value?.categories || [])
const budgets = computed(() => budgetsData.value?.budgets || [])

const hasActiveFilters = computed(() => {
  return (
    filters.value.accounts.length > 0
    || filters.value.categories.length > 0
    || filters.value.budgets.length > 0
    || filters.value.from
    || filters.value.until
  )
})

const handleFiltersApply = () => {
  // Update URL with filters
  const query: Record<string, any> = {}
  if (filters.value.accounts.length > 0) {
    query.accounts = filters.value.accounts.map(String)
  }
  if (filters.value.categories.length > 0) {
    query.categories = filters.value.categories.map(String)
  }
  if (filters.value.budgets.length > 0) {
    query.budgets = filters.value.budgets.map(String)
  }
  if (filters.value.from) {
    query.from = filters.value.from
  }
  if (filters.value.until) {
    query.until = filters.value.until
  }

  router.push({ query })
  refresh()
}

const handleFiltersClear = () => {
  router.push({ query: {} })
  refresh()
}

const removeFilter = (filterKey: string, valueId?: number) => {
  if (valueId !== undefined) {
    // Remove specific value from array
    const key = filterKey as 'accounts' | 'categories' | 'budgets'
    filters.value[key] = filters.value[key].filter(id => id !== valueId)
  }
  else {
    // Remove date filter
    const key = filterKey as 'from' | 'until'
    filters.value[key] = ''
  }

  handleFiltersApply()
}

const clearAllFilters = () => {
  filters.value = {
    accounts: [],
    categories: [],
    budgets: [],
    from: '',
    until: '',
  }
  handleFiltersClear()
}

const handleDelete = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        Transacciones
      </h2>
      <div class="flex flex-wrap gap-2">
        <FormsIconButton
          to="/transactions/create"
          :icon="PlusIcon"
          label="Nueva"
          variant="primary"
        />
        <FormsIconButton
          to="/transactions/transfer/create"
          :icon="ArrowsRightLeftIcon"
          label="Transferencia"
          variant="secondary"
        />
        <FormsIconButton
          to="/transactions/exchange/create"
          :icon="CurrencyDollarIcon"
          label="Cambio"
          variant="secondary"
        />
      </div>
    </div>

    <!-- Filters -->
    <FiltersTransactionFilters
      v-model="filters"
      :accounts="accounts"
      :categories="categories"
      :budgets="budgets"
      @apply="handleFiltersApply"
      @clear="handleFiltersClear"
    />

    <!-- Active Filter Pills -->
    <FiltersFilterPills
      v-if="hasActiveFilters"
      :filters="filters"
      :accounts="accounts"
      :categories="categories"
      :budgets="budgets"
      @remove="removeFilter"
      @clear-all="clearAllFilters"
    />

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <CommonCard v-else-if="transactions.length === 0" title="Sin transacciones">
      <p class="text-gray-600">
        {{ hasActiveFilters ? 'No hay transacciones con los filtros seleccionados.' : 'No hay transacciones registradas. Crea tu primera transaccion!' }}
      </p>
      <div v-if="!hasActiveFilters" class="mt-4">
        <FormsFormButton to="/transactions/create" variant="primary">
          Nueva Transaccion
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Transactions table -->
    <CommonCard v-else>
      <TablesTransactionsTable
        :transactions="transactions"
        :reference-currency="referenceCurrency"
        @delete="handleDelete"
      />
    </CommonCard>
  </div>
</template>
