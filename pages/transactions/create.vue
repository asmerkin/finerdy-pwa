<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Account, Category } from '~/types'

const router = useRouter()
const { post } = useApiMutation()

// Fetch accounts and categories
const { data: accountsData } = await useApi<{ accounts: Account[] }>('/accounts')
const { data: categoriesData } = await useApi<{ categories: Category[] }>('/categories')

const accounts = computed(() => accountsData.value?.accounts || [])
const categories = computed(() => categoriesData.value?.categories || [])

const form = reactive({
  type: 'outcome',
  account_id: '',
  category_id: '',
  amount: '',
  description: '',
  happened_at: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const typeOptions = [
  { value: 'income', label: 'Ingreso' },
  { value: 'outcome', label: 'Gasto' },
]

const selectedAccount = computed(() =>
  accounts.value.find(a => a.id === Number(form.account_id)),
)

const accountOptions = computed(() =>
  accounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

const categoryOptions = computed(() =>
  categories.value.map(c => ({ value: c.id, label: c.name })),
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await post('/transactions', {
      ...form,
      account_id: Number(form.account_id),
      category_id: form.category_id ? Number(form.category_id) : null,
      amount: parseFloat(form.amount),
    })
    router.push('/transactions')
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
  <div class="max-w-2xl mx-auto space-y-6">
    <div class="flex items-center gap-3">
      <NuxtLink
        to="/transactions"
        class="p-1 rounded-md text-gray-500 hover:text-gray-700 hover:bg-gray-100"
      >
        <ChevronLeftIcon class="h-6 w-6" />
      </NuxtLink>
      <h2 class="text-2xl font-bold leading-7 text-gray-900">
        Nueva Transacción
      </h2>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsSelect
          v-model="form.type"
          label="Tipo"
          :options="typeOptions"
          :error="errors.type?.[0]"
          required
        />

        <FormsSelect
          v-model="form.account_id"
          label="Cuenta"
          :options="accountOptions"
          :error="errors.account_id?.[0]"
          placeholder="Seleccionar cuenta"
          required
        />

        <FormsSelect
          v-model="form.category_id"
          label="Categoría"
          :options="categoryOptions"
          :error="errors.category_id?.[0]"
          placeholder="Seleccionar categoría (opcional)"
        />

        <FormsMoneyInput
          v-model="form.amount"
          label="Monto"
          :currency="selectedAccount?.currency"
          :error="errors.amount?.[0]"
        />

        <FormsTextarea
          v-model="form.description"
          label="Descripción"
          :error="errors.description?.[0]"
          placeholder="Descripción opcional"
        />

        <FormsDatePicker
          v-model="form.happened_at"
          label="Fecha y hora"
          :error="errors.happened_at?.[0]"
        />

        <div class="flex justify-end">
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            Crear Transacción
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
