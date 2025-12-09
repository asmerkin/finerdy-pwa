<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const auth = useAuthStore()

const form = reactive({
  email: '',
  password: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  const result = await auth.login(form.email, form.password)

  if (result.success) {
    navigateTo('/')
  }
  else {
    errors.value = result.errors || {}
  }

  isSubmitting.value = false
}
</script>

<template>
  <CommonCard>
    <form class="space-y-6" @submit.prevent="handleSubmit">
      <div>
        <label for="email" class="block text-sm font-medium text-gray-700">
          Email
        </label>
        <input
          id="email"
          v-model="form.email"
          type="email"
          autocomplete="email"
          required
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none sm:text-sm"
        >
        <p v-if="errors.email" class="mt-1 text-sm text-danger-600">
          {{ errors.email[0] }}
        </p>
      </div>

      <div>
        <label for="password" class="block text-sm font-medium text-gray-700">
          Password
        </label>
        <input
          id="password"
          v-model="form.password"
          type="password"
          autocomplete="current-password"
          required
          class="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary-500 focus:ring-primary-500 focus:outline-none sm:text-sm"
        >
        <p v-if="errors.password" class="mt-1 text-sm text-danger-600">
          {{ errors.password[0] }}
        </p>
      </div>

      <div class="flex items-center justify-between">
        <NuxtLink
          to="/forgot-password"
          class="text-sm font-medium text-primary-600 hover:text-primary-500"
        >
          Forgot your password?
        </NuxtLink>
      </div>

      <FormsFormButton
        type="submit"
        variant="primary"
        size="lg"
        class="w-full"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        Sign in
      </FormsFormButton>

      <p class="text-center text-sm text-gray-600">
        Don't have an account?
        <NuxtLink to="/register" class="font-medium text-primary-600 hover:text-primary-500">
          Sign up
        </NuxtLink>
      </p>
    </form>
  </CommonCard>
</template>
