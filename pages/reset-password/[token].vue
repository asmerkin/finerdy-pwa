<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const config = useRuntimeConfig()
const apiBase = config.public.apiBase
const route = useRoute()

const form = reactive({
  token: route.params.token as string,
  email: (route.query.email as string) || '',
  password: '',
  password_confirmation: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  try {
    await $fetch(`${apiBase}/api/reset-password`, {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
      },
      body: form,
    })

    // Redirect to login with success message
    navigateTo('/login?reset=success')
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
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="email" class="block text-sm font-medium text-gray-700">
        Email
      </label>
      <input
        id="email"
        :value="form.email"
        type="email"
        readonly
        class="mt-1 block w-full rounded-md border-gray-300 bg-gray-100 text-gray-500 shadow-sm cursor-not-allowed"
      >
      <p v-if="errors.email" class="mt-2 text-sm text-danger-600">
        {{ errors.email[0] }}
      </p>
    </div>

    <div class="mt-4">
      <label for="password" class="block text-sm font-medium text-gray-700">
        Password
      </label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="new-password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
      <p v-if="errors.password" class="mt-2 text-sm text-danger-600">
        {{ errors.password[0] }}
      </p>
    </div>

    <div class="mt-4">
      <label for="password_confirmation" class="block text-sm font-medium text-gray-700">
        Confirm Password
      </label>
      <input
        id="password_confirmation"
        v-model="form.password_confirmation"
        type="password"
        autocomplete="new-password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
    </div>

    <div class="mt-4 flex items-center justify-end">
      <FormsFormButton
        type="submit"
        variant="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        Reset Password
      </FormsFormButton>
    </div>
  </form>
</template>
