<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Account } from '~/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { put } = useApiMutation()
const toast = useToast()

const accountId = route.params.id

// Fetch account data
const { data, pending } = await useApi<{ account: Account }>(`/accounts/${accountId}`)

const account = computed(() => (data.value as any)?.account as Account | undefined)

const form = reactive({
  name: '',
  currency: '',
})

// Check if account has transactions
const hasTransactions = computed(() => {
  return !!(account.value?.transactions_count && account.value.transactions_count > 0)
})

// Initialize form when data loads
watch(account, (newAccount) => {
  if (newAccount) {
    form.name = newAccount.name
    form.currency = newAccount.currency
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// Currency options (these are currency codes, no need to translate)
const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
]

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    // Only send currency if the account has no transactions
    const payload = hasTransactions.value
      ? { name: form.name }
      : { name: form.name, currency: form.currency }

    await put(`/accounts/${accountId}`, payload)
    toast.success(t('accounts.updated'))
    router.push('/accounts')
  }
  catch (error: any) {
    errors.value = error.data?.errors || {}
    toast.error(t('common.errorOccurred'))
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/accounts"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('accounts.editAccount') }}
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsInput
          v-model="form.name"
          :label="t('accounts.name')"
          :error="errors.name?.[0]"
          :placeholder="t('accounts.namePlaceholder')"
          required
        />

        <div>
          <FormsSelect
            v-model="form.currency"
            :label="t('accounts.currency')"
            :error="errors.currency?.[0]"
            :options="currencies"
            :placeholder="t('accounts.currencyPlaceholder')"
            :disabled="hasTransactions"
            required
          />
          <p v-if="hasTransactions" class="mt-1 text-sm text-gray-500">
            {{ t('accounts.currencyCannotChange') }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/accounts"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </NuxtLink>
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('accounts.saveChanges') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
