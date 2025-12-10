<script setup lang="ts">
import {
  HomeIcon,
  BanknotesIcon,
  DocumentTextIcon,
  CogIcon,
  ChevronDownIcon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
  UserCircleIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  CalculatorIcon,
} from '@heroicons/vue/24/outline'

const route = useRoute()
const auth = useAuthStore()
const ui = useUiStore()

const isSettingsOpen = ref(false)

// Check if current route is in settings
const isInSettings = computed(() => {
  const path = route.path
  return path.startsWith('/accounts') ||
    path.startsWith('/categories') ||
    path.startsWith('/workspaces') ||
    path.startsWith('/profile/api-tokens')
})

// Open settings if we're in a settings page
watchEffect(() => {
  if (isInSettings.value) {
    isSettingsOpen.value = true
  }
})

const toggleSettings = () => {
  isSettingsOpen.value = !isSettingsOpen.value
}

const isActive = (path: string) => {
  if (path === '/') {
    return route.path === '/'
  }
  return route.path.startsWith(path)
}

const mainNavigation = computed(() => [
  { name: 'Dashboard', to: '/', icon: HomeIcon, active: isActive('/') && route.path === '/' },
])

const transactionNavigation = computed(() => [
  { name: 'Transacciones', to: '/transactions', icon: BanknotesIcon, active: isActive('/transactions') },
  { name: 'Presupuestos', to: '/budgets', icon: CalculatorIcon, active: isActive('/budgets') },
])

const reportsNavigation = computed(() => [
  { name: 'Estado Patrimonial', to: '/reports/balance-sheet', icon: DocumentTextIcon, active: isActive('/reports/balance-sheet') },
  { name: 'Estado de Resultados', to: '/reports/income-statement', icon: DocumentTextIcon, active: isActive('/reports/income-statement') },
  { name: 'Presupuestos', to: '/budgets/reports', icon: CalculatorIcon, active: isActive('/budgets/reports') },
])

const settingsNavigation = computed(() => [
  { name: 'Workspaces', to: '/workspaces', active: isActive('/workspaces') },
  { name: 'Cuentas', to: '/accounts', active: isActive('/accounts') },
  { name: 'Categorías', to: '/categories', active: isActive('/categories') },
  { name: 'API Tokens', to: '/profile/api-tokens', active: isActive('/profile/api-tokens') },
])

const handleNavClick = () => {
  ui.closeSidebar()
}

const switchWorkspace = async (event: Event) => {
  const target = event.target as HTMLSelectElement
  const workspaceId = parseInt(target.value)
  await auth.switchWorkspace(workspaceId)
}

const logout = async () => {
  await auth.logout()
}

// Gravatar URL
const gravatarUrl = computed(() => {
  if (!auth.user?.email) return null
  const hash = auth.user.email.trim().toLowerCase()
  // Simple hash placeholder - in production you'd use a proper MD5 hash
  return `https://www.gravatar.com/avatar/${hash}?s=80&d=mp`
})
</script>

