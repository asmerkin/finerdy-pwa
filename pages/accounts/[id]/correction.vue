<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Account } from '~/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { post, postForm } = useApiMutation()
const toast = useToast()
const { formatMoney } = useMoney()

const accountId = route.params.id

// Fetch account data
const { data, pending } = await useApi<{ account: Account }>(`/accounts/${accountId}`)

const account = computed(() => (data.value as any)?.account as Account | undefined)

const form = reactive({
  correction_mode: 'adjustment' as 'adjustment' | 'overwrite',
  amount: '',
  description: '',
  happened_at: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// File handling
const attachments = ref<File[]>([])

// Current balance as number
const currentBalance = computed(() => {
  return parseFloat(account.value?.balance || '0')
})

// Calculate the adjustment to apply based on mode
const adjustmentToApply = computed(() => {
  if (!form.amount) return 0

  const inputAmount = parseFloat(form.amount)
  if (isNaN(inputAmount)) return 0

  if (form.correction_mode === 'adjustment') {
    // In adjustment mode, the amount is the adjustment itself
    return inputAmount
  }
  else {
    // In overwrite mode, calculate the difference
    return inputAmount - currentBalance.value
  }
})

// The actual amount to send to the API (always the adjustment)
const amountToSubmit = computed(() => {
  return adjustmentToApply.value
})

const correctionModeOptions = computed(() => [
  { value: 'adjustment', label: t('transactions.correctionModes.adjustment') },
  { value: 'overwrite', label: t('transactions.correctionModes.overwrite') },
])

// Reset amount when mode changes
watch(() => form.correction_mode, () => {
  form.amount = ''
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    const transactionData = {
      type: 'correction',
      account_id: Number(accountId),
      amount: amountToSubmit.value,
      description: form.description || null,
      happened_at: form.happened_at,
    }

    // If there are attachments, use FormData
    if (attachments.value.length > 0) {
      const formData = new FormData()
      formData.append('type', 'correction')
      formData.append('account_id', String(accountId))
      formData.append('amount', String(amountToSubmit.value))
      formData.append('description', form.description || '')
      formData.append('happened_at', form.happened_at)

      // Add attachments
      attachments.value.forEach((file) => {
        formData.append('attachments[]', file)
      })

      await postForm('/transactions', formData)
    }
    else {
      await post('/transactions', transactionData)
    }

    toast.success(t('transactions.created'))
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
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/accounts"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('accounts.correction') }}
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else-if="account">
      <!-- Account Info -->
      <div class="mb-6 p-4 bg-gray-50 rounded-lg">
        <div class="flex justify-between items-center">
          <div>
            <p class="text-sm text-gray-500">{{ t('transactions.account') }}</p>
            <p class="font-semibold text-gray-900">{{ account.name }}</p>
          </div>
          <div class="text-right">
            <p class="text-sm text-gray-500">{{ t('transactions.currentBalance') }}</p>
            <p class="font-semibold text-gray-900">{{ formatMoney(account.balance, account.currency) }}</p>
          </div>
        </div>
      </div>

      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Correction Mode -->
        <FormsButtonGroup
          v-model="form.correction_mode"
          :label="t('transactions.correctionMode')"
          :options="correctionModeOptions"
        />

        <!-- Amount Input -->
        <div>
          <FormsMoneyInput
            v-model="form.amount"
            :label="form.correction_mode === 'overwrite' ? t('transactions.finalBalance') : t('common.amount')"
            :currency="account.currency"
            :error="errors.amount?.[0]"
            :allow-negative="form.correction_mode === 'adjustment'"
          />

          <!-- Preview of adjustment (for overwrite mode) -->
          <div v-if="form.correction_mode === 'overwrite' && form.amount" class="mt-2 p-3 bg-blue-50 rounded-lg">
            <p class="text-sm text-blue-800">
              <span class="font-medium">{{ t('transactions.adjustmentToApply') }}</span>
              <span :class="adjustmentToApply >= 0 ? 'text-green-600' : 'text-red-600'" class="font-semibold ml-1">
                {{ adjustmentToApply >= 0 ? '+' : '' }}{{ formatMoney(adjustmentToApply, account.currency) }}
              </span>
            </p>
          </div>
        </div>

        <FormsTextarea
          v-model="form.description"
          :label="t('common.description')"
          :error="errors.description?.[0]"
          :placeholder="t('common.description')"
        />

        <FormsDatePicker
          v-model="form.happened_at"
          :label="t('transactions.dateTime')"
          :error="errors.happened_at?.[0]"
        />

        <FormsMultipleFileInput
          v-model="attachments"
          :label="t('transactions.attachments')"
          :error="errors.attachments?.[0]"
          :errors="errors"
        />

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
            :disabled="isSubmitting || !form.amount || !form.happened_at"
          >
            {{ t('accounts.createCorrection') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
