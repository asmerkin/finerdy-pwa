<script setup lang="ts">
import { TrashIcon, KeyIcon, ClipboardDocumentIcon } from '@heroicons/vue/24/outline'

interface Token {
  id: number
  name: string
  last_four: string
  last_used_at: string | null
  created_at: string
}

interface NewToken {
  id: number
  name: string
  plain_text: string
  created_at: string
}

const { t } = useI18n()
const { post, del } = useApiMutation()

// Fetch tokens
const { data, pending, refresh } = await useApi<{
  tokens: Token[]
}>('/profile/api-tokens')

const tokens = computed(() => data.value?.tokens || [])

// Form state
const tokenName = ref('')
const isSubmitting = ref(false)
const errors = ref<Record<string, string[]>>({})

// Modal state
const showNewTokenModal = ref(false)
const newTokenData = ref<NewToken | null>(null)

// Revoke dialog state
const showRevokeDialog = ref(false)
const tokenToRevoke = ref<Token | null>(null)
const isRevoking = ref(false)

const createToken = async () => {
  if (!tokenName.value.trim()) return

  isSubmitting.value = true
  errors.value = {}

  try {
    const response = await post<{ token: NewToken }>('/profile/api-tokens', {
      name: tokenName.value,
    })

    newTokenData.value = response.token
    showNewTokenModal.value = true
    tokenName.value = ''
    refresh()
  }
  catch (error: any) {
    errors.value = error.data?.errors || {}
  }
  finally {
    isSubmitting.value = false
  }
}

const openRevokeDialog = (token: Token) => {
  tokenToRevoke.value = token
  showRevokeDialog.value = true
}

const handleRevoke = async () => {
  if (!tokenToRevoke.value) return

  isRevoking.value = true
  try {
    await del(`/profile/api-tokens/${tokenToRevoke.value.id}`)
    refresh()
  }
  catch (error) {
    console.error('Failed to revoke token:', error)
  }
  finally {
    isRevoking.value = false
    showRevokeDialog.value = false
    tokenToRevoke.value = null
  }
}

const copyToken = async () => {
  if (!newTokenData.value) return

  try {
    await navigator.clipboard.writeText(newTokenData.value.plain_text)
  }
  catch (error) {
    console.error('Failed to copy token:', error)
  }
}

const closeModal = () => {
  showNewTokenModal.value = false
  newTokenData.value = null
}

const formatDate = (dateString: string | null) => {
  if (!dateString) return t('apiTokens.never')
  return new Date(dateString).toLocaleDateString()
}
</script>

