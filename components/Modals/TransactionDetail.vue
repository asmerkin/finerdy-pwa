<script setup lang="ts">
import { XMarkIcon, PaperClipIcon, DocumentIcon, PhotoIcon } from '@heroicons/vue/24/outline'
import type { Transaction, Account } from '~/types'

interface Media {
  id: number
  file_name: string
  mime_type: string
  size: number
  original_url: string
}

interface FullTransaction extends Transaction {
  media?: Media[]
  origin?: Transaction & {
    account?: Account
    exchange_difference?: string | null
  }
  destinations?: (Transaction & {
    account?: Account
    exchange_difference?: string | null
  })[]
  creator?: {
    id: number
    name: string
    email?: string
  } | null
}

const props = defineProps<{
  transaction: Transaction | null
  referenceCurrency?: string | null
}>()

const emit = defineEmits<{
  close: []
  viewRelated: [transaction: Transaction]
}>()

const { formatMoney } = useMoney()
const { formatDateTime } = useDate()
const { t } = useI18n()

const isOpen = computed(() => props.transaction !== null)
const fullTransaction = ref<FullTransaction | null>(null)
const isLoading = ref(false)

// Watch for transaction changes and load full details
watch(() => props.transaction, async (newTransaction, oldTransaction) => {
  if (newTransaction && newTransaction.id !== oldTransaction?.id) {
    isLoading.value = true
    fullTransaction.value = null
    try {
      const response = await $fetch<{ transaction: FullTransaction }>(
        `/transactions/${newTransaction.id}`,
        {
          baseURL: useRuntimeConfig().public.apiBase + `/api/workspaces/${useAuthStore().workspace?.id}`,
          headers: {
            'Authorization': `Bearer ${useAuthStore().token}`,
            'Accept': 'application/json',
          },
        }
      )
      fullTransaction.value = response.transaction
    }
    catch (error) {
      console.error('Error loading transaction details:', error)
      fullTransaction.value = null
    }
    finally {
      isLoading.value = false
    }
  }
  else if (!newTransaction) {
    fullTransaction.value = null
    isLoading.value = false
  }
})

const displayTransaction = computed(() => fullTransaction.value || props.transaction)

// Get all related transactions (could be origin or destinations depending on current transaction)
const relatedTransactions = computed(() => {
  const current = displayTransaction.value as FullTransaction
  if (!current) return []

  const related: Transaction[] = []

  // If this transaction has destinations, add them
  if (current.destinations && current.destinations.length > 0) {
    related.push(...current.destinations)
  }

  // If this transaction has an origin, add it
  if (current.origin) {
    related.push(current.origin)
  }

  return related
})

// Check if there are any related transactions
const hasRelatedTransactions = computed(() => relatedTransactions.value.length > 0)

// Get the label for related transactions section
const relatedTransactionsLabel = computed(() => {
  const current = displayTransaction.value as FullTransaction
  if (!current) return ''

  // If this transaction has destinations, we're showing the destinations
  if (current.destinations && current.destinations.length > 0) {
    return current.destinations.length === 1
      ? t('transactionModal.destinationTransaction')
      : t('transactionModal.destinationTransactions')
  }

  // If this transaction has an origin, we're showing the origin
  if (current.origin) {
    return t('transactionModal.originTransaction')
  }

  return ''
})

// Get the label for the edit button
const editButtonLabel = computed(() => {
  const current = displayTransaction.value as FullTransaction
  if (!current) return t('transactionModal.edit')

  // If this is a destination transaction (has origin), we'll be editing the origin
  if (current.origin) {
    return t('transactionModal.editOrigin')
  }

  return t('transactionModal.edit')
})

// exchange_difference is stored on the destination transaction (positive amount)
const exchangeDifference = computed(() => {
  if (!displayTransaction.value || displayTransaction.value.type !== 'exchange') {
    return null
  }
  if (displayTransaction.value.exchange_difference) {
    return displayTransaction.value.exchange_difference
  }
  const dests = (displayTransaction.value as FullTransaction).destinations
  if (dests && dests.length > 0 && dests[0].exchange_difference) {
    return dests[0].exchange_difference
  }
  const orig = (displayTransaction.value as FullTransaction).origin
  if (orig?.exchange_difference) {
    return orig.exchange_difference
  }
  return null
})

const getAmountClass = (transaction: Transaction) => {
  if (transaction.type === 'income') return 'text-success-600'
  if (transaction.type === 'outcome') return 'text-danger-600'
  return 'text-gray-900'
}

const getFileIcon = (mimeType: string) => {
  if (mimeType?.startsWith('image/')) return PhotoIcon
  return DocumentIcon
}

const closeModal = () => {
  emit('close')
}

