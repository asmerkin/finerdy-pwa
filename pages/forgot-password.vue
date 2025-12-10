<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const form = reactive({
  email: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const status = ref('')

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}
  status.value = ''

  try {
    const response = await $fetch<{ status: string }>(`${apiBase}/api/forgot-password`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: { email: form.email },
    })

    status.value = response.status
  }
  catch (error: any) {
    errors.value = error.data?.errors || { email: ['Something went wrong'] }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div>
    <div class="mb-4 text-sm text-gray-600">
      {{ t('auth.forgotPasswordDescription') }}
    </div>

    <div v-if="status" class="mb-4 text-sm font-medium text-green-600">
      {{ status }}
    </div>

    <form @submit.prevent="handleSubmit">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          {{ t('auth.email') }}
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="username"
          required
          autofocus
          class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        >
        <p v-if="errors.email" class="mt-2 text-sm text-danger-600">
          {{ errors.email[0] }}
        </p>
      </div>

      <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NuxtLink
          to="/login"
          class="text-center rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ t('auth.backToLogin') }}
        </NuxtLink>

        <FormsFormButton
          type="submit"
          variant="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ t('auth.sendResetLink') }}
        </FormsFormButton>
      </div>
    </form>
  </div>
</template>
