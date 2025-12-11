import type { TransactionType } from '~/types'

export function useTransactionTypes() {
  const { t } = useI18n()

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
    correction: {
      bg: 'bg-gray-100',
      text: 'text-gray-800',
    },
  }

  const getTypeLabel = (type: TransactionType): string => {
    const labels: Record<TransactionType, string> = {
      income: t('transactions.types.income'),
      outcome: t('transactions.types.expense'),
      transfer: t('transactions.types.transfer'),
      exchange: t('transactions.types.exchange'),
      correction: t('transactions.types.correction'),
    }
    return labels[type] || type
  }

  const getTypeClasses = (type: TransactionType) => {
    return typeClasses[type] || { bg: 'bg-gray-100', text: 'text-gray-800' }
  }

  return {
    typeClasses,
    getTypeLabel,
    getTypeClasses,
  }
}
