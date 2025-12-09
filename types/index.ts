// User types
export interface User {
  id: number
  name: string
  email: string
  timezone: string
  locale: string
}

// Workspace types
export interface Workspace {
  id: number
  name: string
  slug: string
  default_currency: string
  is_owner: boolean
}

export interface WorkspaceListItem {
  id: number
  name: string
  slug: string
  role: 'owner' | 'member' | 'viewer'
}

// Account types
export interface Account {
  id: number
  name: string
  currency: string
  balance: string // Decimal formatted string from API (e.g., "8240.00")
  workspace_id: number
  created_at: string
  updated_at: string
}

// Category types
export type CategoryTransactionType = 'income' | 'outcome'

export interface Category {
  id: number
  name: string
  transaction_type: CategoryTransactionType
  reference_balance?: string
  workspace_id: number
  created_at: string
  updated_at: string
}

// Transaction types
export type TransactionType = 'income' | 'outcome' | 'transfer' | 'exchange'

export interface Transaction {
  id: number
  type: TransactionType
  amount: string // Decimal formatted string from API (e.g., "-1000.00")
  reference_amount?: string | null
  exchange_difference?: string | null
  currency: string
  description: string | null
  attachment_path?: string | null
  attachment_name?: string | null
  happened_at: string
  account_id: number
  category_id: number | null
  related_id: number | null
  budget_id: number | null
  created_by: number | null
  workspace_id: number
  media_count?: number
  account?: Account
  category?: Category | null
  related?: {
    id: number
    workspace_id: number
    account_id: number
    type: TransactionType
    amount: string
    currency: string
    description: string | null
    happened_at: string
  }
  creator?: {
    id: number
    name: string
  } | null
  created_at: string
  updated_at: string
}

// Budget types
export type BudgetPeriod = 'monthly' | 'quarterly' | 'yearly'

export interface Budget {
  id: number
  name: string
  amount: number
  period: BudgetPeriod
  workspace_id: number
  categories?: Category[]
  created_at: string
  updated_at: string
}

// API Response types
export interface PaginatedResponse<T> {
  data: T[]
  links: {
    first: string
    last: string
    prev: string | null
    next: string | null
  }
  meta: {
    current_page: number
    from: number
    last_page: number
    per_page: number
    to: number
    total: number
  }
}

export interface ApiResponse<T> {
  data: T
}

// Auth types
export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  name: string
  email: string
  password: string
  password_confirmation: string
}
