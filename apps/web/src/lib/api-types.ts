/**
 * Frontend API response shapes.
 * All price fields are `number` (paise) — the API serialises BigInt → Number
 * via the preSerialization hook in app.ts before sending over the wire.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type { AuthUser } from './auth-store'

// ─── Tables ──────────────────────────────────────────────────────────────────

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'BLOCKED'

export interface Table {
  id: string
  name: string
  capacity: number
  floorId: string | null
  positionX: number | null
  positionY: number | null
  status: TableStatus
  qrCode: string | null
}

export interface Floor {
  id: string
  name: string
  sortOrder: number
}

// ─── Menu ────────────────────────────────────────────────────────────────────

export type FoodType = 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN'

export interface MenuCategory {
  id: string
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
}

export interface MenuItemVariant {
  id: string
  menuItemId: string
  name: string
  priceInPaise: number
  isDefault: boolean
}

export interface MenuItemAddOn {
  id: string
  menuItemId: string
  name: string
  priceInPaise: number
  isDefault: boolean
}

export interface MenuItem {
  id: string
  categoryId: string
  name: string
  description: string | null
  imageUrl: string | null
  priceInPaise: number
  gstRate: 0 | 5 | 12 | 18 | 28
  isGSTInclusive: boolean
  foodType: FoodType
  isAvailable: boolean
  isFeatured: boolean
  sortOrder: number
  variants: MenuItemVariant[]
  addOns: MenuItemAddOn[]
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export type OrderStatus =
  | 'DRAFT'
  | 'CONFIRMED'
  | 'IN_PROGRESS'
  | 'READY'
  | 'SERVED'
  | 'BILLED'
  | 'PAID'
  | 'CANCELLED'
  | 'VOID'

export type OrderType = 'DINE_IN' | 'TAKEAWAY' | 'DELIVERY'

export interface OrderItem {
  id: string
  menuItemId: string
  variantId: string | null
  menuItemName: string
  variantName: string | null
  quantity: number
  unitPriceInPaise: number
  subtotalInPaise: number
  note: string | null
  kotStatus: string
  isGSTInclusive: boolean
  gstRate: number
}

export interface Order {
  id: string
  orderNumber: number
  type: OrderType
  status: OrderStatus
  tableId: string | null
  table: { id: string; name: string } | null
  guestCount: number | null
  note: string | null
  subtotalInPaise: number
  items: OrderItem[]
  createdAt: string
  updatedAt: string
}

// ─── Cart (local state — never sent to API directly) ─────────────────────────

export interface CartItem {
  menuItemId: string
  variantId: string | null
  menuItemName: string
  variantName: string | null
  priceInPaise: number          // unit price
  quantity: number
  note: string
  addOns: { addOnId: string; name: string; priceInPaise: number }[]
}

// ─── Pagination ──────────────────────────────────────────────────────────────

export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}
