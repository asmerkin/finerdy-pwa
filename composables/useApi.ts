import type { UseFetchOptions } from 'nuxt/app'

export function useApi<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {}
) {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  // Build the full URL with workspace
  const buildUrl = () => {
    const baseUrl = typeof url === 'function' ? url() : url

    // If it's already an absolute URL, return it
    if (baseUrl.startsWith('http')) {
      return baseUrl
    }

    // If it starts with /api/workspaces, use as-is
    if (baseUrl.startsWith('/api/workspaces')) {
      return `${config.public.apiBase}${baseUrl}`
    }

    // Otherwise, prepend the workspace path
    const workspaceId = auth.workspace?.id
    if (workspaceId && !baseUrl.includes('/workspaces/')) {
      return `${config.public.apiBase}/api/workspaces/${workspaceId}${baseUrl}`
    }

    return `${config.public.apiBase}${baseUrl}`
  }

  return useFetch<T>(buildUrl, {
    credentials: 'include',
    ...options,
    // Merge headers
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      ...options.headers,
    },
  })
}

// Shorthand for API mutations
export function useApiMutation() {
  const config = useRuntimeConfig()
  const auth = useAuthStore()

  const buildUrl = (path: string) => {
    if (path.startsWith('http')) {
      return path
    }

    const workspaceId = auth.workspace?.id
    if (workspaceId && !path.includes('/workspaces/') && !path.startsWith('/login') && !path.startsWith('/register')) {
      return `${config.public.apiBase}/api/workspaces/${workspaceId}${path}`
    }

    return `${config.public.apiBase}${path}`
  }

  const post = async <T>(path: string, body?: any): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'POST',
      credentials: 'include',
      body,
    })
  }

  const put = async <T>(path: string, body?: any): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'PUT',
      credentials: 'include',
      body,
    })
  }

  const del = async <T>(path: string): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'DELETE',
      credentials: 'include',
    })
  }

  return {
    post,
    put,
    del,
  }
}
