import type { RentalStatus } from './types'

export const RENTAL_STATUS_DOT: Record<RentalStatus, string> = {
  pending:         '#fcd34d',
  confirmed:       '#60a5fa',
  payment_pending: '#fb923c',
  completed:       '#4ade80',
  cancelled:       '#d1d5db',
  waitlist:        '#c084fc',
}

export const RENTAL_STATUS_BG: Record<RentalStatus, string> = {
  pending:         'rgba(252,211,77,0.15)',
  confirmed:       'rgba(96,165,250,0.15)',
  payment_pending: 'rgba(251,146,60,0.15)',
  completed:       'rgba(74,222,128,0.15)',
  cancelled:       'rgba(209,213,219,0.15)',
  waitlist:        'rgba(192,132,252,0.15)',
}

export const RENTAL_STATUS_TAILWIND: Record<RentalStatus, string> = {
  pending:         'bg-yellow-100 text-yellow-800',
  confirmed:       'bg-blue-100 text-blue-800',
  payment_pending: 'bg-orange-100 text-orange-800',
  completed:       'bg-green-100 text-green-800',
  cancelled:       'bg-gray-100 text-gray-500',
  waitlist:        'bg-purple-100 text-purple-700',
}