<template>
  <!-- Mobile backdrop -->
  <div
    v-if="ui.isSidebarOpen"
    class="fixed inset-0 bg-gray-900/50 backdrop-blur-sm z-40 lg:hidden"
    @click="ui.closeSidebar"
  />

  <!-- Sidebar -->
  <aside
    :class="[
      'fixed inset-y-0 left-0 z-50 bg-white border-r border-gray-200 transform transition-all duration-300 ease-in-out flex flex-col',
      'lg:translate-x-0 lg:fixed',
      ui.isSidebarOpen ? 'translate-x-0' : '-translate-x-full',
      ui.isSidebarCollapsed ? 'lg:w-16' : 'lg:w-64',
      'w-64',
    ]"
  >
    <!-- Header -->
    <div class="flex items-center justify-between h-16 px-4 border-b border-gray-200">
      <NuxtLink
        to="/"
        class="flex items-center gap-2 transition-opacity duration-300 overflow-hidden"
        :class="{ 'lg:opacity-0 lg:w-0': ui.isSidebarCollapsed }"
      >
        <div class="h-8 w-8 bg-primary-600 rounded-lg flex items-center justify-center">
          <span class="text-white font-bold text-lg">F</span>
        </div>
        <span class="text-lg font-bold text-gray-900">Finerdy</span>
      </NuxtLink>
      <div class="flex gap-2">
        <button
          @click="ui.toggleCollapsed"
          class="hidden lg:block p-2 rounded-md text-gray-500 hover:bg-gray-100 transition-colors"
          :title="ui.isSidebarCollapsed ? 'Expandir' : 'Colapsar'"
        >
          <ChevronLeftIcon v-if="!ui.isSidebarCollapsed" class="h-5 w-5" />
          <ChevronRightIcon v-else class="h-5 w-5" />
        </button>
        <button
          @click="ui.closeSidebar"
          class="lg:hidden p-2 rounded-md text-gray-500 hover:bg-gray-100"
        >
          <XMarkIcon class="h-5 w-5" />
        </button>
      </div>
    </div>

    <!-- Workspace Switcher -->
    <div
      v-if="auth.workspace"
      :class="[
        'px-4 py-3 border-b border-gray-200 transition-all duration-300',
        { 'lg:opacity-0 lg:h-0 lg:py-0 lg:overflow-hidden': ui.isSidebarCollapsed },
      ]"
    >
      <label class="block text-xs font-medium text-gray-500 uppercase mb-1">
        Workspace
      </label>
      <select
        :value="auth.workspace?.id"
        class="w-full rounded-md border-gray-300 text-sm focus:ring-primary-500 focus:border-primary-500"
        @change="switchWorkspace"
      >
        <option
          v-for="ws in auth.workspaces"
          :key="ws.id"
          :value="ws.id"
        >
          {{ ws.name }}
        </option>
      </select>
    </div>

    <!-- Navigation -->
    <nav class="flex-1 overflow-y-auto sidebar-scrollbar p-4 space-y-6">
      <!-- Dashboard -->
      <div>
        <NuxtLink
          v-for="item in mainNavigation"
          :key="item.name"
          :to="item.to"
          :class="[
            'flex items-center text-sm font-medium rounded-md transition-colors',
            item.active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50',
            ui.isSidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : 'gap-3 px-3 py-2',
          ]"
          :title="ui.isSidebarCollapsed ? item.name : ''"
          @click="handleNavClick"
        >
          <component :is="item.icon" class="h-5 w-5 shrink-0" />
          <span :class="{ 'lg:hidden': ui.isSidebarCollapsed }">{{ item.name }}</span>
        </NuxtLink>
      </div>

      <hr :class="['border-gray-200', ui.isSidebarCollapsed ? 'lg:mx-2' : '']" />

      <!-- Transacciones -->
      <div>
        <h3
          :class="[
            'px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300',
            { 'lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden': ui.isSidebarCollapsed },
          ]"
        >
          Transacciones
        </h3>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in transactionNavigation"
            :key="item.name"
            :to="item.to"
            :class="[
              'flex items-center text-sm font-medium rounded-md transition-colors',
              item.active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50',
              ui.isSidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : 'gap-3 px-3 py-2',
            ]"
            :title="ui.isSidebarCollapsed ? item.name : ''"
            @click="handleNavClick"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span :class="{ 'lg:hidden': ui.isSidebarCollapsed }">{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <hr :class="['border-gray-200', ui.isSidebarCollapsed ? 'lg:mx-2' : '']" />

      <!-- Reportes -->
      <div>
        <h3
          :class="[
            'px-3 text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2 transition-all duration-300',
            { 'lg:opacity-0 lg:h-0 lg:mb-0 lg:overflow-hidden': ui.isSidebarCollapsed },
          ]"
        >
          Reportes
        </h3>
        <div class="space-y-1">
          <NuxtLink
            v-for="item in reportsNavigation"
            :key="item.name"
            :to="item.to"
            :class="[
              'flex items-center text-sm font-medium rounded-md transition-colors',
              item.active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50',
              ui.isSidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : 'gap-3 px-3 py-2',
            ]"
            :title="ui.isSidebarCollapsed ? item.name : ''"
            @click="handleNavClick"
          >
            <component :is="item.icon" class="h-5 w-5 shrink-0" />
            <span :class="{ 'lg:hidden': ui.isSidebarCollapsed }">{{ item.name }}</span>
          </NuxtLink>
        </div>
      </div>

      <hr :class="['border-gray-200', ui.isSidebarCollapsed ? 'lg:mx-2' : '']" />

      <!-- Configuración (Collapsible) -->
      <div>
        <button
          :class="[
            'flex items-center w-full text-xs font-semibold text-gray-500 uppercase tracking-wider hover:bg-gray-50 rounded-md transition-colors',
            ui.isSidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : 'justify-between px-3 py-2',
          ]"
          :title="ui.isSidebarCollapsed ? 'Configuración' : ''"
          @click="toggleSettings"
        >
          <div :class="['flex items-center', ui.isSidebarCollapsed ? '' : 'gap-2']">
            <CogIcon class="h-5 w-5 shrink-0" />
            <span :class="{ 'lg:hidden': ui.isSidebarCollapsed }">Configuración</span>
          </div>
          <ChevronDownIcon
            v-if="!ui.isSidebarCollapsed"
            :class="['h-4 w-4 transition-transform shrink-0', isSettingsOpen ? 'rotate-180' : '']"
          />
        </button>
        <div v-show="isSettingsOpen && !ui.isSidebarCollapsed" class="mt-2 space-y-1 pl-4">
          <NuxtLink
            v-for="item in settingsNavigation"
            :key="item.name"
            :to="item.to"
            :class="[
              'flex items-center gap-3 px-3 py-2 text-sm font-medium rounded-md transition-colors',
              item.active ? 'bg-primary-50 text-primary-700' : 'text-gray-700 hover:bg-gray-50',
            ]"
            @click="handleNavClick"
          >
            {{ item.name }}
          </NuxtLink>
        </div>
      </div>
    </nav>

    <!-- User Profile & Logout -->
    <div class="border-t border-gray-200 p-4">
      <NuxtLink
        to="/profile"
        :class="[
          'flex items-center gap-3 mb-3 rounded-md hover:bg-gray-50 transition-colors p-2 -mx-2',
          { 'lg:justify-center lg:mx-0': ui.isSidebarCollapsed },
        ]"
        :title="ui.isSidebarCollapsed ? auth.user?.name : ''"
        @click="handleNavClick"
      >
        <img
          v-if="gravatarUrl"
          :src="gravatarUrl"
          :alt="auth.user?.name"
          class="h-10 w-10 rounded-full"
        />
        <UserCircleIcon v-else class="h-10 w-10 text-gray-400" />
        <div :class="['flex-1 min-w-0', { 'lg:hidden': ui.isSidebarCollapsed }]">
          <p class="text-sm font-medium text-gray-900 truncate">
            {{ auth.user?.name }}
          </p>
          <p class="text-xs text-gray-500 truncate">
            {{ auth.user?.email }}
          </p>
        </div>
      </NuxtLink>
      <button
        :class="[
          'flex items-center w-full text-sm font-medium text-gray-700 rounded-md hover:bg-gray-50 transition-colors',
          ui.isSidebarCollapsed ? 'lg:justify-center lg:px-2 lg:py-3' : 'gap-3 px-3 py-2',
        ]"
        :title="ui.isSidebarCollapsed ? 'Cerrar sesión' : ''"
        @click="logout"
      >
        <ArrowRightOnRectangleIcon class="h-5 w-5 shrink-0" />
        <span :class="{ 'lg:hidden': ui.isSidebarCollapsed }">Cerrar sesión</span>
      </button>
    </div>
  </aside>
</template>
