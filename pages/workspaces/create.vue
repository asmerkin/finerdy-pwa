<script setup lang="ts">
const { t } = useI18n()
const router = useRouter()
const auth = useAuthStore()
const { post } = useApiMutation()

definePageMeta({
  middleware: 'auth',
})

const form = reactive({
  name: '',
  default_currency: 'USD',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// Common currencies
const currencies = [
  { value: 'USD', label: 'USD - US Dollar' },
  { value: 'EUR', label: 'EUR - Euro' },
  { value: 'GBP', label: 'GBP - British Pound' },
  { value: 'ARS', label: 'ARS - Argentine Peso' },
  { value: 'BRL', label: 'BRL - Brazilian Real' },
  { value: 'CLP', label: 'CLP - Chilean Peso' },
  { value: 'COP', label: 'COP - Colombian Peso' },
  { value: 'MXN', label: 'MXN - Mexican Peso' },
  { value: 'JPY', label: 'JPY - Japanese Yen' },
  { value: 'CAD', label: 'CAD - Canadian Dollar' },
  { value: 'AUD', label: 'AUD - Australian Dollar' },
  { value: 'CHF', label: 'CHF - Swiss Franc' },
  { value: 'CNY', label: 'CNY - Chinese Yuan' },
]

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await post('/workspaces', form)
    await auth.fetchUser()
    router.push('/workspaces')
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
    <div class="flex justify-between items-center">
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        {{ t('workspaces.newWorkspace') }}
      </h2>
      <NuxtLink
        to="/workspaces"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        {{ t('common.back') }}
      </NuxtLink>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsInput
          v-model="form.name"
          :label="t('workspaces.name')"
          :error="errors.name?.[0]"
          :placeholder="t('workspaces.namePlaceholder')"
          required
        />

        <div>
          <FormsSelect
            v-model="form.default_currency"
            :label="t('workspaces.defaultCurrency')"
            :error="errors.default_currency?.[0]"
            :options="currencies"
            :placeholder="t('workspaces.currencyPlaceholder')"
            required
          />
          <p class="mt-1 text-sm text-gray-500">
            {{ t('workspaces.currencyWarning') }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/workspaces"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </NuxtLink>
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('workspaces.createWorkspace') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
