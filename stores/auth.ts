import { defineStore } from 'pinia'
import type { User, Workspace, WorkspaceListItem } from '~/types'

export const useAuthStore = defineStore('auth', () => {
  const config = useRuntimeConfig()
  const apiBase = config.public.apiBase

  // State
  const user = ref<User | null>(null)
  const workspace = ref<Workspace | null>(null)
  const workspaces = ref<WorkspaceListItem[]>([])
  const isLoading = ref(false)
  const isAuthenticated = computed(() => !!user.value)

  // Get CSRF cookie from Sanctum
  async function getCsrfCookie() {
    await $fetch(`${apiBase}/sanctum/csrf-cookie`, {
      credentials: 'include',
    })
  }

  // Login
  async function login(email: string, password: string) {
    isLoading.value = true
    try {
      await getCsrfCookie()

      await $fetch(`${apiBase}/login`, {
        method: 'POST',
        credentials: 'include',
        body: { email, password },
      })

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
      await getCsrfCookie()

      await $fetch(`${apiBase}/register`, {
        method: 'POST',
        credentials: 'include',
        body: data,
      })

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
      await $fetch(`${apiBase}/logout`, {
        method: 'POST',
        credentials: 'include',
      })
    }
    finally {
      user.value = null
      workspace.value = null
      workspaces.value = []
      navigateTo('/login')
    }
  }

  // Fetch current user
  async function fetchUser() {
    try {
      const response = await $fetch<{
        user: User
        workspace: Workspace
        workspaces: WorkspaceListItem[]
      }>(`${apiBase}/api/user`, {
        credentials: 'include',
      })

      user.value = response.user
      workspace.value = response.workspace
      workspaces.value = response.workspaces

      return true
    }
    catch {
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
        credentials: 'include',
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
    isLoading,
    isAuthenticated,

    // Actions
    getCsrfCookie,
    login,
    register,
    logout,
    fetchUser,
    switchWorkspace,
  }
})
