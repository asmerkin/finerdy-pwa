<script setup lang="ts">
const { t, locale, setLocale } = useI18n()
const auth = useAuthStore()
const { put } = useApiMutation()

definePageMeta({
  middleware: 'auth',
})

// Profile form
const profileForm = reactive({
  name: auth.user?.name || '',
  email: auth.user?.email || '',
  timezone: auth.user?.timezone || 'UTC',
  locale: auth.user?.locale || locale.value,
})

// Watch for auth.user changes to populate form
watch(() => auth.user, (user) => {
  if (user) {
    profileForm.name = user.name
    profileForm.email = user.email
    profileForm.timezone = user.timezone || 'UTC'
    profileForm.locale = user.locale || locale.value
    // Sync locale with i18n
    if (user.locale && user.locale !== locale.value) {
      setLocale(user.locale)
    }
  }
}, { immediate: true })

// Watch for locale changes in the form to update i18n
watch(() => profileForm.locale, (newLocale) => {
  if (newLocale && newLocale !== locale.value) {
    setLocale(newLocale)
  }
})

const profileErrors = ref<Record<string, string[]>>({})
const isProfileSubmitting = ref(false)
const profileSaved = ref(false)

// Password form
const passwordForm = reactive({
  current_password: '',
  password: '',
  password_confirmation: '',
})

const passwordErrors = ref<Record<string, string[]>>({})
const isPasswordSubmitting = ref(false)
const passwordSaved = ref(false)

const timezones = Intl.supportedValuesOf('timeZone').filter(tz => !tz.startsWith('Etc/'))

const locales = [
  { code: 'en', name: 'English' },
  { code: 'es', name: 'Espa\u00f1ol' },
]

const handleProfileSubmit = async () => {
  isProfileSubmitting.value = true
  profileErrors.value = {}
  profileSaved.value = false

  try {
    const response = await put<{ user: any }>('/profile', profileForm)
    // Update auth store with new user data
    if (response.user) {
      auth.user = response.user
    }
    profileSaved.value = true
    setTimeout(() => {
      profileSaved.value = false
    }, 3000)
  }
  catch (error: any) {
    profileErrors.value = error.data?.errors || {}
  }
  finally {
    isProfileSubmitting.value = false
  }
}

const handlePasswordSubmit = async () => {
  isPasswordSubmitting.value = true
  passwordErrors.value = {}
  passwordSaved.value = false

  try {
    await put('/profile/password', passwordForm)
    passwordForm.current_password = ''
    passwordForm.password = ''
    passwordForm.password_confirmation = ''
    passwordSaved.value = true
    setTimeout(() => {
      passwordSaved.value = false
    }, 3000)
  }
  catch (error: any) {
    passwordErrors.value = error.data?.errors || {}
  }
  finally {
    isPasswordSubmitting.value = false
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('profile.title') }}
      </h2>
    </div>

    <div class="space-y-6">
      <!-- Profile Information -->
      <CommonCard :title="t('profile.information')">
        <form class="space-y-6" @submit.prevent="handleProfileSubmit">
          <p class="text-sm text-gray-600">
            {{ t('profile.informationDescription') }}
          </p>

          <FormsInput
            v-model="profileForm.name"
            :label="t('profile.name')"
            :error="profileErrors.name?.[0]"
            required
          />

          <FormsInput
            v-model="profileForm.email"
            type="email"
            :label="t('profile.email')"
            :error="profileErrors.email?.[0]"
            required
          />

          <FormsSelect
            v-model="profileForm.timezone"
            :label="t('profile.timezone')"
            :options="timezones.map(tz => ({ value: tz, label: tz }))"
            :error="profileErrors.timezone?.[0]"
          />

          <FormsSelect
            v-model="profileForm.locale"
            :label="t('profile.language')"
            :options="locales.map(l => ({ value: l.code, label: l.name }))"
            :error="profileErrors.locale?.[0]"
          />

          <div class="flex items-center gap-4">
            <FormsFormButton
              type="submit"
              :loading="isProfileSubmitting"
              :disabled="isProfileSubmitting"
            >
              {{ t('common.save') }}
            </FormsFormButton>

            <Transition
              enter-active-class="transition ease-in-out"
              enter-from-class="opacity-0"
              leave-active-class="transition ease-in-out"
              leave-to-class="opacity-0"
            >
              <p v-if="profileSaved" class="text-sm text-green-600">
                {{ t('profile.saved') }}
              </p>
            </Transition>
          </div>
        </form>
      </CommonCard>

      <!-- Update Password -->
      <CommonCard :title="t('profile.updatePassword')">
        <form class="space-y-6" @submit.prevent="handlePasswordSubmit">
          <p class="text-sm text-gray-600">
            {{ t('profile.updatePasswordDescription') }}
          </p>

          <FormsInput
            v-model="passwordForm.current_password"
            type="password"
            :label="t('auth.currentPassword')"
            :error="passwordErrors.current_password?.[0]"
            autocomplete="current-password"
          />

          <FormsInput
            v-model="passwordForm.password"
            type="password"
            :label="t('auth.newPassword')"
            :error="passwordErrors.password?.[0]"
            autocomplete="new-password"
          />

          <FormsInput
            v-model="passwordForm.password_confirmation"
            type="password"
            :label="t('auth.confirmPassword')"
            :error="passwordErrors.password_confirmation?.[0]"
            autocomplete="new-password"
          />

          <div class="flex items-center gap-4">
            <FormsFormButton
              type="submit"
              :loading="isPasswordSubmitting"
              :disabled="isPasswordSubmitting"
            >
              {{ t('common.save') }}
            </FormsFormButton>

            <Transition
              enter-active-class="transition ease-in-out"
              enter-from-class="opacity-0"
              leave-active-class="transition ease-in-out"
              leave-to-class="opacity-0"
            >
              <p v-if="passwordSaved" class="text-sm text-green-600">
                {{ t('profile.saved') }}
              </p>
            </Transition>
          </div>
        </form>
      </CommonCard>
    </div>
  </div>
</template>
