/**
 * Frontend API response shapes.
 * All price fields are `number` (paise) — the API serialises BigInt → Number
 * via the preSerialization hook in app.ts before sending over the wire.
 */

// ─── Auth ─────────────────────────────────────────────────────────────────────

export type { AuthUser } from './auth-store'

// ─── Customer ────────────────────────────────────────────────────────────────

export interface Customer {
  id:                   string
  tenantId:             string
  name:                 string
  phone:                string
  email:                string | null
  gstin:                string | null
  companyName:          string | null
  address:              string | null
  totalVisits:          number
  totalSpentPaise:      number
  lastVisitAt:          string | null
  loyaltyPointsBalance: number
  createdAt:            string
  updatedAt:            string
}

export type LoyaltyLedgerType = 'EARN' | 'REDEEM' | 'ADJUSTMENT'

export interface LoyaltyLedgerEntry {
  id:          string
  customerId:  string
  points:      number
  type:        LoyaltyLedgerType
  referenceId: string | null
  note:        string | null
  createdAt:   string
}

export interface CustomerOrder {
  id:          string
  orderNumber: string
  type:        string
  status:      string
  createdAt:   string
  bill: {
    billNumber:        string
    grandTotalInPaise: number
    paymentStatus:     string
  } | null
}

export interface CustomerDetail extends Customer {
  orders: CustomerOrder[]
}

export interface CustomerListResponse {
  items:      Customer[]
  pagination: PaginationMeta
}

// ─── Tables ──────────────────────────────────────────────────────────────────

export type TableStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'BLOCKED'

