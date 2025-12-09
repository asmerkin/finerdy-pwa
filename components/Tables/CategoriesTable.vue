<script setup lang="ts">
import { PencilIcon, TrashIcon } from '@heroicons/vue/24/outline'
import type { Category } from '~/types'

const props = withDefaults(defineProps<{
  categories: Category[]
  showActions?: boolean
}>(), {
  showActions: true,
})

const emit = defineEmits<{
  delete: [id: number]
}>()

const { del } = useApiMutation()

const showDeleteDialog = ref(false)
const categoryToDelete = ref<number | null>(null)

const openDeleteDialog = (categoryId: number) => {
  categoryToDelete.value = categoryId
  showDeleteDialog.value = true
}

const confirmDelete = async () => {
  if (categoryToDelete.value) {
    await del(`/categories/${categoryToDelete.value}`)
    emit('delete', categoryToDelete.value)
  }
  showDeleteDialog.value = false
  categoryToDelete.value = null
}

const cancelDelete = () => {
  showDeleteDialog.value = false
  categoryToDelete.value = null
}
</script>

<template>
  <!-- Delete Confirmation Dialog -->
  <CommonConfirmDialog
    :open="showDeleteDialog"
    title="Eliminar categoría"
    message="¿Estás seguro de que deseas eliminar esta categoría? Las transacciones asociadas quedarán sin categoría."
    confirm-text="Eliminar"
    cancel-text="Cancelar"
    variant="danger"
    @confirm="confirmDelete"
    @cancel="cancelDelete"
  />

  <!-- Mobile Card View -->
  <div class="lg:hidden space-y-4">
    <div
      v-for="category in categories"
      :key="category.id"
      class="bg-white border border-gray-200 rounded-lg p-4 space-y-3"
    >
      <!-- Nombre + Tipo -->
      <div class="flex items-center justify-between">
        <span class="text-base font-semibold text-gray-900">{{ category.name }}</span>
        <CommonBadge :type="category.transaction_type" />
      </div>

      <!-- Acciones -->
      <div v-if="showActions" class="flex gap-1 justify-end pt-2 border-t border-gray-100">
        <FormsIconButton
          :to="`/categories/${category.id}/edit`"
          :icon="PencilIcon"
          variant="secondary"
          size="sm"
        />
        <FormsIconButton
          :icon="TrashIcon"
          variant="danger"
          size="sm"
          @click="openDeleteDialog(category.id)"
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
            Nombre
          </th>
          <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
            Tipo
          </th>
          <th v-if="showActions" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
            Acciones
          </th>
        </tr>
      </thead>
      <tbody class="bg-white divide-y divide-gray-200">
        <tr v-for="category in categories" :key="category.id" class="hover:bg-gray-50">
          <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
            {{ category.name }}
          </td>
          <td class="px-6 py-4 whitespace-nowrap">
            <CommonBadge :type="category.transaction_type" />
          </td>
          <td v-if="showActions" class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
            <div class="flex justify-end gap-2">
              <FormsIconButton
                :to="`/categories/${category.id}/edit`"
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
                @click="openDeleteDialog(category.id)"
              />
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>
