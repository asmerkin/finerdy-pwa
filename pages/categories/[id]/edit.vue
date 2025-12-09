<script setup lang="ts">
import type { Category } from '~/types'

const route = useRoute()
const router = useRouter()
const { put } = useApiMutation()

const categoryId = route.params.id

// Fetch category data
const { data, pending } = await useApi<{ category: Category }>(`/categories/${categoryId}`)

const form = reactive({
  name: '',
  description: '',
})

// Initialize form when data loads
watch(data, (newData) => {
  if (newData?.category) {
    form.name = newData.category.name
    form.description = newData.category.description || ''
  }
}, { immediate: true })

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await put(`/categories/${categoryId}`, form)
    router.push('/categories')
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
        Editar Categoría
      </h2>
      <NuxtLink
        to="/categories"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        Volver
      </NuxtLink>
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else>
      <form class="space-y-6" @submit.prevent="handleSubmit">
        <FormsInput
          v-model="form.name"
          label="Nombre"
          :error="errors.name?.[0]"
          placeholder="Ej: Comida, Transporte, Entretenimiento..."
          required
        />

        <FormsInput
          v-model="form.description"
          label="Descripción"
          :error="errors.description?.[0]"
          placeholder="Descripción opcional"
        />

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/categories"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            Cancelar
          </NuxtLink>
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
