/**
 * Composable para proporcionar feedback háptico en dispositivos compatibles
 * Soporta Vibration API en Android y usa checkbox switch trick para iOS 18+
 * Basado en: https://github.com/tijnjh/ios-haptics
 */
export const useHaptics = () => {
  const isIOS = computed(() => {
    if (typeof window === 'undefined') return false
    // Detectar iOS incluyendo iPads que se reportan como Mac
    const isIOSDevice = /iPad|iPhone|iPod/.test(navigator.userAgent)
    const isMacWithTouch = navigator.userAgent.includes('Mac') && navigator.maxTouchPoints > 1
    return isIOSDevice || isMacWithTouch
  })

  const isStandalone = computed(() => {
    if (typeof window === 'undefined') return false
    // Detectar si está instalado como PWA
    return ('standalone' in window.navigator && (window.navigator as any).standalone) ||
           window.matchMedia('(display-mode: standalone)').matches
  })

  /**
   * Verifica si el dispositivo soporta vibración
   */
  const isSupported = computed(() => {
    if (typeof window === 'undefined') return false

    // En iOS 18+, podemos usar el checkbox switch trick
    if (isIOS.value) {
      return true // Siempre intentamos el fallback
    }

    return 'vibrate' in navigator && typeof navigator.vibrate === 'function'
  })

  /**
   * Trigger haptic usando checkbox switch (iOS 18+)
   * Esta es la solución para iOS que no soporta navigator.vibrate
   */
  const triggerIOSHaptic = () => {
    try {
      // Crear un checkbox invisible con el atributo switch (iOS 18+)
      const checkbox = document.createElement('input')
      checkbox.type = 'checkbox'
      checkbox.setAttribute('switch', '')
      checkbox.style.position = 'fixed'
      checkbox.style.opacity = '0'
      checkbox.style.pointerEvents = 'none'
      checkbox.style.left = '-9999px'

      // Crear un label asociado para poder hacer click
      const label = document.createElement('label')
      const id = `haptic-${Date.now()}-${Math.random()}`
      checkbox.id = id
      label.htmlFor = id
      label.style.position = 'fixed'
      label.style.opacity = '0'
      label.style.pointerEvents = 'none'
      label.style.left = '-9999px'

      // Añadir al DOM
      document.body.appendChild(checkbox)
      document.body.appendChild(label)

      // Hacer click en el label para activar el haptic
      label.click()

      // Limpiar después de un breve delay
      setTimeout(() => {
        document.body.removeChild(checkbox)
        document.body.removeChild(label)
      }, 100)
    } catch (error) {
      console.debug('iOS haptic feedback error:', error)
    }
  }

  /**
   * Intenta ejecutar feedback háptico con múltiples estrategias
   */
  const triggerHaptic = (pattern: number | number[]) => {
    if (!isSupported.value || typeof window === 'undefined') {
      return false
    }

    try {
      // Para iOS, usar el checkbox switch trick
      if (isIOS.value) {
        triggerIOSHaptic()
        return true
      }

      // Para Android y otros navegadores, usar Vibration API
      if ('vibrate' in navigator) {
        return navigator.vibrate(pattern)
      }
    } catch (error) {
      console.debug('Haptic feedback error:', error)
    }

    return false
  }

  /**
   * Feedback ligero para interacciones suaves (botones, taps)
   */
  const light = () => {
    triggerHaptic(10)
  }

  /**
   * Feedback medio para interacciones importantes (selecciones, confirmaciones)
   */
  const medium = () => {
    triggerHaptic(20)
  }

  /**
   * Feedback fuerte para interacciones críticas (errores, alertas)
   */
  const heavy = () => {
    triggerHaptic(40)
  }

  /**
   * Feedback de éxito (patrón de vibración)
   */
  const success = () => {
    triggerHaptic([10, 50, 10])
  }

  /**
   * Feedback de error (patrón de vibración)
   */
  const error = () => {
    triggerHaptic([20, 100, 20, 100, 20])
  }

  /**
   * Feedback de selección (para listas o menús)
   */
  const selection = () => {
    triggerHaptic(5)
  }

  /**
   * Vibración personalizada
   * @param pattern - Número (duración en ms) o array de números [vibrar, pausar, vibrar, ...]
   */
  const custom = (pattern: number | number[]) => {
    triggerHaptic(pattern)
  }

  /**
   * Detiene cualquier vibración en curso
   */
  const stop = () => {
    if (!isSupported.value) return
    try {
      if ('vibrate' in navigator) {
        navigator.vibrate(0)
      }
    } catch (error) {
      // Silenciosamente fallar
    }
  }

  return {
    isSupported,
    light,
    medium,
    heavy,
    success,
    error,
    selection,
    custom,
    stop,
  }
}
