<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Account, Category, Budget } from '~/types'

const { t } = useI18n()
const router = useRouter()
const { postForm } = useApiMutation()
const toast = useToast()

// Fetch accounts, categories and budgets
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

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// File handling
const attachments = ref<File[]>([])

const typeOptions = computed(() => [
  { value: 'income', label: t('transactions.types.income') },
  { value: 'outcome', label: t('transactions.types.expense') },
])

const selectedAccount = computed(() =>
  accounts.value.find(a => a.id === Number(form.account_id)),
)

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

// Reset category/budget when type changes
watch(() => form.type, () => {
  form.category_id = ''
  form.budget_id = ''
  form.assignment_type = 'category'
})

// When budget is selected, auto-assign its category
watch(() => form.budget_id, (budgetId) => {
  if (budgetId && form.assignment_type === 'budget') {
    const budget = budgets.value.find(b => b.id === Number(budgetId))
    if (budget) {
      form.category_id = String(budget.category_id)
    }
  }
})

// Clear budget_id when switching to category mode
watch(() => form.assignment_type, (type) => {
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
    // If there are attachments, use FormData
    if (attachments.value.length > 0) {
      const formData = new FormData()
      formData.append('type', form.type)
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

      // Add attachments
      attachments.value.forEach((file) => {
        formData.append('attachments[]', file)
      })

      await postForm('/transactions', formData)
    }
    else {
      // If no attachments, use regular JSON post
      const { post } = useApiMutation()
      await post('/transactions', {
        type: form.type,
        account_id: Number(form.account_id),
        category_id: form.category_id ? Number(form.category_id) : null,
        budget_id: form.budget_id ? Number(form.budget_id) : null,
        amount: parseFloat(form.amount),
        description: form.description || null,
        happened_at: form.happened_at,
      })
    }

    toast.success(t('transactions.created'))
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
        {{ t('transactions.newTransaction') }}
      </h2>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsButtonGroup
          v-model="form.type"
          :label="t('transactions.type')"
          :options="typeOptions"
        />

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
          :label="t('transactions.attachments')"
          :error="errors.attachments?.[0]"
          :errors="errors"
        />

        <div class="flex justify-end">
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('transactions.createTransaction') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