const viewRelatedTransaction = (transaction: Transaction) => {
  emit('viewRelated', transaction)
}

const getEditRoute = (transaction: Transaction) => {
  // If this is a destination transaction (has origin), redirect to edit the origin instead
  const fullTx = transaction as FullTransaction
  const editId = fullTx.origin ? fullTx.origin.id : transaction.id

  switch (transaction.type) {
    case 'transfer':
      return `/transactions/transfer/${editId}/edit`
    case 'exchange':
      return `/transactions/exchange/${editId}/edit`
    default:
      return `/transactions/${editId}/edit`
  }
}

const handleBackdropClick = (event: MouseEvent) => {
  if (event.target === event.currentTarget) {
    closeModal()
  }
}

const handleEscapeKey = (event: KeyboardEvent) => {
  if (event.key === 'Escape' && isOpen.value) {
    closeModal()
  }
}

onMounted(() => {
  document.addEventListener('keydown', handleEscapeKey)
})

onUnmounted(() => {
  document.removeEventListener('keydown', handleEscapeKey)
})
</script>

<template>
  <!-- Modal Backdrop -->
  <Transition
    enter-active-class="transition ease-out duration-200"
    enter-from-class="opacity-0"
    enter-to-class="opacity-100"
    leave-active-class="transition ease-in duration-150"
    leave-from-class="opacity-100"
    leave-to-class="opacity-0"
  >
    <div
      v-if="isOpen"
      class="fixed inset-0 z-50 bg-black/30 backdrop-blur-sm"
      @click="handleBackdropClick"
    >
      <!-- Modal Content -->
      <Transition
        enter-active-class="transition ease-out duration-200"
        enter-from-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
        enter-to-class="opacity-100 translate-y-0 sm:scale-100"
        leave-active-class="transition ease-in duration-150"
        leave-from-class="opacity-100 translate-y-0 sm:scale-100"
        leave-to-class="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
      >
        <div
          v-if="isOpen"
          class="fixed inset-0 flex items-center justify-center p-4"
          @click="handleBackdropClick"
        >
          <div class="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto" @click.stop>
            <!-- Header -->
            <div class="flex items-center justify-between p-6 border-b border-gray-200">
              <div class="flex items-center gap-3">
                <h3 class="text-lg font-semibold text-gray-900">
                  Transacción #{{ displayTransaction?.id }}
                </h3>
                <CommonBadge v-if="displayTransaction" :type="displayTransaction.type" />
              </div>
              <button
                class="text-gray-400 hover:text-gray-600 transition-colors"
                @click="closeModal"
              >
                <XMarkIcon class="h-6 w-6" />
              </button>
            </div>

            <!-- Loading State -->
            <div v-if="isLoading" class="p-12 flex items-center justify-center">
              <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600" />
            </div>

            <!-- Body -->
            <div v-else-if="displayTransaction" class="p-6 space-y-6">
              <!-- Fecha y Hora -->
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Fecha y Hora
                </label>
                <p class="text-sm text-gray-900">
                  {{ formatDateTime(displayTransaction.happened_at) }}
                </p>
              </div>

              <!-- Cuenta -->
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Cuenta
                </label>
                <p class="text-sm text-gray-900">
                  {{ displayTransaction.account?.name || '-' }}
                  <span v-if="displayTransaction.account?.currency" class="text-gray-500">
                    ({{ displayTransaction.account.currency }})
                  </span>
                </p>
              </div>

              <!-- Categoría -->
              <div>
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Categoría
                </label>
                <p class="text-sm text-gray-900">
                  {{ displayTransaction.category?.name || '-' }}
                </p>
              </div>

              <!-- Descripción -->
              <div v-if="displayTransaction.description">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Descripción
                </label>
                <p class="text-sm text-gray-900 whitespace-pre-wrap">
                  {{ displayTransaction.description }}
                </p>
              </div>

              <!-- Montos -->
              <div class="bg-gray-50 rounded-lg p-4 space-y-3">
                <div class="flex items-center justify-between">
                  <span class="text-sm font-medium text-gray-500">Monto:</span>
                  <span class="text-2xl font-bold" :class="getAmountClass(displayTransaction)">
                    {{ formatMoney(displayTransaction.amount, displayTransaction.account?.currency) }}
                  </span>
                </div>
                <div
                  v-if="referenceCurrency && displayTransaction.account?.currency !== referenceCurrency && displayTransaction.reference_amount"
                  class="flex items-center justify-between pt-3 border-t border-gray-200"
                >
                  <span class="text-sm font-medium text-gray-500">Monto de Referencia:</span>
                  <span class="text-lg font-semibold text-gray-700">
                    {{ formatMoney(displayTransaction.reference_amount, referenceCurrency) }}
                  </span>
                </div>
              </div>

              <!-- Transacciones Relacionadas (para transfers y exchanges) -->
              <div v-if="hasRelatedTransactions" class="border-t border-gray-200 pt-6">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  {{ relatedTransactionsLabel }}
                </label>
                <div class="space-y-3">
                  <div
                    v-for="related in relatedTransactions"
                    :key="related.id"
                    class="bg-blue-50 rounded-lg p-4 space-y-3"
                  >
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Cuenta:</span>
                      <span class="text-sm font-medium text-gray-900">
                        {{ related.account?.name }}
                      </span>
                    </div>
                    <div class="flex items-center justify-between">
                      <span class="text-sm text-gray-600">Monto:</span>
                      <span class="text-sm font-semibold text-gray-900">
                        {{ formatMoney(related.amount, related.account?.currency) }}
                      </span>
                    </div>
                    <div class="pt-2 border-t border-blue-200">
                      <button
                        class="text-xs text-primary-600 hover:text-primary-700 hover:underline transition-colors"
                        @click="viewRelatedTransaction(related)"
                      >
                        Ver detalles →
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Eficiencia del Cambio (solo para exchanges con exchange_difference) -->
              <div v-if="displayTransaction.type === 'exchange' && exchangeDifference !== null" class="border-t border-gray-200 pt-6">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Eficiencia del Cambio
                </label>
                <div
                  class="rounded-lg p-4"
                  :class="parseFloat(String(exchangeDifference)) >= 0 ? 'bg-green-50' : 'bg-red-50'"
                >
                  <div class="flex items-center justify-between">
                    <span class="text-sm text-gray-600">
                      {{ parseFloat(String(exchangeDifference)) >= 0 ? 'Ganancia vs mercado' : 'Pérdida vs mercado' }}
                    </span>
                    <span
                      class="text-lg font-semibold"
                      :class="parseFloat(String(exchangeDifference)) >= 0 ? 'text-success-600' : 'text-danger-600'"
                    >
                      {{ parseFloat(String(exchangeDifference)) >= 0 ? '+' : '' }}{{ formatMoney(exchangeDifference, referenceCurrency) }}
                    </span>
                  </div>
                  <p class="text-xs text-gray-500 mt-2">
                    Comparado con la tasa del mercado al momento
                  </p>
                </div>
              </div>

              <!-- Archivos Adjuntos -->
              <div v-if="(displayTransaction as FullTransaction).media && (displayTransaction as FullTransaction).media!.length > 0" class="border-t border-gray-200 pt-6">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-3">
                  Adjuntos ({{ (displayTransaction as FullTransaction).media!.length }})
                </label>
                <div class="space-y-2">
                  <a
                    v-for="file in (displayTransaction as FullTransaction).media"
                    :key="file.id"
                    :href="file.original_url"
                    target="_blank"
                    class="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <component :is="getFileIcon(file.mime_type)" class="h-5 w-5 text-gray-400 flex-shrink-0" />
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-medium text-gray-900 truncate">
                        {{ file.file_name }}
                      </p>
                      <p class="text-xs text-gray-500">
                        {{ (file.size / 1024).toFixed(1) }} KB
                      </p>
                    </div>
                    <PaperClipIcon class="h-4 w-4 text-gray-400" />
                  </a>
                </div>
              </div>

              <!-- Creado por -->
              <div v-if="(displayTransaction as FullTransaction).creator" class="border-t border-gray-200 pt-6">
                <label class="block text-xs font-medium text-gray-500 uppercase tracking-wider mb-1">
                  Creado por
                </label>
                <p class="text-sm text-gray-900">
                  {{ (displayTransaction as FullTransaction).creator?.name }}
                  <span v-if="(displayTransaction as FullTransaction).creator?.email" class="text-gray-500">
                    ({{ (displayTransaction as FullTransaction).creator?.email }})
                  </span>
                </p>
              </div>

              <!-- Timestamps -->
              <div class="border-t border-gray-200 pt-6 grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-gray-500">
                <div>
                  <span class="font-medium">Creado:</span>
                  {{ formatDateTime(displayTransaction.created_at) }}
                </div>
                <div>
                  <span class="font-medium">Actualizado:</span>
                  {{ formatDateTime(displayTransaction.updated_at) }}
                </div>
              </div>
            </div>

            <!-- Footer -->
            <div class="flex justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
              <NuxtLink
                v-if="displayTransaction"
                :to="getEditRoute(displayTransaction)"
                class="px-4 py-2 text-sm font-medium text-primary-700 bg-white border border-primary-300 rounded-md hover:bg-primary-50 transition-colors"
              >
                {{ editButtonLabel }}
              </NuxtLink>
              <button
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                @click="closeModal"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      </Transition>
    </div>
  </Transition>
</template>
