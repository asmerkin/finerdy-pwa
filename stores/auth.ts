import { defineStore } from 'pinia'
import type { User, Workspace, WorkspaceListItem } from '~/types'

const TOKEN_KEY = 'finerdy_token'
const TOKEN_EXPIRES_KEY = 'finerdy_token_expires'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // State
  const user = ref<User | null>(null)
  const workspace = ref<Workspace | null>(null)
  const workspaces = ref<WorkspaceListItem[]>([])
  const token = ref<string | null>(null)
  const tokenExpiresAt = ref<string | null>(null)
  const isLoading = ref(false)
  const isAuthenticated = computed(() => !!token.value && !!user.value)

  // Initialize token from localStorage
  function initToken() {
    if (import.meta.client) {
      token.value = localStorage.getItem(TOKEN_KEY)
      tokenExpiresAt.value = localStorage.getItem(TOKEN_EXPIRES_KEY)
    }
  }

  // Save token to localStorage
  function setToken(newToken: string | null, expiresAt?: string | null) {
    token.value = newToken
    tokenExpiresAt.value = expiresAt ?? null
    if (import.meta.client) {
      if (newToken) {
        localStorage.setItem(TOKEN_KEY, newToken)
        if (expiresAt) {
          localStorage.setItem(TOKEN_EXPIRES_KEY, expiresAt)
        }
      } else {
        localStorage.removeItem(TOKEN_KEY)
        localStorage.removeItem(TOKEN_EXPIRES_KEY)
      }
    }
  }

  // Check if token is expired
  function isTokenExpired(): boolean {
    if (!tokenExpiresAt.value) return false
    return new Date(tokenExpiresAt.value) <= new Date()
  }

  // Clear auth state and redirect to login with optional message
  function handleTokenExpiration() {
    setToken(null)
    user.value = null
    workspace.value = null
    workspaces.value = []
    return true
  }

  // Build headers with Bearer token
  function buildHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
    if (token.value) {
      headers['Authorization'] = `Bearer ${token.value}`
    }
    return headers
  }

  // Login
  async function login(email: string, password: string, remember: boolean = false) {
    isLoading.value = true
    try {
      const api = useApiMutation()
      const response = await api.post<{
        token: string
        expires_at: string
        user: { id: number; name: string; email: string }
      }>('/login', { email, password, remember })

      setToken(response.token, response.expires_at)
      await fetchUser()
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        errors: error.data?.errors || { email: ['Invalid credentials'] },
      }
    }
    finally {
      isLoading.value = false
    }
  }

  // Register
  async function register(data: {
    name: string
    email: string
    password: string
    password_confirmation: string
  }) {
    isLoading.value = true
    try {
      const api = useApiMutation()
      const response = await api.post<{
        token: string
        expires_at: string
        user: { id: number; name: string; email: string }
      }>('/register', data)

      setToken(response.token, response.expires_at)
      await fetchUser()
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        errors: error.data?.errors || {},
      }
    }
    finally {
      isLoading.value = false
    }
  }

  // Logout
  async function logout() {
    try {
      await $fetch(`${apiBase}/api/logout`, {
        method: 'POST',
        headers: buildHeaders(),
      })
    }
    catch {
      // Ignore errors - token might already be invalid
    }
    finally {
      setToken(null)
      user.value = null
      workspace.value = null
      workspaces.value = []
      navigateTo('/login')
    }
  }

  // Fetch current user
  async function fetchUser() {
    if (!token.value) {
      return false
    }

    try {
      const response = await $fetch<{
        user: User
        workspace: Workspace
        workspaces: WorkspaceListItem[]
      }>(`${apiBase}/api/user`, {
        headers: buildHeaders(),
      })

      user.value = response.user
      workspace.value = response.workspace
      workspaces.value = response.workspaces

      return true
    }
    catch {
      // Token is invalid, clear it
      setToken(null)
      user.value = null
      workspace.value = null
      workspaces.value = []
      return false
    }
  }

  // Switch workspace
  async function switchWorkspace(workspaceId: number) {
    try {
      await $fetch(`${apiBase}/api/workspace/switch`, {
        method: 'POST',
        headers: buildHeaders(),
        body: { workspace_id: workspaceId },
      })

      await fetchUser()
      return { success: true }
    }
    catch (error: any) {
      return {
        success: false,
        message: error.data?.message || 'Failed to switch workspace',
      }
    }
  }

  return {
    // State
    user,
    workspace,
    workspaces,
    token,
    tokenExpiresAt,
    isLoading,
    isAuthenticated,

    // Actions
    initToken,
    setToken,
    buildHeaders,
    login,
    register,
    logout,
    fetchUser,
    switchWorkspace,
    isTokenExpired,
    handleTokenExpiration,
  }
})
