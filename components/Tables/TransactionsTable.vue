<script setup lang="ts">
import { PencilIcon, TrashIcon, PaperClipIcon } from '@heroicons/vue/24/outline'
import type { Transaction } from '~/types'

const props = withDefaults(defineProps<{
  transactions: Transaction[]
  referenceCurrency?: string | null
  showActions?: boolean
  showReferenceAmount?: boolean
  showCreatedBy?: boolean
}>(), {
  showActions: true,
  showReferenceAmount: false,
  showCreatedBy: true,
})

const emit = defineEmits<{
  delete: [id: number]
}>()

const { t } = useI18n()
const { formatMoney } = useMoney()
const { formatDateTime } = useDate()
const { post, del } = useApiMutation()
const toast = useToast()

const selectedTransaction = ref<Transaction | null>(null)
const showDeleteDialog = ref(false)
const transactionToDelete = ref<number | null>(null)

const openDetailModal = (transaction: Transaction) => {
  selectedTransaction.value = transaction
}

const closeDetailModal = () => {
  selectedTransaction.value = null
}

const openDeleteDialog = (transactionId: number) => {
  transactionToDelete.value = transactionId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (transactionToDelete.value) {
    try {
      await del(`/transactions/${transactionToDelete.value}`)
      emit('delete', transactionToDelete.value)
      toast.success(t('transactions.deleted'))
    } catch (error) {
      toast.error(t('common.errorOccurred'))
    }
  }
  showDeleteDialog.value = false
  transactionToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  transactionToDelete.value = null
}

const getAmountClass = (transaction: Transaction) => {
  if (transaction.type === 'income') return 'text-success-600'
  if (transaction.type === 'outcome') return 'text-danger-600'
  return 'text-gray-900'
}

const getEditRoute = (transaction: Transaction) => {
  switch (transaction.type) {
    case 'transfer':
      return `/transactions/transfer/${transaction.id}/edit`
    case 'exchange':
      return `/transactions/exchange/${transaction.id}/edit`
    default:
      return `/transactions/${transaction.id}/edit`
  }
}
</script>

<template>
  <!-- Transaction Detail Modal -->
  <ModalsTransactionDetail
    :transaction="selectedTransaction"
    :reference-currency="referenceCurrency"
    @close="closeDetailModal"
    @view-related="openDetailModal"
  />

  <!-- Delete Confirmation Dialog -->
  <CommonConfirmDialog
    :open="showDeleteDialog"
    title="Eliminar transacción"
    message="¿Estás seguro de que deseas eliminar esta transacción? Esta acción no se puede deshacer."
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />

  <!-- Mobile Card View -->
  <div class="lg:hidden space-y-4">
    <div
      v-for="transaction in transactions"
      :key="transaction.id"
      class="bg-white border border-gray-200 rounded-lg p-4 space-y-3 cursor-pointer hover:border-primary-300 transition-colors"
      @click="openDetailModal(transaction)"
    >
      <!-- Fecha + Badge + Attachments -->
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">{{ formatDateTime(transaction.happened_at) }}</span>
          <div v-if="transaction.media_count > 0" class="flex items-center gap-1 text-gray-500">
            <PaperClipIcon class="h-3 w-3" />
            <span class="text-xs">{{ transaction.media_count }}</span>
          </div>
        </div>
        <CommonBadge :type="transaction.type" />
      </div>

      <!-- Cuenta + Categoría -->
      <div class="space-y-1">
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Cuenta:</span>
          <span class="text-sm font-medium text-gray-900">{{ transaction.account?.name || '-' }}</span>
        </div>
        <div class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Categoría:</span>
          <span class="text-sm text-gray-700">{{ transaction.category?.name || '-' }}</span>
        </div>
        <div v-if="transaction.budget" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Presupuesto:</span>
          <span class="text-sm text-gray-700">{{ transaction.budget.name }}</span>
        </div>
        <div v-if="showCreatedBy && transaction.creator" class="flex items-center gap-2">
          <span class="text-xs text-gray-500">Creado por:</span>
          <span class="text-sm text-gray-700">{{ transaction.creator.name }}</span>
        </div>
      </div>

      <!-- Descripción -->
      <div v-if="transaction.description" class="text-sm text-gray-600">
        {{ transaction.description }}
      </div>

      <!-- Monto -->
      <div class="flex items-center justify-between">
        <span class="text-xs text-gray-500">Monto:</span>
        <span class="text-lg font-semibold" :class="getAmountClass(transaction)">
          {{ formatMoney(transaction.amount, transaction.account?.currency) }}
        </span>
      </div>

      <!-- Acciones -->
      <div v-if="showActions" class="flex gap-1 justify-end pt-2 border-t border-gray-100" @click.stop>
        <FormsIconButton
          :to="getEditRoute(transaction)"
          :icon="PencilIcon"
          variant="secondary"
          size="sm"
        />
        <FormsIconButton
          :icon="TrashIcon"
          variant="danger"
          size="sm"
          @click="openDeleteDialog(transaction.id)"
        />
      </div>
    </div>
  </div>

  <!-- Desktop Table -->
  <div class="hidden lg:block overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Fecha
          </th>
          <th class="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
            <PaperClipIcon class="h-4 w-4 inline" />
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tipo
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Cuenta
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Categoría
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Presupuesto
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Descripción
          </th>
          <th v-if="showCreatedBy" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Creado por
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Monto
          </th>
          <th v-if="showActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr
          v-for="transaction in transactions"
          :key="transaction.id"
          class="hover:bg-gray-50 cursor-pointer"
          @click="openDetailModal(transaction)"
        >
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ formatDateTime(transaction.happened_at) }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-center">
            <div v-if="transaction.media_count > 0" class="flex items-center justify-center gap-1 text-gray-500">
              <PaperClipIcon class="h-4 w-4" />
              <span class="text-xs">{{ transaction.media_count }}</span>
            </div>
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <CommonBadge :type="transaction.type" />
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
            {{ transaction.account?.name || '-' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ transaction.category?.name || '-' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ transaction.budget?.name || '-' }}
          </td>
          <td class="px-6 py-4 text-sm text-gray-900">
            {{ transaction.description || '-' }}
          </td>
          <td v-if="showCreatedBy" class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
            {{ transaction.creator?.name || '-' }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-medium" :class="getAmountClass(transaction)">
            {{ formatMoney(transaction.amount, transaction.account?.currency) }}
          </td>
          <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
            <div class="flex justify-end gap-2">
              <FormsIconButton
                :to="getEditRoute(transaction)"
                :icon="PencilIcon"
                label="Editar"
                variant="secondary"
                size="sm"
              />
              <FormsIconButton
                :icon="TrashIcon"
                label="Eliminar"
                variant="danger"
                size="sm"
                @click="openDeleteDialog(transaction.id)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
