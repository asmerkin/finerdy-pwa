<script setup lang="ts">
import { Bars3Icon } from '@heroicons/vue/24/outline'

withDefaults(defineProps<{
  title?: string
}>(), {
  title: 'Finerdy',
})

const ui = useUiStore()
</script>

<template>
  <header class="lg:hidden fixed top-0 left-0 right-0 z-30 bg-white border-b border-gray-200 safe-top overflow-hidden">
    <div
      class="flex items-center justify-between h-16 px-4 transition-transform duration-300"
      :style="{
        transform: ui.isSidebarOpen ? 'translateX(18rem)' : 'translateX(0)',
      }"
    >
      <button
        class="p-2 rounded-md text-gray-500 hover:bg-gray-100"
        @click="ui.toggleSidebar"
      >
        <Bars3Icon class="h-6 w-6" />
      </button>
      <h1 class="text-lg font-semibold text-gray-900">
        {{ title }}
      </h1>
      <div class="w-10" />
    </div>
  </header>
</template>
