<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Account } from '~/types'

const props = withDefaults(defineProps<{
  accounts: Account[]
  currency: string
  total: number
  showActions?: boolean
}>(), {
  showActions: true,
})

const emit = defineEmits<{
  delete: [id: number]
}>()

const { formatMoney } = useMoney()
const { del } = useApiMutation()

const showDeleteDialog = ref(false)
const accountToDelete = ref<number | null>(null)

const openDeleteDialog = (accountId: number) => {
  accountToDelete.value = accountId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (accountToDelete.value) {
    await del(`/accounts/${accountToDelete.value}`)
    emit('delete', accountToDelete.value)
  }
  showDeleteDialog.value = false
  accountToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  accountToDelete.value = null
}
</script>

<template>
  <!-- Delete Confirmation Dialog -->
  <CommonConfirmDialog
    :open="showDeleteDialog"
    title="Eliminar cuenta"
    message="¿Estás seguro de que deseas eliminar esta cuenta? Esta acción no se puede deshacer."
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />

  <!-- Mobile Card View -->
  <div class="lg:hidden space-y-4">
    <div
      v-for="account in accounts"
      :key="account.id"
      class="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <!-- Nombre + Moneda -->
      <div class="flex items-center justify-between">
        <span class="text-base font-semibold text-gray-900">{{ account.name }}</span>
        <span class="text-xs font-medium text-gray-500 uppercase">{{ account.currency }}</span>
      </div>

      <!-- Balance + Acciones -->
      <div class="flex items-center justify-between pt-2 border-t border-gray-100">
        <span class="text-lg font-bold text-gray-900">
          {{ formatMoney(account.balance, account.currency) }}
        </span>
        <div v-if="showActions" class="flex gap-1">
          <FormsIconButton
            :to="`/accounts/${account.id}/edit`"
            :icon="PencilIcon"
            variant="secondary"
            size="sm"
          />
          <FormsIconButton
            :icon="TrashIcon"
            variant="danger"
            size="sm"
            @click="openDeleteDialog(account.id)"
          />
        </div>
      </div>
    </div>

    <!-- Total Card (Mobile) -->
    <div class="bg-primary-50 border border-primary-200 rounded-lg p-4">
      <div class="flex items-center justify-between">
        <span class="text-sm font-semibold text-primary-900">Total</span>
        <span class="text-lg font-bold text-primary-700">
          {{ formatMoney(total, currency) }}
        </span>
      </div>
    </div>
  </div>

  <!-- Desktop Table -->
  <div class="hidden lg:block overflow-x-auto">
    <table class="min-w-full divide-y divide-gray-200">
      <thead class="bg-gray-50">
        <tr>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Nombre
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Moneda
          </th>
          <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Balance
          </th>
          <th v-if="showActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="account in accounts" :key="account.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ account.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500 uppercase">
            {{ account.currency }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-semibold text-gray-900">
            {{ formatMoney(account.balance, account.currency) }}
          </td>
          <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex justify-end gap-2">
              <FormsIconButton
                :to="`/accounts/${account.id}/edit`"
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
                @click="openDeleteDialog(account.id)"
              />
            </div>
          </td>
        </tr>
        <!-- Total Row (Desktop) -->
        <tr class="bg-primary-50">
          <td colspan="2" class="px-6 py-4 whitespace-nowrap text-sm font-bold text-primary-900">
            Total
          </td>
          <td class="px-6 py-4 whitespace-nowrap text-sm text-right font-bold text-primary-700">
            {{ formatMoney(total, currency) }}
          </td>
          <td v-if="showActions" />
        </tr>
      </tbody>
    </table>
  </div>
</template>
