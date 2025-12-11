<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { t } = useI18n()
const auth = useAuthStore()
const route = useRoute()
const toast = useToastStore()

const form = reactive({
  email: '',
  password: '',
  remember: false,
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

// Show toast if session expired
watch(() => route.query.expired, (expired) => {
  if (expired === '1') {
    toast.warning(t('auth.sessionExpired'))
  }
}, { immediate: true })

// Show success message if redirected from password reset
const status = computed(() => {
  if (route.query.reset === 'success') {
    return 'Your password has been reset successfully.'
  }
  return ''
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  const result = await auth.login(form.email, form.password, form.remember)

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
  <div>
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

    <div class="mt-4">
      <label for="password" class="block text-sm font-medium text-gray-700">
        {{ t('auth.password') }}
      </label>
      <input
        id="password"
        v-model="form.password"
        type="password"
        autocomplete="current-password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
      <p v-if="errors.password" class="mt-2 text-sm text-danger-600">
        {{ errors.password[0] }}
      </p>
    </div>

    <div class="mt-4 block">
      <label class="flex items-center">
        <input
          v-model="form.remember"
          type="checkbox"
          class="rounded border-gray-300 text-primary-600 shadow-sm focus:ring-primary-500"
        >
        <span class="ms-2 text-sm text-gray-600">{{ t('auth.rememberMe') }}</span>
      </label>
    </div>

      <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
        <NuxtLink
          to="/forgot-password"
          class="text-center rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
        >
          {{ t('auth.forgotPassword') }}
        </NuxtLink>

        <FormsFormButton
          type="submit"
          variant="primary"
          :loading="isSubmitting"
          :disabled="isSubmitting"
        >
          {{ t('auth.login') }}
        </FormsFormButton>
      </div>
    </form>
  </div>
</template>
