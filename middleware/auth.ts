export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore()

  // Skip auth check for public pages
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  if (publicPages.some(page => to.path.startsWith(page))) {
    // If already authenticated, redirect to dashboard
    if (auth.isAuthenticated) {
      return navigateTo('/')
    }
    return
  }

  // If not authenticated, try to fetch user
  if (!auth.isAuthenticated) {
    const success = await auth.fetchUser()
    if (!success) {
      return navigateTo('/login')
    }
  }

  // Check if user has a workspace
  if (!auth.workspace && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }
})
