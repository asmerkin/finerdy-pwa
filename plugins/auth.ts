export default defineNuxtPlugin(async () => {
  // Only run on client side
  if (import.meta.client) {
    const auth = useAuthStore()

    // Initialize token from localStorage
    auth.initToken()

    // If we have a token, fetch the user data
    if (auth.token && !auth.user) {
      await auth.fetchUser()
    }
  }
})
