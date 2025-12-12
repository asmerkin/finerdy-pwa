import type { UseFetchOptions } from 'nuxt/app'

// Serialize params with PHP-style array notation (e.g., accounts[]=1&accounts[]=2)
function serializeParams(params: Record<string, any>): Record<string, any> {
  const result: Record<string, any> = {}
  for (const [key, value] of Object.entries(params)) {
    if (Array.isArray(value)) {
      // Convert array to PHP-style notation: key[] for each value
      result[`${key}[]`] = value
    }
    else {
      result[key] = value
    }
  }
  return result
}

export function useApi<T>(
  url: string | (() => string),
  options: UseFetchOptions<T> = {},
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

    // These paths should NOT be prefixed with workspace
    const nonWorkspacePaths = ['/login', '/register', '/profile', '/workspaces', '/user', '/workspace/switch', '/logout', '/dashboard']
    const shouldPrefixWorkspace = auth.workspace?.id
      && !baseUrl.includes('/workspaces/')
      && !nonWorkspacePaths.some(p => baseUrl.startsWith(p))

    if (shouldPrefixWorkspace) {
      return `${config.public.apiBase}/api/workspaces/${auth.workspace.id}${baseUrl}`
    }

    // Add /api prefix for non-workspace paths
    return `${config.public.apiBase}/api${baseUrl}`
  }

  // Build headers with Bearer token and PWA API Key
  const buildHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    // Merge custom headers from options
    if (options.headers) {
      Object.assign(headers, options.headers)
    }

    // Add PWA API Key for backend authentication
    if (config.public.pwaApiKey) {
      headers['X-PWA-Key'] = config.public.pwaApiKey
    }

    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }
    return headers
  }

  // Process query params to serialize arrays for PHP (Laravel)
  const processedOptions = { ...options }
  if (options.query) {
    processedOptions.query = computed(() => {
      const rawQuery = toValue(options.query)
      return rawQuery ? serializeParams(rawQuery) : rawQuery
    })
  }

  return useFetch<T>(buildUrl, {
    ...processedOptions,
    headers: buildHeaders(),
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
    // These paths should NOT be prefixed with workspace
    const nonWorkspacePaths = ['/login', '/register', '/profile', '/workspaces', '/user', '/workspace/switch', '/logout', '/dashboard']
    const shouldPrefixWorkspace = workspaceId
      && !path.includes('/workspaces/')
      && !nonWorkspacePaths.some(p => path.startsWith(p))

    if (shouldPrefixWorkspace) {
      return `${config.public.apiBase}/api/workspaces/${workspaceId}${path}`
    }

    // Add /api prefix for non-workspace paths
    return `${config.public.apiBase}/api${path}`
  }

  // Build headers with Bearer token and PWA API Key
  const buildHeaders = () => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }

    // Add PWA API Key for backend authentication
    if (config.public.pwaApiKey) {
      headers['X-PWA-Key'] = config.public.pwaApiKey
    }

    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }
    return headers
  }

  const post = async <T>(path: string, body?: any): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'POST',
      headers: buildHeaders(),
      body,
    })
  }

  const put = async <T>(path: string, body?: any): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'PUT',
      headers: buildHeaders(),
      body,
    })
  }

  // POST with FormData (for file uploads)
  // Uses POST with _method=PUT for Laravel compatibility with file uploads
  const putForm = async <T>(path: string, formData: FormData): Promise<T> => {
    // Add _method field for Laravel to interpret as PUT
    formData.append('_method', 'PUT')

    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    // Add PWA API Key for backend authentication
    if (config.public.pwaApiKey) {
      headers['X-PWA-Key'] = config.public.pwaApiKey
    }

    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }

    return await $fetch<T>(buildUrl(path), {
      method: 'POST',
      headers,
      body: formData,
    })
  }

  // POST with FormData (for file uploads on create)
  const postForm = async <T>(path: string, formData: FormData): Promise<T> => {
    const headers: Record<string, string> = {
      'Accept': 'application/json',
    }

    // Add PWA API Key for backend authentication
    if (config.public.pwaApiKey) {
      headers['X-PWA-Key'] = config.public.pwaApiKey
    }

    if (auth.token) {
      headers.Authorization = `Bearer ${auth.token}`
    }

    return await $fetch<T>(buildUrl(path), {
      method: 'POST',
      headers,
      body: formData,
    })
  }

  const del = async <T>(path: string): Promise<T> => {
    return await $fetch<T>(buildUrl(path), {
      method: 'DELETE',
      headers: buildHeaders(),
    })
  }

  return {
    post,
    put,
    putForm,
    postForm,
    del,
  }
}
