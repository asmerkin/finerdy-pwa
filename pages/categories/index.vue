<script setup lang="ts">
import { PlusIcon } from '@heroicons/vue/24/outline'
import type { Category } from '~/types'

// Fetch categories
const { data, pending, refresh } = await useApi<{
  categories: Category[]
}>('/categories')

const categories = computed(() => data.value?.categories || [])

const handleDelete = () => {
  refresh()
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        Categorías
      </h2>
      <FormsIconButton
        to="/categories/create"
        :icon="PlusIcon"
        label="Nueva"
        variant="primary"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Empty state -->
    <CommonCard v-else-if="categories.length === 0" title="Sin categorías">
      <p class="text-gray-600">
        No hay categorías registradas. Crea tu primera categoría para organizar tus transacciones.
      </p>
      <div class="mt-4">
        <FormsFormButton to="/categories/create" variant="primary">
          Crear Primera Categoría
        </FormsFormButton>
      </div>
    </CommonCard>

    <!-- Categories list -->
    <CommonCard v-else>
      <TablesCategoriesTable
        :categories="categories"
        @delete="handleDelete"
      />
    </CommonCard>
  </div>
</template>
