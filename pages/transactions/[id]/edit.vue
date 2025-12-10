<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account, Category, Budget } from '~/types'

interface Media {
  id: number
  file_name: string
  mime_type: string
  size: number
  original_url: string
}

interface TransactionWithMedia extends Transaction {
  media?: Media[]
}

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { putForm } = useApiMutation()
const toast = useToast()

const transactionId = route.params.id

// Fetch transaction with full details (including media)
const { data: rawTransactionData, pending } = await useApi<{ transaction: TransactionWithMedia }>(
  `/transactions/${transactionId}`,
)

// Unwrap the transaction from API response
const transactionData = computed(() => rawTransactionData.value?.transaction)
const { data: accountsData } = await useApi<{ accounts: Account[] }>('/accounts')
const { data: categoriesData } = await useApi<{ categories: Category[] }>('/categories')
const { data: budgetsData } = await useApi<{ budgets: Budget[] }>('/budgets')

const accounts = computed(() => accountsData.value?.accounts || [])
const categories = computed(() => categoriesData.value?.categories || [])
const budgets = computed(() => budgetsData.value?.budgets || [])

const form = reactive({
  type: 'outcome',
  account_id: '',
  category_id: '',
  budget_id: '',
  amount: '',
  description: '',
  happened_at: '',
  assignment_type: 'category' as 'category' | 'budget',
})

// File handling
const attachments = ref<File[]>([])
const removedAttachments = ref<number[]>([])

// Compute existing files from transaction media
const existingFiles = computed(() => {
  return transactionData.value?.media?.map(media => ({
    id: media.id,
    name: media.file_name,
    url: media.original_url,
    mime_type: media.mime_type,
  })) || []
})

const handleRemoveExisting = (mediaId: number) => {
  removedAttachments.value.push(mediaId)
}

// Flag to prevent watchers from clearing values during initialization
const isInitialized = ref(false)

// Initialize form when data loads
watch(transactionData, (newData) => {
  if (newData) {
    const t = newData
    form.type = t.type
    form.account_id = String(t.account_id)
    form.category_id = t.category_id ? String(t.category_id) : ''
    form.budget_id = t.budget_id ? String(t.budget_id) : ''
    // Show absolute value (expenses are stored as negative)
    form.amount = String(Math.abs(parseFloat(String(t.amount))))
    form.description = t.description || ''
    // Format datetime for input
    if (t.happened_at) {
      form.happened_at = t.happened_at
    }
    // Set assignment type based on whether budget is assigned
    form.assignment_type = t.budget_id ? 'budget' : 'category'

    // Mark as initialized after setting all values
    nextTick(() => {
      isInitialized.value = true
    })
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const accountOptions = computed(() =>
  accounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

// Filter categories based on transaction type
const filteredCategories = computed(() => {
  return categories.value.filter(cat => cat.transaction_type === form.type)
})

const categoryOptions = computed(() =>
  filteredCategories.value.map(c => ({ value: c.id, label: c.name })),
)

// Filter budgets (only for outcome transactions)
const filteredBudgets = computed(() => {
  if (form.type !== 'outcome') return []
  return budgets.value.filter(budget => budget.category?.transaction_type === 'outcome')
})

const budgetOptions = computed(() =>
  filteredBudgets.value.map(b => ({ value: b.id, label: `${b.name} (${b.category?.name})` })),
)

const selectedAccount = computed(() =>
  accounts.value.find(a => a.id === Number(form.account_id)),
)

// When budget is selected, auto-assign its category (only after initialization)
watch(() => form.budget_id, (budgetId) => {
  if (!isInitialized.value) return

  if (budgetId && form.assignment_type === 'budget') {
    const budget = budgets.value.find(b => b.id === Number(budgetId))
    if (budget) {
      form.category_id = String(budget.category_id)
    }
  }
})

// Clear budget_id when switching to category mode (only after initialization)
watch(() => form.assignment_type, (type) => {
  if (!isInitialized.value) return

  if (type === 'category') {
    form.budget_id = ''
  }
  else if (type === 'budget') {
    form.category_id = ''
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    const formData = new FormData()
    formData.append('account_id', form.account_id)
    if (form.category_id) {
      formData.append('category_id', form.category_id)
    }
    if (form.budget_id) {
      formData.append('budget_id', form.budget_id)
    }
    formData.append('amount', form.amount)
    formData.append('description', form.description || '')
    formData.append('happened_at', form.happened_at)

    // Add new attachments
    attachments.value.forEach((file) => {
      formData.append('attachments[]', file)
    })

    // Add removed attachments
    removedAttachments.value.forEach((id) => {
      formData.append('removed_attachments[]', String(id))
    })

    await putForm(`/transactions/${transactionId}`, formData)
    toast.success(t('transactions.updated'))
    router.push('/transactions')
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
        to="/transactions"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('transactions.editTransaction') }}
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <!-- Tipo (solo lectura) -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-1">{{ t('transactions.type') }}</label>
          <div class="text-sm text-gray-900">
            <CommonBadge :type="form.type" />
          </div>
        </div>

        <FormsSelect
          v-model="form.account_id"
          :label="t('transactions.account')"
          :options="accountOptions"
          :error="errors.account_id?.[0]"
          :placeholder="t('common.select')"
          required
        />

        <!-- Category selector (for income) -->
        <FormsSelect
          v-if="form.type === 'income'"
          v-model="form.category_id"
          :label="t('transactions.category')"
          :options="categoryOptions"
          :error="errors.category_id?.[0]"
          :placeholder="t('common.select')"
        />

        <!-- Category or Budget selector (for outcome) -->
        <div v-if="form.type === 'outcome'" class="space-y-3">
          <!-- Assignment type radio buttons (only show if budgets exist) -->
          <div v-if="filteredBudgets.length > 0">
            <label class="block text-sm font-medium text-gray-700 mb-2">
              {{ t('transactions.assignTo') }}
            </label>
            <div class="flex flex-col sm:flex-row gap-3">
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.assignment_type"
                  type="radio"
                  value="category"
                  class="text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm text-gray-700">{{ t('transactions.assignTypes.category') }}</span>
              </label>
              <label class="flex items-center gap-2 cursor-pointer">
                <input
                  v-model="form.assignment_type"
                  type="radio"
                  value="budget"
                  class="text-primary-600 focus:ring-primary-500"
                >
                <span class="text-sm text-gray-700">{{ t('transactions.assignTypes.budget') }}</span>
              </label>
            </div>
          </div>

          <!-- Category selector -->
          <FormsSelect
            v-if="form.assignment_type === 'category'"
            v-model="form.category_id"
            :label="t('transactions.category')"
            :options="categoryOptions"
            :error="errors.category_id?.[0]"
            :placeholder="t('common.select')"
          />

          <!-- Budget selector -->
          <FormsSelect
            v-if="form.assignment_type === 'budget'"
            v-model="form.budget_id"
            :label="t('transactions.budget')"
            :options="budgetOptions"
            :error="errors.budget_id?.[0]"
            :placeholder="t('common.select')"
          />
        </div>

        <FormsMoneyInput
          v-model="form.amount"
          :label="t('common.amount')"
          :currency="selectedAccount?.currency"
          :error="errors.amount?.[0]"
        />

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
          :existing-files="existingFiles"
          :label="t('transactions.attachments')"
          :error="errors.attachments?.[0]"
          :errors="errors"
          @remove-existing="handleRemoveExisting"
        />

        <div class="flex justify-end">
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('common.save') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
