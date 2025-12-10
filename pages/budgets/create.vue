<script setup lang="ts">
import type { Category } from '~/types'

const { t } = useI18n()
const { post } = useApiMutation()
const auth = useAuthStore()
const toast = useToast()

const workspaceCurrency = computed(() => auth.workspace?.default_currency || 'USD')

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

const form = reactive({
  name: '',
  category_id: '',
  amount: '',
  period: 'monthly',
  start_date: '',
  end_date: '',
})

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
    await post('/budgets', {
      name: form.name,
      category_id: Number(form.category_id),
      amount: parseFloat(form.amount),
      period: form.period,
      start_date: form.period === 'once' ? form.start_date : null,
      end_date: form.period === 'once' ? form.end_date : null,
    })

    toast.success(t('budgets.created'))
    navigateTo('/budgets')
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
  <div class="max-w-2xl mx-auto">
    <div class="mb-6">
      <h2 class="text-2xl font-bold text-gray-900">{{ t('budgets.newBudget') }}</h2>
      <p class="mt-1 text-sm text-gray-600">
        {{ t('budgets.newBudgetDescription') }}
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
          :placeholder="t('budgets.selectCategory')"
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
            {{ t('budgets.createBudget') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
