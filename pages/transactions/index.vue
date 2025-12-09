<script setup lang="ts">
import { PlusIcon, ArrowsRightLeftIcon, CurrencyDollarIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account, Category } from '~/types'

definePageMeta({
  middleware: 'auth',
})

// Fetch transactions
const { data, pending, refresh } = await useApi<{
  data: Transaction[]
  accounts: Account[]
  categories: Category[]
  referenceCurrency: string
  workspaceUsersCount: number
}>('/transactions')

const transactions = computed(() => data.value?.data || [])
const accounts = computed(() => data.value?.accounts || [])
const categories = computed(() => data.value?.categories || [])
const referenceCurrency = computed(() => data.value?.referenceCurrency || 'USD')
const showCreatedBy = computed(() => (data.value?.workspaceUsersCount || 1) > 1)

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
        <IconButton
          to="/transactions/create"
          :icon="PlusIcon"
          label="Nueva"
          variant="primary"
        />
        <IconButton
          to="/transactions/transfer/create"
          :icon="ArrowsRightLeftIcon"
          label="Transferencia"
          variant="secondary"
        />
        <IconButton
          to="/transactions/exchange/create"
          :icon="CurrencyDollarIcon"
          label="Cambio"
          variant="secondary"
        />
      </div>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <LoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <Card v-else-if="transactions.length === 0" title="Sin transacciones">
      <p class="text-gray-600">
        No hay transacciones registradas. ¡Crea tu primera transacción!
      </p>
      <div class="mt-4">
        <FormButton to="/transactions/create" variant="primary">
          Nueva Transacción
        </FormButton>
      </div>
    </Card>

    <!-- Transactions table -->
    <Card v-else>
      <TransactionsTable
        :transactions="transactions"
        :reference-currency="referenceCurrency"
        :show-created-by="showCreatedBy"
        :show-reference-amount="false"
        @delete="handleDelete"
      />
    </Card>
  </div>
</template>
