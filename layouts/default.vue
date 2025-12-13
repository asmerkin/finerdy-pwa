<script setup lang="ts">
const ui = useUiStore()

// Bloquear scroll cuando el sidebar está abierto en móvil
watch(() => ui.isSidebarOpen, (isOpen) => {
  if (window.innerWidth >= 1024) return // Solo en móvil

  if (isOpen) {
    document.body.style.overflow = 'hidden'
  } else {
    document.body.style.overflow = ''
  }
})

// Limpiar al desmontar
onUnmounted(() => {
  document.body.style.overflow = ''
})
</script>

<template>
  <div class="min-h-screen bg-gray-50 font-sans antialiased overflow-x-hidden">
    <NavigationSidebar />

    <!-- Header fijo fuera del contenedor con transform -->
    <NavigationMobileHeader />

    <!-- Overlay invisible para bloquear interacciones en móvil -->
    <div
      v-if="ui.isSidebarOpen"
      class="fixed inset-0 z-40 lg:hidden"
      @click="ui.closeSidebar"
    />

    <div
      :class="[
        'transition-transform duration-300 min-h-screen lg:transform-none!',
        ui.isSidebarCollapsed ? 'lg:pl-16' : 'lg:pl-64',
      ]"
      :style="{
        transform: ui.isSidebarOpen ? 'translateX(18rem)' : 'translateX(0)',
      }"
    >
      <main class="p-4 sm:p-6 safe-bottom lg:pt-4 pt-20">
        <slot />
      </main>
    </div>
    <CommonToastContainer />
    <NavigationFloatingActionButton />
  </div>
</template>
