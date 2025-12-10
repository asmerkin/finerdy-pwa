<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Account } from '~/types'

const { t } = useI18n()
const router = useRouter()
const { postForm } = useApiMutation()

// Fetch accounts
const { data: accountsData } = await useApi<{ accounts: Account[] }>('/accounts')
const accounts = computed(() => accountsData.value?.accounts || [])

const form = reactive({
  origin_account_id: '',
  destination_account_id: '',
  amount: '',
  description: '',
  happened_at: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const originAccount = computed(() => {
  return accounts.value.find(acc => acc.id === Number(form.origin_account_id))
})

const availableDestinationAccounts = computed(() => {
  if (!originAccount.value) return accounts.value
  return accounts.value.filter(acc =>
    acc.currency === originAccount.value!.currency && acc.id !== Number(form.origin_account_id),
  )
})

watch(() => form.origin_account_id, () => {
  const currentDest = accounts.value.find(acc => acc.id === Number(form.destination_account_id))
  if (currentDest && currentDest.currency !== originAccount.value?.currency) {
    form.destination_account_id = ''
  }
})

const accountOptions = computed(() =>
  accounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

const destinationOptions = computed(() =>
  availableDestinationAccounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

// File handling
const attachments = ref<File[]>([])

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    const formData = new FormData()
    formData.append('origin_account_id', form.origin_account_id)
    formData.append('destination_account_id', form.destination_account_id)
    formData.append('amount', form.amount)
    formData.append('description', form.description || '')
    formData.append('happened_at', form.happened_at)

    // Add attachments
    attachments.value.forEach((file) => {
      formData.append('attachments[]', file)
    })

    await postForm('/transactions/transfer', formData)
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
        Nueva Transferencia
      </h2>
    </div>

    <CommonCard>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsSelect
          v-model="form.origin_account_id"
          label="Cuenta origen"
          :options="accountOptions"
          :error="errors.origin_account_id?.[0]"
          placeholder="Seleccionar cuenta"
          required
        />

        <FormsSelect
          v-model="form.destination_account_id"
          label="Cuenta destino"
          :options="destinationOptions"
          :error="errors.destination_account_id?.[0]"
          placeholder="Seleccionar cuenta"
          required
        />

        <p v-if="originAccount" class="text-sm text-gray-500">
          Solo se muestran cuentas con la misma moneda ({{ originAccount.currency }})
        </p>

        <FormsMoneyInput
          v-model="form.amount"
          label="Monto"
          :currency="originAccount?.currency"
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
            Crear Transferencia
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
