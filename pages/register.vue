<script setup lang="ts">
definePageMeta({
  layout: 'auth',
})

const { t, locale } = useI18n()
const auth = useAuthStore()
const route = useRoute()

const form = reactive({
  name: '',
  email: '',
  password: '',
  password_confirmation: '',
  token: '',
  locale: '',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)
const isEmailFromUrl = ref(false)

// Precargar datos de la URL
onMounted(() => {
  // Precargar email si viene en la URL
  if (route.query.email) {
    form.email = route.query.email as string
    isEmailFromUrl.value = true
  }

  // Guardar token si viene en la URL
  if (route.query.token) {
    form.token = route.query.token as string
  }

  // Guardar y configurar locale si viene en la URL
  if (route.query.locale) {
    const urlLocale = route.query.locale as string
    form.locale = urlLocale
    // Validar que el locale sea válido antes de asignarlo
    if (['en', 'es'].includes(urlLocale)) {
      locale.value = urlLocale as 'en' | 'es'
    }
  }
})

const handleSubmit = async () => {
  isSubmitting.value = true
  errors.value = {}

  const result = await auth.register(form)

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
  <form @submit.prevent="handleSubmit">
    <div>
      <label for="name" class="block text-sm font-medium text-gray-700">
        {{ t('auth.name') }}
      </label>
      <input
        id="name"
        v-model="form.name"
        type="text"
        autocomplete="name"
        required
        autofocus
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
      <p v-if="errors.name" class="mt-2 text-sm text-danger-600">
        {{ errors.name[0] }}
      </p>
    </div>

    <div class="mt-4">
      <label for="email" class="block text-sm font-medium text-gray-700">
        {{ t('auth.email') }}
      </label>
      <input
        id="email"
        v-model="form.email"
        type="email"
        autocomplete="username"
        required
        :readonly="isEmailFromUrl"
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
        :class="{ 'bg-gray-100 cursor-not-allowed': isEmailFromUrl }"
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
        {{ t('auth.confirmPassword') }}
      </label>
      <input
        id="password_confirmation"
        v-model="form.password_confirmation"
        type="password"
        autocomplete="new-password"
        required
        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-primary-500 focus:ring-primary-500"
      >
      <p v-if="errors.password_confirmation" class="mt-2 text-sm text-danger-600">
        {{ errors.password_confirmation[0] }}
      </p>
    </div>

    <div class="mt-4 flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between">
      <NuxtLink
        to="/login"
        class="text-center rounded-md text-sm text-gray-600 underline hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2"
      >
        {{ t('auth.alreadyRegistered') }}
      </NuxtLink>

      <FormsFormButton
        type="submit"
        variant="primary"
        :loading="isSubmitting"
        :disabled="isSubmitting"
      >
        {{ t('auth.register') }}
      </FormsFormButton>
    </div>
  </form>
</template>
