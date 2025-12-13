/**
 * Composable para proporcionar feedback háptico en dispositivos compatibles
 * Usa la Vibration API disponible en navegadores móviles
 */
export const useHaptics = () => {
  /**
   * Verifica si el dispositivo soporta vibración
   */
  const isSupported = computed(() => {
    return typeof window !== 'undefined' && 'vibrate' in navigator
  })

  /**
   * Feedback ligero para interacciones suaves (botones, taps)
   */
  const light = () => {
    if (!isSupported.value) return
    navigator.vibrate(10)
  }

  /**
   * Feedback medio para interacciones importantes (selecciones, confirmaciones)
   */
  const medium = () => {
    if (!isSupported.value) return
    navigator.vibrate(20)
  }

  /**
   * Feedback fuerte para interacciones críticas (errores, alertas)
   */
  const heavy = () => {
    if (!isSupported.value) return
    navigator.vibrate(40)
  }

  /**
   * Feedback de éxito (patrón de vibración)
   */
  const success = () => {
    if (!isSupported.value) return
    navigator.vibrate([10, 50, 10])
  }

  /**
   * Feedback de error (patrón de vibración)
   */
  const error = () => {
    if (!isSupported.value) return
    navigator.vibrate([20, 100, 20, 100, 20])
  }

  /**
   * Feedback de selección (para listas o menús)
   */
  const selection = () => {
    if (!isSupported.value) return
    navigator.vibrate(5)
  }

  /**
   * Vibración personalizada
   * @param pattern - Número (duración en ms) o array de números [vibrar, pausar, vibrar, ...]
   */
  const custom = (pattern: number | number[]) => {
    if (!isSupported.value) return
    navigator.vibrate(pattern)
  }

  /**
   * Detiene cualquier vibración en curso
   */
  const stop = () => {
    if (!isSupported.value) return
    navigator.vibrate(0)
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
