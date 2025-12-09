// Named auth middleware for pages that explicitly declare it
// The global middleware (01.auth-init.global.ts) already handles auth logic
// This exists as a no-op to satisfy definePageMeta({ middleware: 'auth' })
export default defineNuxtRouteMiddleware(() => {
  // Auth is handled by global middleware
})
