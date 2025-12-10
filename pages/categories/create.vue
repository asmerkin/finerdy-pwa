<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const router = useRouter()
const { post } = useApiMutation()

const form = reactive({
  name: '',
  transaction_type: '' as 'income' | 'outcome' | '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await post('/categories', form)
    router.push('/categories')
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
  <div class="space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/categories"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('categories.newCategory') }}
      </h2>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsInput
          v-model="form.name"
          :label="t('categories.name')"
          :error="errors.name?.[0]"
          :placeholder="t('categories.namePlaceholder')"
          required
        />

        <FormsSelect
          v-model="form.transaction_type"
          :label="t('categories.transactionType')"
          :error="errors.transaction_type?.[0]"
          :options="[
            { value: 'income', label: t('categories.types.income') },
            { value: 'outcome', label: t('categories.types.expense') }
          ]"
          required
        />

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
            {{ t('categories.createCategory') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
