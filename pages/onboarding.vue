<script setup lang="ts">
definePageMeta({
  layout: 'auth',
  middleware: ['auth'],
})

const auth = useAuthStore()
const config = useRuntimeConfig()
const apiBase = config.public.apiBase

const form = ref({
  name: '',
  default_currency: 'USD',
})

const errors = ref<Record<string, string[]>>({})
const isSubmitting = ref(false)

const currencies = [
  { code: 'USD', label: 'USD - US Dollar ($)' },
  { code: 'EUR', label: 'EUR - Euro (\u20ac)' },
  { code: 'GBP', label: 'GBP - British Pound (\u00a3)' },
  { code: 'ARS', label: 'ARS - Argentine Peso ($)' },
  { code: 'MXN', label: 'MXN - Mexican Peso ($)' },
  { code: 'BRL', label: 'BRL - Brazilian Real (R$)' },
  { code: 'CLP', label: 'CLP - Chilean Peso ($)' },
  { code: 'COP', label: 'COP - Colombian Peso ($)' },
]

async function createWorkspace() {
  isSubmitting.value = true
  errors.value = {}

  try {
    await $fetch(`${apiBase}/api/workspaces`, {
      method: 'POST',
      credentials: 'include',
      body: form.value,
    })

    // Refresh user data to get the new workspace
    await auth.fetchUser()

    // Redirect to dashboard
    navigateTo('/')
  }
  catch (error: any) {
    errors.value = error.data?.errors || { name: ['Failed to create workspace'] }
  }
  finally {
    isSubmitting.value = false
  }
}
</script>

<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <div>
        <h2 class="mt-6 text-center text-3xl font-bold text-gray-900">
          Welcome to Finerdy
        </h2>
        <p class="mt-2 text-center text-sm text-gray-600">
          Let's create your first workspace to get started
        </p>
      </div>

      <form class="mt-8 space-y-6" @submit.prevent="createWorkspace">
        <div class="space-y-4">
          <!-- Workspace Name -->
          <div>
            <label for="name" class="block text-sm font-medium text-gray-700">
              Workspace Name
            </label>
            <input
              id="name"
              v-model="form.name"
              type="text"
              required
              placeholder="My Finances"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
            <p v-if="errors.name" class="mt-1 text-sm text-danger-600">
              {{ errors.name[0] }}
            </p>
          </div>

          <!-- Default Currency -->
          <div>
            <label for="currency" class="block text-sm font-medium text-gray-700">
              Default Currency
            </label>
            <select
              id="currency"
              v-model="form.default_currency"
              class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary-500 focus:border-primary-500 sm:text-sm"
            >
              <option v-for="currency in currencies" :key="currency.code" :value="currency.code">
                {{ currency.label }}
              </option>
            </select>
            <p class="mt-1 text-xs text-gray-500">
              This cannot be changed later
            </p>
            <p v-if="errors.default_currency" class="mt-1 text-sm text-danger-600">
              {{ errors.default_currency[0] }}
            </p>
          </div>
        </div>

        <div>
          <button
            type="submit"
            :disabled="isSubmitting"
            class="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span v-if="isSubmitting">Creating...</span>
            <span v-else>Create Workspace</span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
