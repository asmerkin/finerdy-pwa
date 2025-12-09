export function useMoney() {
  const auth = useAuthStore()

  const getDefaultCurrency = () => {
    return auth.workspace?.default_currency || 'USD'
  }

  const formatMoney = (amount: number | string | null | undefined, currency?: string | null) => {
    const numAmount = parseFloat(String(amount ?? 0))
    const finalCurrency = currency || getDefaultCurrency()

    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: finalCurrency,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(numAmount)
  }

  const parseMoney = (formatted: string | null | undefined): number => {
    if (!formatted) return 0
    const cleaned = formatted.replace(/[^0-9.-]+/g, '')
    return parseFloat(cleaned) || 0
  }

  return {
    formatMoney,
    parseMoney,
    getDefaultCurrency,
  }
}
