<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Account } from '~/types'

const { t } = useI18n()

// Fetch accounts
const { data, pending, refresh } = await useApi<{
  accounts: Account[]
}>('/accounts')

const accounts = computed(() => data.value?.accounts || [])

// Group accounts by currency
const accountsByCurrency = computed(() => {
  return accounts.value.reduce((acc: Record<string, Account[]>, account) => {
    if (!acc[account.currency]) {
      acc[account.currency] = []
    }
    acc[account.currency].push(account)
    return acc
  }, {})
})

// Calculate subtotal for a currency
const getSubtotal = (currencyAccounts: Account[]) => {
  return currencyAccounts.reduce((sum, acc) => sum + parseFloat(acc.balance || '0'), 0)
}

const handleDelete = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('accounts.title') }}
      </h2>
      <FormsIconButton
        to="/accounts/create"
        :icon="PlusIcon"
        :label="t('accounts.new')"
        variant="primary"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <CommonCard v-else-if="accounts.length === 0" :title="t('accounts.empty')">
      <p class="text-gray-600">
        {{ t('accounts.emptyDescription') }}
      </p>
      <div class="mt-4">
        <FormsFormButton to="/accounts/create" variant="primary">
          {{ t('accounts.createFirst') }}
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Accounts grouped by currency -->
    <div v-else class="space-y-6">
      <CommonCard
        v-for="(currencyAccounts, currency) in accountsByCurrency"
        :key="currency"
        :title="t('accounts.accountsIn', { currency })"
      >
        <TablesAccountsTable
          :accounts="currencyAccounts"
          :currency="String(currency)"
          :total="getSubtotal(currencyAccounts)"
          @delete="handleDelete"
        />
      </CommonCard>
    </div>
  </div>
</template>
