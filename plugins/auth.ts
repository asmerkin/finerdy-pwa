export default defineNuxtPlugin(async (nuxtApp) => {
  // Only run on client side
  if (import.meta.client) {
    const auth = useAuthStore()

    // Initialize token from localStorage
    auth.initToken()

    // If we have a token, fetch the user data
    if (auth.token && !auth.user) {
      await auth.fetchUser()

      // Sync user's locale preference with i18n
      if (auth.user?.locale) {
        const i18n = nuxtApp.$i18n as any
        if (i18n && auth.user.locale !== i18n.locale.value) {
          i18n.setLocale(auth.user.locale)
        }
      }
    }

    // Watch for user changes to sync locale
    watch(() => auth.user?.locale, (newLocale) => {
      if (newLocale) {
        const i18n = nuxtApp.$i18n as any
        if (i18n && newLocale !== i18n.locale.value) {
          i18n.setLocale(newLocale)
        }
      }
    })
  }
})
