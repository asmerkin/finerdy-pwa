<script setup lang="ts">
import {
  PlusIcon,
  ArrowsRightLeftIcon,
  CurrencyDollarIcon,
  BanknotesIcon,
} from '@heroicons/vue/24/outline'

const { t } = useI18n()
const haptics = useHaptics()
const isMenuOpen = ref(false)

const toggleMenu = () => {
  // Feedback háptico medio al abrir/cerrar el menú
  haptics.medium()
  isMenuOpen.value = !isMenuOpen.value
}

const closeMenu = () => {
  // Feedback háptico ligero al cerrar
  haptics.light()
  isMenuOpen.value = false
}

const handleActionClick = () => {
  // Feedback háptico de selección al elegir una opción
  haptics.selection()
  closeMenu()
}

const actions = computed(() => [
  {
    name: t('fab.transaction'),
    href: '/transactions/create',
    icon: BanknotesIcon,
    description: t('fab.newTransaction'),
  },
  {
    name: t('fab.transfer'),
    href: '/transactions/transfer/create',
    icon: ArrowsRightLeftIcon,
    description: t('fab.betweenAccounts'),
  },
  {
    name: t('fab.exchange'),
    href: '/transactions/exchange/create',
    icon: CurrencyDollarIcon,
    description: t('fab.currencyExchange'),
  },
])
</script>

<template>
  <!-- Backdrop -->
  <div
    v-if="isMenuOpen"
    class="fixed inset-0 z-40"
    @click="closeMenu"
  />

  <!-- FAB Container -->
  <div class="fixed bottom-6 right-6 z-50">
    <!-- Menu Options -->
    <Transition
      enter-active-class="transition ease-out duration-200"
      enter-from-class="transform opacity-0 scale-95"
      enter-to-class="transform opacity-100 scale-100"
      leave-active-class="transition ease-in duration-150"
      leave-from-class="transform opacity-100 scale-100"
      leave-to-class="transform opacity-0 scale-95"
    >
      <div
        v-if="isMenuOpen"
        class="absolute bottom-full right-0 mb-4 space-y-2"
      >
        <NuxtLink
          v-for="action in actions"
          :key="action.name"
          :to="action.href"
          class="flex items-center gap-3 bg-white rounded-lg shadow-lg border border-gray-200 px-4 py-3 hover:bg-gray-50 transition-colors min-w-[200px]"
          @click="handleActionClick"
        >
          <div class="flex-shrink-0 w-10 h-10 rounded-full bg-primary-50 flex items-center justify-center">
            <component :is="action.icon" class="h-5 w-5 text-primary-600" />
          </div>
          <div class="flex-1 min-w-0">
            <p class="text-sm font-medium text-gray-900">
              {{ action.name }}
            </p>
            <p class="text-xs text-gray-500">
              {{ action.description }}
            </p>
          </div>
        </NuxtLink>
      </div>
    </Transition>

    <!-- Main FAB Button -->
    <button
      class="w-14 h-14 rounded-full bg-primary-600 text-white shadow-lg hover:bg-primary-700 transition-all duration-200 flex items-center justify-center"
      :class="isMenuOpen ? 'rotate-45 scale-110' : 'rotate-0 scale-100'"
      :title="isMenuOpen ? t('fab.close') : t('fab.newOperation')"
      @click="toggleMenu"
    >
      <PlusIcon class="h-6 w-6" />
    </button>
  </div>
</template>