<template>
  <div class="space-y-6">
    <!-- Header -->
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <div>
        <h2 class="text-2xl font-bold text-gray-900">
          {{ t('apiTokens.title') }}
        </h2>
        <p class="mt-1 text-sm text-gray-600">
          {{ t('apiTokens.description') }}
        </p>
      </div>
    </div>

    <!-- Create Token Form -->
    <CommonCard :title="t('apiTokens.createNew')">
      <form class="space-y-4" @submit.prevent="createToken">
        <FormsInput
          v-model="tokenName"
          :label="t('apiTokens.tokenName')"
          :placeholder="t('apiTokens.tokenNamePlaceholder')"
          :error="errors.name?.[0]"
          required
        />
        <div class="flex justify-end">
          <FormsFormButton
            type="submit"
            variant="primary"
            :loading="isSubmitting"
            :disabled="isSubmitting || !tokenName.trim()"
          >
            {{ t('apiTokens.createToken') }}
          </FormsFormButton>
        </div>
      </form>
    </CommonCard>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <!-- Tokens List -->
    <CommonCard v-else :title="t('apiTokens.activeTokens')">
      <div v-if="tokens.length === 0" class="text-center py-8">
        <KeyIcon class="mx-auto h-12 w-12 text-gray-400" />
        <h3 class="mt-2 text-sm font-medium text-gray-900">{{ t('apiTokens.noTokens') }}</h3>
        <p class="mt-1 text-sm text-gray-500">
          {{ t('apiTokens.noTokensDescription') }}
        </p>
      </div>

      <!-- Desktop Table -->
      <div v-else class="hidden lg:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('apiTokens.name') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('apiTokens.token') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('apiTokens.lastUsed') }}
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('apiTokens.created') }}
              </th>
              <th scope="col" class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="token in tokens" :key="token.id" class="hover:bg-gray-50">
              <td class="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                {{ token.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                <code class="text-xs bg-gray-100 px-2 py-1 rounded">...{{ token.last_four }}</code>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(token.last_used_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {{ formatDate(token.created_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  type="button"
                  class="text-danger-600 hover:text-danger-900 inline-flex items-center gap-1 cursor-pointer"
                  @click="openRevokeDialog(token)"
                >
                  <TrashIcon class="h-4 w-4" />
                  {{ t('apiTokens.revoke') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Mobile Cards -->
      <div v-if="tokens.length > 0" class="lg:hidden space-y-4">
        <div
          v-for="token in tokens"
          :key="token.id"
          class="bg-white border border-gray-200 rounded-lg p-4"
        >
          <div class="flex items-start justify-between mb-3">
            <div class="flex-1">
              <h3 class="text-sm font-semibold text-gray-900">
                {{ token.name }}
              </h3>
              <code class="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded mt-1 inline-block">...{{ token.last_four }}</code>
            </div>
          </div>
          <div class="space-y-2 text-sm">
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('apiTokens.lastUsed') }}:</span>
              <span class="text-gray-900">{{ formatDate(token.last_used_at) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-500">{{ t('apiTokens.created') }}:</span>
              <span class="text-gray-900">{{ formatDate(token.created_at) }}</span>
            </div>
          </div>
          <div class="mt-4 pt-4 border-t border-gray-200 flex justify-end">
            <button
              type="button"
              class="text-danger-600 hover:text-danger-900 inline-flex items-center gap-1 text-sm font-medium cursor-pointer"
              @click="openRevokeDialog(token)"
            >
              <TrashIcon class="h-4 w-4" />
              {{ t('apiTokens.revoke') }}
            </button>
          </div>
        </div>
      </div>
    </CommonCard>

    <!-- New Token Modal -->
    <Teleport to="body">
      <div
        v-if="showNewTokenModal"
        class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        @click.self="closeModal"
      >
        <div class="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          <div class="flex items-center justify-between mb-4">
            <h3 class="text-lg font-semibold text-gray-900">
              {{ t('apiTokens.tokenCreated') }}
            </h3>
          </div>
          <div class="mb-4">
            <p class="text-sm text-gray-600 mb-3">
              {{ t('apiTokens.tokenWarning') }} <strong>{{ t('apiTokens.tokenWarningBold') }}</strong>
            </p>
            <div class="bg-gray-50 border border-gray-200 rounded-md p-3">
              <p class="text-xs font-medium text-gray-500 mb-1">
                {{ newTokenData?.name }}
              </p>
              <div class="flex items-center gap-2">
                <code class="flex-1 text-xs text-gray-900 break-all">
                  {{ newTokenData?.plain_text }}
                </code>
                <button
                  type="button"
                  class="p-2 text-gray-500 hover:text-gray-700 rounded-md hover:bg-gray-100 cursor-pointer"
                  :title="t('apiTokens.copyToken')"
                  @click="copyToken"
                >
                  <ClipboardDocumentIcon class="h-5 w-5" />
                </button>
              </div>
            </div>
          </div>
          <div class="flex justify-end">
            <FormsFormButton variant="primary" @click="closeModal">
              {{ t('common.close') }}
            </FormsFormButton>
          </div>
        </div>
      </div>
    </Teleport>

    <!-- Revoke Confirm Dialog -->
    <CommonConfirmDialog
      :open="showRevokeDialog"
      :title="t('apiTokens.revoke')"
      :message="t('apiTokens.revokeConfirm')"
      :confirm-text="t('apiTokens.revoke')"
      :cancel-text="t('common.cancel')"
      variant="danger"
      @confirm="handleRevoke"
      @cancel="showRevokeDialog = false"
    />
  </div>
</template>
