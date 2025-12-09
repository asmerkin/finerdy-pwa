import type { TransactionType } from '~/types'

export function useTransactionTypes() {
  const typeLabels: Record<TransactionType, string> = {
    income: 'Ingreso',
    outcome: 'Gasto',
    transfer: 'Transferencia',
    exchange: 'Cambio',
  }

  const typeClasses: Record<TransactionType, { bg: string; text: string }> = {
    income: {
      bg: 'bg-success-100',
      text: 'text-success-800',
    },
    outcome: {
      bg: 'bg-danger-100',
      text: 'text-danger-800',
    },
    transfer: {
      bg: 'bg-blue-100',
      text: 'text-blue-800',
    },
    exchange: {
      bg: 'bg-purple-100',
      text: 'text-purple-800',
    },
  }

  const getTypeLabel = (type: TransactionType): string => {
    return typeLabels[type] || type
  }

  const getTypeClasses = (type: TransactionType) => {
    return typeClasses[type] || { bg: 'bg-gray-100', text: 'text-gray-800' }
  }

  return {
    typeLabels,
    typeClasses,
    getTypeLabel,
    getTypeClasses,
  }
}
