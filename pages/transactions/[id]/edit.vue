<script setup lang="ts">
import { ChevronLeftIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account, Category } from '~/types'

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
    const t = newData
    form.type = t.type
    form.account_id = String(t.account_id)
    form.category_id = t.category_id ? String(t.category_id) : ''
    form.amount = String(t.amount)
    form.description = t.description || ''
    // Format datetime for input
    if (t.happened_at) {
      form.happened_at = t.happened_at
    }
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const typeOptions = [
  { value: 'income', label: 'Ingreso' },
  { value: 'outcome', label: 'Gasto' },
]

const accountOptions = computed(() =>
  accounts.value.map(a => ({ value: a.id, label: `${a.name} (${a.currency})` })),
)

const categoryOptions = computed(() =>
  categories.value.map(c => ({ value: c.id, label: c.name })),
)

const selectedAccount = computed(() =>
  accounts.value.find(a => a.id === Number(form.account_id)),
)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    const formData = new FormData()
    formData.append('account_id', form.account_id)
    if (form.category_id) {
      formData.append('category_id', form.category_id)
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
        Editar Transacción
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
          <label class="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
          <div class="text-sm text-gray-900">
            <CommonBadge :type="form.type" />
          </div>
        </div>

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