export interface Table {
  id: string
  name: string
  capacity: number
  outletId: string
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
  customer: { id: string; name: string; phone: string; email: string | null; loyaltyPointsBalance: number } | null
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

// ─── KOTs ────────────────────────────────────────────────────────────────────

export type KOTStatus = 'PENDING' | 'ACCEPTED' | 'IN_PROGRESS' | 'DONE' | 'CANCELLED'

export interface KOTItem {
  id: string
  kotId: string
  menuItemName: string
  variantName: string | null
  quantity: number
  note: string | null
}

export interface KOT {
  id: string
  orderId: string
  kotNumber: string
  status: KOTStatus
  printedAt: string | null
  doneAt: string | null
  createdAt: string
  updatedAt: string
  items: KOTItem[]
  order: {
    id: string
    orderNumber: number
    type: string
    guestCount: number | null
    note: string | null
    table: { id: string; name: string; floorId: string | null } | null
  }
}

// ─── Billing ─────────────────────────────────────────────────────────────────

export type PaymentMethod = 'CASH' | 'CARD' | 'UPI' | 'WALLET' | 'CREDIT' | 'COMPLIMENTARY'
export type PaymentStatus = 'PENDING' | 'PARTIAL' | 'PAID' | 'REFUNDED' | 'FAILED'

export interface Payment {
  id: string
  billId: string
  method: PaymentMethod
  amountInPaise: number
  referenceId: string | null
  paidAt: string
}

export interface BillOrderItem {
  id: string
  menuItemName: string
  variantName: string | null
  quantity: number
  unitPriceInPaise: number
  totalPriceInPaise: number
  gstRate: number
  isGSTInclusive: boolean
}

export interface Bill {
  id: string
  orderId: string
  billNumber: string
  subtotalInPaise: number
  discountInPaise: number
  serviceChargeInPaise: number
  cgstInPaise: number
  sgstInPaise: number
  igstInPaise: number
  roundOffInPaise: number
  grandTotalInPaise: number
  paymentStatus: PaymentStatus
  customerName: string | null
  customerPhone: string | null
  customerGSTIN: string | null
  createdAt: string
  order: {
    id: string
    orderNumber: number
    type: string
    guestCount: number | null
    table: { id: string; name: string } | null
    items: BillOrderItem[]
  }
  payments: Payment[]
}

// ─── Inventory ───────────────────────────────────────────────────────────────

export type InventoryUnit = 'KG' | 'GRAM' | 'LITRE' | 'ML' | 'PIECE' | 'DOZEN' | 'BOX'
export type StockAdjustmentType = 'ADD' | 'REMOVE' | 'SET'

export interface InventoryItem {
  id: string
  name: string
  sku: string | null
  unit: InventoryUnit
  currentStockInBaseUnit: number
  lowStockThreshold: number | null
  isLowStock: boolean
  costPerUnitInPaise: number | null
  category: string | null
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface StockAdjustment {
  id: string
  inventoryItemId: string
  type: StockAdjustmentType
  quantityInBaseUnit: number
  previousStockInBaseUnit: number
  newStockInBaseUnit: number
  note: string | null
  createdAt: string
}

// ─── Staff ────────────────────────────────────────────────────────────────────

export type UserRole = 'OWNER' | 'MANAGER' | 'CASHIER' | 'WAITER' | 'CHEF' | 'INVENTORY_MANAGER'

export interface StaffMember {
  id: string
  name: string
  phone: string
  email: string | null
  role: UserRole
  isActive: boolean
  isOwner: boolean
  lastLoginAt: string | null
  createdAt: string
  updatedAt: string
}

export interface StaffListResponse {
  items: StaffMember[]
  pagination: PaginationMeta
}

// ─── Settings ─────────────────────────────────────────────────────────────────

export type RestaurantType =
  | 'QSR' | 'CASUAL_DINING' | 'FINE_DINING' | 'CAFE'
  | 'BAR' | 'FOOD_TRUCK' | 'CLOUD_KITCHEN' | 'BAKERY' | 'DHABA' | 'SWEET_SHOP'

export interface TenantInfo {
  id: string
  name: string
  slug: string
  type: RestaurantType
  plan: string
  phone: string
  email: string | null
  website: string | null
  gstin: string | null
  fssaiLicense: string | null
  panNumber: string | null
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  currency: string
  timezone: string
  createdAt: string
}

export interface TenantSettings {
  id: string
  tenantId: string
  serviceChargePercent: number
  serviceChargeOnTakeaway: boolean
  roundOffBill: boolean
  printKOTAutomatically: boolean
  whatsappReceipts: boolean
  nightlySummaryPhone: string | null
  nightlySummaryTime: string
  isInterState: boolean
  kotPrinterIp: string | null
  billPrinterIp: string | null
  currencySymbol: string
  discountApprovalThreshold: number
  loyaltyEnabled: boolean
  loyaltyPointsPerRupee: number
  loyaltyRedemptionRate: number
  updatedAt: string
}

// ─── Public / QR Self-Ordering ───────────────────────────────────────────────

export interface PublicMenuResponse {
  table: {
    id: string
    name: string
    capacity: number
    status: TableStatus
    floor: { id: string; name: string } | null
    outlet: { id: string; name: string }
  }
  categories: Array<{ id: string; name: string; description: string | null; sortOrder: number }>
  items: MenuItem[]
}

export interface OutletInfo {
  id: string
  name: string
  phone: string
  addressLine1: string
  addressLine2: string | null
  city: string
  state: string
  pincode: string
  isActive: boolean
  createdAt: string
}

export interface SettingsResponse {
  tenant: TenantInfo
  settings: TenantSettings | null
  outlet: OutletInfo | null
}

// ─── Aggregators ──────────────────────────────────────────────────────────────

export type AggregatorPlatform = 'ZOMATO' | 'SWIGGY' | 'MAGICPIN' | 'EATSURE'
export type AggregatorOrderStatus = 'NEW' | 'ACCEPTED' | 'DISPATCHED' | 'DELIVERED' | 'CANCELLED'

export interface AggregatorCredential {
  id: string
  platform: AggregatorPlatform
  outletId: string
  restaurantId: string
  isActive: boolean
  createdAt: string
  updatedAt: string
}

export interface AggregatorOrderItem {
  name: string
  quantity: number
  unitPriceInPaise: number
}

export interface AggregatorOrder {
  id: string
  platformOrderId: string
  platform: AggregatorPlatform
  status: AggregatorOrderStatus
  customerName: string | null
  customerPhone: string | null
  deliveryAddress: string | null
  items: AggregatorOrderItem[]
  itemsTotalInPaise: number
  deliveryFeeInPaise: number
  platformFeeInPaise: number
  grandTotalInPaise: number
  acceptedAt: string | null
  dispatchedAt: string | null
  deliveredAt: string | null
  cancelledAt: string | null
  createdAt: string
}

// ─── Reports ─────────────────────────────────────────────────────────────────

export interface DailyReport {
  date: string
  totalOrders: number
  paidOrders: number
  cancelledOrders: number
  grossRevenueInPaise: number
  discountInPaise: number
  netRevenueInPaise: number
  avgCheckInPaise: number
  tax: {
    cgstInPaise: number
    sgstInPaise: number
    igstInPaise: number
    totalInPaise: number
  }
  paymentBreakdown: Record<string, number>
  topItems: Array<{ name: string; qty: number; revenueInPaise: number }>
}

export interface ItemsReport {
  from: string
  to: string
  items: Array<{
    name: string
    variantName: string | null
    qty: number
    revenueInPaise: number
    gstRate: number
  }>
  totalItems: number
}

export interface PaymentsReport {
  from: string
  to: string
  breakdown: Record<string, { count: number; totalInPaise: number }>
  grandTotalInPaise: number
  transactionCount: number
}

export interface GSTReport {
  month: string
  billCount: number
  taxableValueInPaise: number
  cgstInPaise: number
  sgstInPaise: number
  igstInPaise: number
  totalGSTInPaise: number
  grossRevenueInPaise: number
}

export interface InventoryValuationItem {
  id: string
  name: string
  category: string | null
  unit: string
  currentStock: number
  lowStockThreshold: number
  pricePerUnitPaise: number
  valueInPaise: number
  isLowStock: boolean
}

export interface InventoryValuationReport {
  items: InventoryValuationItem[]
  totalItems: number
  lowStockCount: number
  totalValueInPaise: number
}

// ─── Notifications ────────────────────────────────────────────────────────────

export type NotificationChannel = 'WHATSAPP' | 'SMS' | 'EMAIL' | 'PUSH'

export interface Notification {
  id: string
  tenantId: string
  userId: string | null
  channel: NotificationChannel
  type: string
  title: string
  body: string
  sentAt: string | null
  failedAt: string | null
  error: string | null
  createdAt: string
}

export interface NotificationsListResponse {
  notifications: Notification[]
  total: number
  page: number
  limit: number
  totalPages: number
}

export interface BroadcastItem {
  id:        string
  type:      string
  title:     string
  body:      string
  createdAt: string
}

// ─── Staff Notifications ──────────────────────────────────────────────────────

export type StaffNotifSenderType = 'SUPER_ADMIN' | 'OWNER' | 'MANAGER' | 'SYSTEM'
export type StaffNotifType =
  | 'ANNOUNCEMENT' | 'LOW_STOCK' | 'ORDER_ALERT' | 'KOT_ALERT'
  | 'BILL_VOID' | 'SHIFT_NOTE' | 'SUBSCRIPTION_EXPIRY' | 'PAYMENT_ALERT'
  | 'AGGREGATOR_ORDER' | 'CUSTOM'
export type StaffNotifPriority  = 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT'
export type StaffNotifTargetType = 'ALL_STAFF' | 'ROLE' | 'SPECIFIC_USER'

export interface StaffNotification {
  id:            string
  tenantId:      string
  senderId:      string | null
  senderType:    StaffNotifSenderType
  senderName:    string
  type:          StaffNotifType
  title:         string
  body:          string
  priority:      StaffNotifPriority
  targetType:    StaffNotifTargetType
  targetRoles:   string[] | null
  targetUserIds: string[] | null
  expiresAt:     string | null
  createdAt:     string
  isRead:        boolean
  readAt:        string | null
}

export interface StaffNotificationListResponse {
  items:      StaffNotification[]
  pagination: PaginationMeta
}

export interface StaffNotifUnreadCount {
  unread: number
}

export interface SendNotificationPayload {
  type?:          StaffNotifType
  title:          string
  body:           string
  priority?:      StaffNotifPriority
  targetType?:    StaffNotifTargetType
  targetRoles?:   string[]
  targetUserIds?: string[]
  expiresAt?:     string
}

// ─── Supplier + Purchase Orders ───────────────────────────────────────────────

export interface Supplier {
  id:            string
  tenantId:      string
  name:          string
  contactPerson: string | null
  phone:         string
  email:         string | null
  gstin:         string | null
  address:       string | null
  isActive:      boolean
  createdAt:     string
  updatedAt:     string
}

export type POStatus = 'DRAFT' | 'ORDERED' | 'RECEIVED' | 'CANCELLED'

export interface PurchaseOrderItem {
  id:               string
  purchaseOrderId:  string
  inventoryItemId:  string
  quantity:         number
  unitPriceInPaise: number
  totalInPaise:     number
}

export interface PurchaseOrder {
  id:            string
  tenantId:      string
  supplierId:    string
  poNumber:      string
  status:        POStatus
  totalInPaise:  number
  invoiceNumber: string | null
  receivedAt:    string | null
  note:          string | null
  createdAt:     string
  updatedAt:     string
  supplier:      Supplier
  items:         PurchaseOrderItem[]
}

// ─── Recipe ───────────────────────────────────────────────────────────────────

export interface RecipeIngredient {
  id:              string
  menuItemId:      string
  inventoryItemId: string
  quantity:        number
  inventoryItem: {
    id:   string
    name: string
    unit: string
    pricePerUnitPaise: number
  }
}

// ─── Profile / Me ─────────────────────────────────────────────────────────────

export interface ProfileMe {
  id:                 string
  tenantId:           string
  name:               string
  email:              string | null
  phone:              string
  role:               string
  lastLoginAt:        string | null
  passwordChangedAt:  string | null
  hasPIN:             boolean
  hasPassword:        boolean
}

export interface UserSessionItem {
  id:         string
  deviceInfo: string | null
  ipAddress:  string | null
  createdAt:  string
  expiresAt:  string
  isCurrent:  boolean
}

export interface LoginHistoryItem {
  id:        string
  action:    string
  ipAddress: string | null
  createdAt: string
  method:    string | null
}

export interface NotifPrefs {
  notifOrderAlerts: boolean
  notifLowStock:    boolean
  notifDailyReport: boolean
  notifLoginAlert:  boolean
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

// ─── Devices ─────────────────────────────────────────────────────────────────

export type DeviceType        = 'POS' | 'KDS' | 'CAPTAIN' | 'MANAGER' | 'PRINT_AGENT' | 'OWNER_MOBILE'
export type DeviceDisplayMode = 'STANDARD' | 'KIOSK' | 'KDS_DISPLAY'

export interface DeviceSettings {
  id:            string
  deviceId:      string
  autoKotPrint:  boolean
  autoBillPrint: boolean
  soundAlerts:   boolean
  displayMode:   DeviceDisplayMode
}

export interface Device {
  id:          string
  tenantId:    string
  name:        string
  type:        DeviceType
  token:       string
  defaultUrl:  string | null
  floorId:     string | null
  lastSeenAt:  string | null
  lastSeenIp:  string | null
  isActive:    boolean
  createdAt:   string
  updatedAt:   string
  settings:    DeviceSettings | null
}

// ─── Permissions ─────────────────────────────────────────────────────────────

export type ConfigurableRole = 'MANAGER' | 'CASHIER' | 'WAITER' | 'CHEF' | 'INVENTORY_MANAGER'

// Granted permissions grouped by role — shape returned by GET /permissions
export type PermissionsByRole = Partial<Record<ConfigurableRole, string[]>>

export interface RolePermissionRow {
  id:         string
  tenantId:   string
  role:       ConfigurableRole
  permission: string
  grantedBy:  string
  createdAt:  string
}
