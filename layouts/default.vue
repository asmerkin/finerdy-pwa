<script setup lang="ts">
const ui = useUiStore()
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased">
    <NavigationSidebar />
    <div
      :class="[
        'transition-all duration-300',
        ui.isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
      ]"
    >
      <NavigationMobileHeader />
      <main class="p-4 sm:p-6 safe-bottom">
        <slot />
      </main>
    </div>
    <CommonToastContainer />
    <NavigationFloatingActionButton />
  </div>
</template>
