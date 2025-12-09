<script setup lang="ts">
import { PlusIcon, PencilIcon, TrashIcon, UsersIcon } from '@heroicons/vue/24/outline'

const { t } = useI18n()
const auth = useAuthStore()
const { del } = useApiMutation()

definePageMeta({
  middleware: 'auth',
})

interface Workspace {
  id: number
  name: string
  slug: string
  default_currency: string
  members_count: number
  role: string
  is_owner: boolean
  is_current: boolean
}

const { data, pending, refresh } = await useApi<{ workspaces: Workspace[] }>('/workspaces')
const workspaces = computed(() => data.value?.workspaces || [])

const switchWorkspace = async (workspaceId: number) => {
  const result = await auth.switchWorkspace(workspaceId)
  if (result.success) {
    refresh()
  }
}

const deleteWorkspace = async (workspace: Workspace) => {
  if (!confirm(t('workspaces.deleteConfirm', { name: workspace.name }))) {
    return
  }

  try {
    await del(`/workspaces/${workspace.id}`)
    await auth.fetchUser()
    refresh()
  }
  catch (error) {
    console.error('Failed to delete workspace:', error)
  }
}
</script>

<template>
  <div class="space-y-6">
    <div class="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
      <h2 class="text-2xl font-bold text-gray-900">
        {{ t('workspaces.title') }}
      </h2>
      <FormsIconButton
        to="/workspaces/create"
        :icon="PlusIcon"
        :label="t('workspaces.new')"
        variant="primary"
      />
    </div>

    <!-- Loading state -->
    <div v-if="pending" class="flex justify-center py-12">
      <CommonLoadingSpinner size="lg" />
    </div>

    <CommonCard v-else-if="workspaces.length === 0" :title="t('workspaces.empty')">
      <p class="text-gray-600">
        {{ t('workspaces.emptyDescription') }}
      </p>
      <div class="mt-4">
        <FormsFormButton to="/workspaces/create">
          {{ t('workspaces.createFirst') }}
        </FormsFormButton>
      </div>
    </CommonCard>

    <CommonCard v-else>
      <!-- Mobile Cards -->
      <div class="lg:hidden space-y-4">
        <div
          v-for="workspace in workspaces"
          :key="workspace.id"
          class="bg-white border border-gray-200 rounded-lg overflow-hidden"
        >
          <div
            :class="[
              'p-4 space-y-3',
              !workspace.is_current ? 'cursor-pointer hover:bg-gray-50 transition-colors' : ''
            ]"
            @click="!workspace.is_current && switchWorkspace(workspace.id)"
          >
            <div class="flex items-start justify-between">
              <div class="flex-1">
                <div class="flex items-center gap-2">
                  <h3 class="text-lg font-semibold text-gray-900">
                    {{ workspace.name }}
                  </h3>
                  <CommonBadge v-if="workspace.is_current" variant="success">
                    {{ t('common.current') }}
                  </CommonBadge>
                </div>
                <div class="mt-1 space-y-1 text-sm text-gray-600">
                  <div>{{ t('workspaces.defaultCurrency') }}: {{ workspace.default_currency }}</div>
                  <div class="flex items-center gap-1">
                    <UsersIcon class="h-4 w-4" />
                    {{ workspace.members_count }} {{ workspace.members_count === 1 ? t('workspaces.member') : t('workspaces.membersPlural') }}
                  </div>
                  <CommonBadge :variant="workspace.is_owner ? 'primary' : 'secondary'">
                    {{ workspace.is_owner ? t('workspaces.owner') : workspace.role }}
                  </CommonBadge>
                </div>
              </div>
            </div>
          </div>

          <div v-if="workspace.is_owner" class="flex gap-2 px-4 pb-4 pt-3 border-t border-gray-200">
            <FormsIconButton
              :to="`/workspaces/${workspace.id}/edit`"
              :icon="PencilIcon"
              :label="t('common.edit')"
              variant="secondary"
              size="sm"
            />
            <FormsIconButton
              :icon="TrashIcon"
              :label="t('common.delete')"
              variant="danger"
              size="sm"
              @click.stop="deleteWorkspace(workspace)"
            />
          </div>
        </div>
      </div>

      <!-- Desktop Table -->
      <div class="hidden lg:block overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-200">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('common.name') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('workspaces.defaultCurrency') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('workspaces.members') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('workspaces.role') }}
              </th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('common.status') }}
              </th>
              <th class="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                {{ t('common.actions') }}
              </th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr
              v-for="workspace in workspaces"
              :key="workspace.id"
              :class="[
                'hover:bg-gray-50',
                !workspace.is_current ? 'cursor-pointer' : ''
              ]"
              @click="!workspace.is_current && switchWorkspace(workspace.id)"
            >
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="text-sm font-medium text-gray-900">
                  {{ workspace.name }}
                </div>
                <div class="text-xs text-gray-500">
                  {{ workspace.slug }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ workspace.default_currency }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <div class="flex items-center gap-1 text-sm text-gray-900">
                  <UsersIcon class="h-4 w-4 text-gray-400" />
                  {{ workspace.members_count }}
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <CommonBadge :variant="workspace.is_owner ? 'primary' : 'secondary'">
                  {{ workspace.is_owner ? t('workspaces.owner') : workspace.role }}
                </CommonBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <CommonBadge v-if="workspace.is_current" variant="success">
                  {{ t('common.current') }}
                </CommonBadge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium" @click.stop>
                <div v-if="workspace.is_owner" class="flex justify-end gap-2">
                  <FormsIconButton
                    :to="`/workspaces/${workspace.id}/edit`"
                    :icon="PencilIcon"
                    :label="t('common.edit')"
                    variant="secondary"
                    size="sm"
                  />
                  <FormsIconButton
                    :icon="TrashIcon"
                    :label="t('common.delete')"
                    variant="danger"
                    size="sm"
                    @click="deleteWorkspace(workspace)"
                  />
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </CommonCard>
  </div>
</template>
