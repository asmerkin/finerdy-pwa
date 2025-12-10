<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Category } from '~/types'

const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const { put } = useApiMutation()
const toast = useToast()

const categoryId = route.params.id

// Fetch category data
const { data, pending } = await useApi<{ category: Category }>(`/categories/${categoryId}`)

const category = computed(() => (data.value as any)?.category as Category | undefined)

const form = reactive({
  name: '',
  transaction_type: '' as 'income' | 'outcome' | '',
})

// Check if category has transactions
const hasTransactions = computed(() => {
  return !!(category.value?.transactions_count && category.value.transactions_count > 0)
})

// Initialize form when data loads
watch(category, (newCategory) => {
  if (newCategory) {
    form.name = newCategory.name
    form.transaction_type = newCategory.transaction_type
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    // Only send transaction_type if the category has no transactions
    const payload = hasTransactions.value
      ? { name: form.name }
      : { name: form.name, transaction_type: form.transaction_type }

    await put(`/categories/${categoryId}`, payload)
    toast.success(t('categories.updated'))
    router.push('/categories')
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
        to="/categories"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('categories.editCategory') }}
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
          :label="t('categories.name')"
          :error="errors.name?.[0]"
          :placeholder="t('categories.namePlaceholder')"
          required
        />

        <div>
          <FormsSelect
            v-model="form.transaction_type"
            :label="t('categories.transactionType')"
            :error="errors.transaction_type?.[0]"
            :options="[
              { value: 'income', label: t('categories.types.income') },
              { value: 'outcome', label: t('categories.types.expense') }
            ]"
            :disabled="hasTransactions"
            required
          />
          <p v-if="hasTransactions" class="mt-1 text-sm text-gray-500">
            {{ t('categories.transactionTypeCannotChange') }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/categories"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </NuxtLink>
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('categories.saveChanges') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
