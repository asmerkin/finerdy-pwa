<script setup lang="ts">
interface AccountBalance {
  id: number
  name: string
  currency: string
  balance: string
  balance_in_reference: string
}

interface BalanceSheetData {
  accounts: AccountBalance[]
  exchange_difference: string
  as_of_date: string
  reference_currency: string
}

const route = useRoute()
const router = useRouter()
const { formatMoney } = useMoney()
const { formatDate } = useDate()

// Filter state
const asOfDate = ref(route.query.as_of_date as string || '')

// Fetch balance sheet data
const { data, pending, refresh } = await useApi<BalanceSheetData>('/reports/balance-sheet', {
  params: computed(() => ({
    as_of_date: asOfDate.value || undefined,
  })),
})

const accounts = computed(() => data.value?.accounts || [])
const referenceCurrency = computed(() => data.value?.reference_currency || 'USD')
const currentAsOfDate = computed(() => data.value?.as_of_date || '')
const exchangeDifference = computed(() => data.value?.exchange_difference || '0.00')

// Group accounts by currency
const accountsByCurrency = computed(() => {
  return accounts.value.reduce((grouped: Record<string, AccountBalance[]>, account) => {
    if (!grouped[account.currency]) {
      grouped[account.currency] = []
    }
    grouped[account.currency].push(account)
    return grouped
  }, {})
})

const sortedCurrencies = computed(() => {
  return Object.keys(accountsByCurrency.value).sort()
})

const getCurrencySubtotal = (currency: string) => {
  return accountsByCurrency.value[currency].reduce((sum, account) => {
    return sum + parseFloat(account.balance ?? '0')
  }, 0)
}

const getCurrencySubtotalInReference = (currency: string) => {
  return accountsByCurrency.value[currency].reduce((sum, account) => {
    return sum + parseFloat(account.balance_in_reference ?? '0')
  }, 0)
}

const grandTotalInReference = computed(() => {
  return accounts.value.reduce((sum, account) => {
    return sum + parseFloat(account.balance_in_reference ?? '0')
  }, 0)
})

// Max date is today
const maxDate = computed(() => {
  return new Date().toISOString().split('T')[0]
})

const applyFilters = () => {
  router.push({
    query: {
      as_of_date: asOfDate.value || undefined,
    },
  })
  refresh()
}

const clearFilters = () => {
  asOfDate.value = ''
  applyFilters()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        Estado Patrimonial
      </h2>
    </div>

    <!-- Filtro de fecha -->
    <CommonCard>
      <form class="flex flex-wrap gap-4 items-end" @submit.prevent="applyFilters">
        <div class="flex-1 min-w-[200px]">
          <label for="as_of_date" class="block text-sm font-medium text-gray-700 mb-1">
            Balance al
          </label>
          <input
            id="as_of_date"
            v-model="asOfDate"
            type="date"
            :max="maxDate"
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

      <div v-if="currentAsOfDate" class="mt-3 text-sm text-gray-600">
        <strong>Fecha:</strong> {{ formatDate(currentAsOfDate) }}
      </div>
    </CommonCard>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Balance por Cuentas -->
    <CommonCard v-else>
      <h3 class="text-xl font-semibold text-gray-800 mb-4">
        Cuentas
      </h3>

      <!-- Mobile Card View -->
      <div class="lg:hidden space-y-4">
        <template v-for="currency in sortedCurrencies" :key="currency">
          <div
            v-for="account in accountsByCurrency[currency]"
            :key="account.id"
            class="bg-white border border-gray-200 rounded-lg p-4 space-y-2"
          >
            <div class="flex items-center justify-between">
              <span class="text-base font-semibold text-gray-900">{{ account.name }}</span>
              <span class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">{{ account.currency }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">Balance original:</span>
              <span class="font-medium">{{ formatMoney(account.balance, account.currency) }}</span>
            </div>
            <div class="flex justify-between text-sm">
              <span class="text-gray-500">En {{ referenceCurrency }}:</span>
              <span class="font-medium">{{ formatMoney(account.balance_in_reference, referenceCurrency) }}</span>
            </div>
          </div>

          <!-- Currency subtotal card -->
          <div class="bg-gray-100 border border-gray-200 rounded-lg p-4">
            <div class="flex justify-between items-center">
              <span class="font-semibold text-gray-700">Subtotal {{ currency }}</span>
              <div class="text-right">
                <div class="font-semibold">{{ formatMoney(getCurrencySubtotal(currency), currency) }}</div>
                <div class="text-sm text-gray-600">{{ formatMoney(getCurrencySubtotalInReference(currency), referenceCurrency) }}</div>
              </div>
            </div>
          </div>
        </template>

        <!-- Grand total card -->
        <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
          <div class="flex justify-between items-center">
            <span class="font-bold text-gray-900 text-lg">Total General</span>
            <span class="font-bold text-gray-900 text-lg">{{ formatMoney(grandTotalInReference, referenceCurrency) }}</span>
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cuenta
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Moneda
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Balance Original
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                En {{ referenceCurrency }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <template v-for="currency in sortedCurrencies" :key="currency">
              <tr v-for="account in accountsByCurrency[currency]" :key="account.id" class="hover:bg-gray-50">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ account.name }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {{ account.currency }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ formatMoney(account.balance, account.currency) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900 text-right">
                  {{ formatMoney(account.balance_in_reference, referenceCurrency) }}
                </td>
              </tr>
              <tr class="bg-gray-100">
                <td class="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700">
                  Subtotal {{ currency }}
                </td>
                <td class="px-6 py-3" />
                <td class="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                  {{ formatMoney(getCurrencySubtotal(currency), currency) }}
                </td>
                <td class="px-6 py-3 whitespace-nowrap text-sm font-semibold text-gray-700 text-right">
                  {{ formatMoney(getCurrencySubtotalInReference(currency), referenceCurrency) }}
                </td>
              </tr>
            </template>
          </tbody>
          <tfoot class="bg-primary-50">
            <tr>
              <td colspan="3" class="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900">
                Total General
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-base font-bold text-gray-900 text-right">
                {{ formatMoney(grandTotalInReference, referenceCurrency) }}
              </td>
            </tr>
          </tfoot>
        </table>
      </div>
    </CommonCard>
  </div>
</template>
