<script setup lang="ts">
const { t } = useI18n()
const route = useRoute()
const router = useRouter()
const auth = useAuthStore()
const { put } = useApiMutation()

definePageMeta({
  middleware: 'auth',
})

const workspaceId = route.params.id

interface Workspace {
  id: number
  name: string
  slug: string
  default_currency: string
  is_owner: boolean
}

const { data: workspaceData, pending } = await useApi<{ workspace: Workspace }>(`/api/workspaces/${workspaceId}`)

const form = reactive({
  name: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// Initialize form when data loads
watch(workspaceData, (newData) => {
  if (newData?.workspace) {
    form.name = newData.workspace.name
  }
}, { immediate: true })

const workspace = computed(() => workspaceData.value?.workspace)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await put(`/api/workspaces/${workspaceId}`, form)
    await auth.fetchUser()
    router.push('/workspaces')
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
        {{ t('workspaces.editWorkspace') }}
      </h2>
      <NuxtLink
        to="/workspaces"
        class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
      >
        {{ t('common.back') }}
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
          :label="t('workspaces.name')"
          :error="errors.name?.[0]"
          :placeholder="t('workspaces.namePlaceholder')"
          required
        />

        <div>
          <FormsInput
            :model-value="workspace?.default_currency"
            :label="t('workspaces.defaultCurrency')"
            disabled
          />
          <p class="mt-1 text-sm text-gray-500">
            {{ t('workspaces.currencyCannotChange') }}
          </p>
        </div>

        <div class="flex justify-end space-x-3">
          <NuxtLink
            to="/workspaces"
            class="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
          >
            {{ t('common.cancel') }}
          </NuxtLink>
          <FormsFormButton
            type="submit"
            :loading="isSubmitting"
            :disabled="isSubmitting"
          >
            {{ t('common.save') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>
  </div>
</template>
