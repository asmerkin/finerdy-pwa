<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account } from '~/types'

interface Media {
  id: number
  file_name: string
  mime_type: string
  size: number
  original_url: string
}

interface TransactionWithMedia extends Transaction {
  media?: Media[]
  origin?: Transaction & {
    account?: Account
  }
  destinations?: (Transaction & {
    account?: Account
  })[]
}

const route = useRoute()
const router = useRouter()
const { putForm } = useApiMutation()

const transactionId = route.params.id

// Fetch transaction with full details (including media)
const { data: rawTransactionData, pending } = await useApi<{ transaction: TransactionWithMedia }>(
  `/transactions/${transactionId}`,
)

// Unwrap the transaction from API response
const transactionData = computed(() => rawTransactionData.value?.transaction)

const { data: accountsData } = await useApi<{ accounts: Account[] }>('/accounts')
const accounts = computed(() => accountsData.value?.accounts || [])

const form = reactive({
  origin_account_id: '',
  destination_account_id: '',
  amount: '',
  description: '',
  happened_at: '',
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

// Initialize form when data loads
watch(transactionData, (newData) => {
  if (newData) {
    // If this transaction has an origin, it means it's a destination
    // We should redirect to edit the origin instead
    if (newData.origin) {
      console.warn('Attempting to edit a destination transaction, redirecting to origin')
      router.replace(`/transactions/transfer/${newData.origin.id}/edit`)
      return
    }

    const t = newData
    const destination = newData.destinations?.[0] // For now, we only handle one destination
    form.origin_account_id = String(t.account_id)
    form.destination_account_id = destination ? String(destination.account_id) : ''
    form.amount = String(Math.abs(parseFloat(t.amount)))
    form.description = t.description || ''
    if (t.happened_at) {
      form.happened_at = t.happened_at
    }
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const selectedOriginAccount = computed(() => {
  return accounts.value.find(acc => acc.id === Number(form.origin_account_id))
})

const availableDestinationAccounts = computed(() => {
  if (!selectedOriginAccount.value) return accounts.value
  return accounts.value.filter(acc =>
    acc.currency === selectedOriginAccount.value!.currency && acc.id !== Number(form.origin_account_id),
  )
})

watch(() => form.origin_account_id, () => {
  const currentDest = accounts.value.find(acc => acc.id === Number(form.destination_account_id))
  if (currentDest && currentDest.currency !== selectedOriginAccount.value?.currency) {
    form.destination_account_id = ''
  }
})

const accountOptions = computed(() =>
  accounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

const destinationOptions = computed(() =>
  availableDestinationAccounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

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

    // Add new attachments
    attachments.value.forEach((file) => {
      formData.append('attachments[]', file)
    })

    // Add removed attachments
    removedAttachments.value.forEach((id) => {
      formData.append('removed_attachments[]', String(id))
    })

    await putForm(`/transactions/transfer/${transactionId}`, formData)
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
        Editar Transferencia
      </h2>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else>
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

        <p v-if="selectedOriginAccount" class="text-sm text-gray-500">
          Solo se muestran cuentas con la misma moneda ({{ selectedOriginAccount.currency }})
        </p>

        <FormsMoneyInput
          v-model="form.amount"
          label="Monto"
          :currency="selectedOriginAccount?.currency"
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
          :existing-files="existingFiles"
          label="Adjuntos"
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
            Guardar Cambios
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
