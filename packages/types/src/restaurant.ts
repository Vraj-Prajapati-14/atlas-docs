import type { RestaurantType, SubscriptionPlan, UserRole } from './enums.js'

export interface Tenant {
  id: string
  name: string
  slug: string
  type: RestaurantType
  plan: SubscriptionPlan
  gstin: string | null
  fssaiLicense: string | null
  phone: string
  email: string | null
  address: Address
  currency: 'INR'
  timezone: 'Asia/Kolkata'
  isActive: boolean
  createdAt: Date
}

export interface Address {
  line1: string
  line2?: string
  city: string
  state: string
  pincode: string
  country: 'India'
}

export interface StaffMember {
  id: string
  tenantId: string
  name: string
  phone: string
  email: string | null
  role: UserRole
  pin: string | null         // 4-digit PIN for quick login at POS
  isActive: boolean
  createdAt: Date
}

export interface MenuCategory {
  id: string
  tenantId: string
  name: string
  description: string | null
  imageUrl: string | null
  sortOrder: number
  isActive: boolean
  items?: MenuItem[]
}

export interface MenuItem {
  id: string
  tenantId: string
  categoryId: string
  name: string
  description: string | null
  imageUrl: string | null
  priceInPaise: bigint       // stored as BigInt paise
  gstRate: 0 | 5 | 12 | 18 | 28
  isGSTInclusive: boolean
  foodType: 'VEG' | 'NON_VEG' | 'EGG' | 'VEGAN'
  isAvailable: boolean
  isFeatured: boolean
  sortOrder: number
  variants?: MenuItemVariant[]
  addOns?: MenuItemAddOn[]
}

export interface MenuItemVariant {
  id: string
  menuItemId: string
  name: string               // "Half", "Full", "Large"
  priceInPaise: bigint
  isDefault: boolean
}

export interface MenuItemAddOn {
  id: string
  menuItemId: string
  name: string               // "Extra cheese", "No onion"
  priceInPaise: bigint       // 0 for free add-ons
  isDefault: boolean
}

export interface Table {
  id: string
  tenantId: string
  outletId: string
  name: string               // "T1", "Table 12", "Rooftop 3"
  capacity: number
  floorId: string | null
  positionX: number | null   // for floor plan drag-and-drop
  positionY: number | null
  status: 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'BLOCKED'
  qrCode: string | null      // for WhatsApp/URL self-ordering
}

export interface Floor {
  id: string
  tenantId: string
  outletId: string
  name: string               // "Ground Floor", "Rooftop", "AC Section"
  sortOrder: number
}

export interface Outlet {
  id: string
  tenantId: string
  name: string               // "Main Branch", "MG Road"
  address: Address
  phone: string
  isActive: boolean
}
