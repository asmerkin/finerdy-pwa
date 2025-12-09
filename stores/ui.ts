import { defineStore } from 'pinia'

export const useUiStore = defineStore('ui', () => {
  // Sidebar state
  const isSidebarOpen = ref(false)
  const isSidebarCollapsed = ref(false)

  // Toggle sidebar (mobile)
  function toggleSidebar() {
    isSidebarOpen.value = !isSidebarOpen.value
  }

  // Open sidebar (mobile)
  function openSidebar() {
    isSidebarOpen.value = true
  }

  // Close sidebar (mobile)
  function closeSidebar() {
    isSidebarOpen.value = false
  }

  // Toggle collapsed state (desktop)
  function toggleCollapsed() {
    isSidebarCollapsed.value = !isSidebarCollapsed.value
  }

  return {
    // State
    isSidebarOpen,
    isSidebarCollapsed,

    // Actions
    toggleSidebar,
    openSidebar,
    closeSidebar,
    toggleCollapsed,
  }
})
