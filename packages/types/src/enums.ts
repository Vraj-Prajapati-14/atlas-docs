/**
 * Shared enums — used in DB schema, API contracts, and frontend.
 * Every enum here must mirror the Prisma schema exactly.
 */

export enum RestaurantType {
  QSR = 'QSR',                       // Quick Service Restaurant (McDonald's style)
  CASUAL_DINING = 'CASUAL_DINING',
  FINE_DINING = 'FINE_DINING',
  CAFE = 'CAFE',
  BAR = 'BAR',
  FOOD_TRUCK = 'FOOD_TRUCK',
  CLOUD_KITCHEN = 'CLOUD_KITCHEN',
  BAKERY = 'BAKERY',
  DHABA = 'DHABA',
  SWEET_SHOP = 'SWEET_SHOP',
}

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  CASHIER = 'CASHIER',
  WAITER = 'WAITER',
  CHEF = 'CHEF',
  INVENTORY_MANAGER = 'INVENTORY_MANAGER',
}

export enum OrderStatus {
  DRAFT = 'DRAFT',                 // order started, not confirmed
  CONFIRMED = 'CONFIRMED',         // sent to kitchen
  IN_PROGRESS = 'IN_PROGRESS',     // being prepared
  READY = 'READY',                 // ready for pickup/serve
  SERVED = 'SERVED',               // delivered to table
  BILLED = 'BILLED',               // bill generated
  PAID = 'PAID',                   // payment received
  CANCELLED = 'CANCELLED',
  VOID = 'VOID',                   // voided after billing (manager auth required)
}

export enum OrderType {
  DINE_IN = 'DINE_IN',
  TAKEAWAY = 'TAKEAWAY',
  DELIVERY = 'DELIVERY',           // own delivery or aggregator
}

export enum TableStatus {
  AVAILABLE = 'AVAILABLE',
  OCCUPIED = 'OCCUPIED',
  RESERVED = 'RESERVED',
  CLEANING = 'CLEANING',
  BLOCKED = 'BLOCKED',
}

export enum PaymentMethod {
  CASH = 'CASH',
  CARD = 'CARD',
  UPI = 'UPI',
  WALLET = 'WALLET',             // Paytm, PhonePe, etc.
  CREDIT = 'CREDIT',             // outstanding credit
  COMPLIMENTARY = 'COMPLIMENTARY',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PARTIAL = 'PARTIAL',
  PAID = 'PAID',
  REFUNDED = 'REFUNDED',
  FAILED = 'FAILED',
}

export enum KOTStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  IN_PROGRESS = 'IN_PROGRESS',
  DONE = 'DONE',
  CANCELLED = 'CANCELLED',
}

export enum ItemCategory {
  FOOD = 'FOOD',
  BEVERAGE = 'BEVERAGE',
  ALCOHOL = 'ALCOHOL',
  DESSERT = 'DESSERT',
  COMBO = 'COMBO',
  ADD_ON = 'ADD_ON',
}

export enum FoodType {
  VEG = 'VEG',
  NON_VEG = 'NON_VEG',
  EGG = 'EGG',
  VEGAN = 'VEGAN',
}

export enum InventoryUnit {
  KG = 'KG',
  GRAM = 'GRAM',
  LITRE = 'LITRE',
  ML = 'ML',
  PIECE = 'PIECE',
  DOZEN = 'DOZEN',
  PACKET = 'PACKET',
  BOX = 'BOX',
}

export enum InventoryTransactionType {
  PURCHASE = 'PURCHASE',
  SALE_DEDUCTION = 'SALE_DEDUCTION',   // auto-deducted when order paid
  WASTE = 'WASTE',
  ADJUSTMENT = 'ADJUSTMENT',           // manual correction by manager
  RETURN = 'RETURN',
  OPENING_STOCK = 'OPENING_STOCK',
}

export enum SubscriptionPlan {
  FREE = 'FREE',
  STARTER = 'STARTER',       // ₹499/month
  GROWTH = 'GROWTH',         // ₹999/month
  PRO = 'PRO',               // ₹1,999/month
}

export enum NotificationChannel {
  WHATSAPP = 'WHATSAPP',
  SMS = 'SMS',
  EMAIL = 'EMAIL',
  PUSH = 'PUSH',
  IN_APP = 'IN_APP',
}

export enum AggregatorPlatform {
  ZOMATO = 'ZOMATO',
  SWIGGY = 'SWIGGY',
  MAGICPIN = 'MAGICPIN',
  EATSURE = 'EATSURE',
}

export enum AggregatorOrderStatus {
  NEW = 'NEW',
  ACCEPTED = 'ACCEPTED',
  DISPATCHED = 'DISPATCHED',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
