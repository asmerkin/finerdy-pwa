// Global middleware that runs on every route change (client-side only)
// This ensures auth state is initialized before route guards run
export default defineNuxtRouteMiddleware(async (to) => {
  // Only run on client
  if (import.meta.server) return

  const auth = useAuthStore()

  // Initialize token from localStorage if not already done
  if (!auth.token) {
    auth.initToken()
  }

  // Public pages that don't require auth check
  const publicPages = ['/login', '/register', '/forgot-password', '/reset-password']
  const isPublicPage = publicPages.some(page => to.path.startsWith(page))

  // Check if token is expired
  if (auth.token && auth.isTokenExpired()) {
    auth.handleTokenExpiration()
    if (!isPublicPage) {
      return navigateTo('/login?expired=1')
    }
  }

  // If going to a public page and already authenticated, redirect to home
  if (isPublicPage && auth.isAuthenticated) {
    return navigateTo('/')
  }

  // If going to a protected page and have token but no user, try to fetch user
  if (!isPublicPage && auth.token && !auth.user) {
    await auth.fetchUser()
  }

  // If going to a protected page and not authenticated, redirect to login
  if (!isPublicPage && !auth.isAuthenticated) {
    return navigateTo('/login')
  }

  // If authenticated but no workspace, redirect to onboarding (except if already there)
  if (auth.isAuthenticated && !auth.workspace && to.path !== '/onboarding') {
    return navigateTo('/onboarding')
  }

  // If on onboarding but has workspace, redirect to home
  if (auth.isAuthenticated && auth.workspace && to.path === '/onboarding') {
    return navigateTo('/')
  }
})
