<script setup lang="ts">
import type { Category, Budget } from '~/types'

const { t } = useI18n()
const route = useRoute()
const { put } = useApiMutation()
const auth = useAuthStore()

const budgetId = route.params.id as string
const workspaceCurrency = computed(() => auth.workspace?.default_currency || 'USD')

// Fetch budget data
const { data: budgetData, pending: budgetPending } = await useApi<{
  budget: Budget
}>(`/budgets/${budgetId}`)

// Fetch outcome categories for budget selection
const { data: categoriesData } = await useApi<{
  categories: Category[]
}>('/categories')

const outcomeCategories = computed(() => {
  const categories = categoriesData.value?.categories || []
  return categories
    .filter(c => c.transaction_type === 'outcome')
    .map(c => ({ value: c.id, label: c.name }))
})

const budget = computed(() => budgetData.value?.budget)

const form = reactive({
  name: '',
  category_id: '',
  amount: '',
  period: 'monthly',
  start_date: '',
  end_date: '',
})

// Initialize form with budget data
watch(budget, (newBudget) => {
  if (newBudget) {
    form.name = newBudget.name
    form.category_id = String(newBudget.category_id)
    form.amount = String(newBudget.amount)
    form.period = newBudget.period
    form.start_date = newBudget.start_date || ''
    form.end_date = newBudget.end_date || ''
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const periodOptions = computed(() => [
  { value: 'monthly', label: t('budgets.periods.monthly') },
  { value: 'biweekly', label: t('budgets.periods.biweekly') },
  { value: 'quarterly', label: t('budgets.periods.quarterly') },
  { value: 'yearly', label: t('budgets.periods.yearly') },
  { value: 'once', label: t('budgets.periods.once') },
])

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await put(`/budgets/${budgetId}`, {
      name: form.name,
      category_id: Number(form.category_id),
      amount: parseFloat(form.amount),
      period: form.period,
      start_date: form.period === 'once' ? form.start_date : null,
      end_date: form.period === 'once' ? form.end_date : null,
    })

    navigateTo('/budgets')
  }
  catch (error: any) {
    errors.value = error.data?.errors || {}
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="max-w-2xl mx-auto">
    <!-- Loading state -->
    <div v-if="budgetPending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <template v-else-if="budget">
      <div class="mb-6">
        <h2 class="text-2xl font-bold text-gray-900">{{ t('budgets.editBudget') }}</h2>
        <p class="mt-1 text-sm text-gray-600">
          {{ t('budgets.editBudgetDescription', { name: budget.name }) }}
        </p>
      </div>

      <CommonCard>
        <form class="space-y-6" @submit.prevent="handleSubmit">
          <!-- Name -->
          <FormsInput
            v-model="form.name"
            :label="t('budgets.name')"
            :placeholder="t('budgets.namePlaceholder')"
            :error="errors.name?.[0]"
            required
          />

          <!-- Category -->
          <FormsSelect
            v-model="form.category_id"
            :label="t('budgets.category')"
            :options="outcomeCategories"
            :error="errors.category_id?.[0]"
            required
          />

          <!-- Amount -->
          <FormsMoneyInput
            v-model="form.amount"
            :label="t('budgets.budgetAmount', { currency: workspaceCurrency })"
            :currency="workspaceCurrency"
            :error="errors.amount?.[0]"
            :help="t('budgets.amountHelp')"
            required
          />

          <!-- Period -->
          <FormsSelect
            v-model="form.period"
            :label="t('budgets.period')"
            :options="periodOptions"
            :error="errors.period?.[0]"
            :help="t('budgets.periodHelp')"
            required
          />

          <!-- Advanced Settings - Solo para período "once" -->
          <div v-if="form.period === 'once'" class="border-t border-gray-200 pt-4">
            <h3 class="text-sm font-semibold mb-3 text-gray-700">
              {{ t('budgets.budgetDates') }}
            </h3>
            <p class="text-xs text-gray-500 mb-4">
              {{ t('budgets.budgetDatesDescription') }}
            </p>

            <div class="space-y-4">
              <!-- Start Date -->
              <FormsDatePicker
                v-model="form.start_date"
                :label="t('budgets.startDate')"
                :error="errors.start_date?.[0]"
                required
              />

              <!-- End Date -->
              <FormsDatePicker
                v-model="form.end_date"
                :label="t('budgets.endDate')"
                :error="errors.end_date?.[0]"
                required
              />
            </div>
          </div>

          <!-- Actions -->
          <div class="flex gap-2 justify-end pt-4 border-t border-gray-200">
            <FormsFormButton
              type="button"
              variant="secondary"
              :disabled="isSubmitting"
              @click="navigateTo('/budgets')"
            >
              {{ t('common.cancel') }}
            </FormsFormButton>
            <FormsFormButton
              type="submit"
              variant="primary"
              :loading="isSubmitting"
              :disabled="isSubmitting"
            >
              {{ t('budgets.updateBudget') }}
            </FormsFormButton>
          </div>
        </form>
      </CommonCard>
    </template>
  </div>
</template>
