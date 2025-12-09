export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore()

  // If already authenticated, redirect to dashboard
  if (auth.isAuthenticated) {
    return navigateTo('/')
  }

  // Try to fetch user (maybe they have a valid session)
  const success = await auth.fetchUser()
  if (success) {
    return navigateTo('/')
  }
})
