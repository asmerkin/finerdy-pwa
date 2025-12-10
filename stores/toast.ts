import { defineStore } from 'pinia'
import type { Toast } from '~/components/Common/Toast.vue'

interface ToastState {
  toasts: Toast[]
}

export const useToastStore = defineStore('toast', {
  state: (): ToastState => ({
    toasts: [],
  }),

  actions: {
    addToast(toast: Omit<Toast, 'id'>) {
      const id = Math.random().toString(36).substring(2, 9)
      const duration = toast.duration || 5000

      const newToast: Toast = {
        ...toast,
        id,
      }

      this.toasts.push(newToast)

      // Auto-remove after duration
      setTimeout(() => {
        this.removeToast(id)
      }, duration)
    },

    removeToast(id: string) {
      const index = this.toasts.findIndex((t) => t.id === id)
      if (index !== -1) {
        this.toasts.splice(index, 1)
      }
    },

    success(message: string, duration?: number) {
      this.addToast({ type: 'success', message, duration })
    },

    error(message: string, duration?: number) {
      this.addToast({ type: 'error', message, duration })
    },

    info(message: string, duration?: number) {
      this.addToast({ type: 'info', message, duration })
    },

    warning(message: string, duration?: number) {
      this.addToast({ type: 'warning', message, duration })
    },
  },
})
