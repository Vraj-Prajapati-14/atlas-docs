import { z } from 'zod'

// ─── Grantable permissions ──────────────────────────────────────────────────
// Format: DOMAIN:action — easy to group in the UI and extend later
export const AVAILABLE_PERMISSIONS = [
  'BILLING:discount',      // apply discounts to bills
  'BILLING:void',          // void a bill / order
  'BILLING:settle',        // mark a bill as paid
  'ORDERS:cancel',         // cancel a placed order
  'ORDERS:kot_override',   // force-reprint or override a KOT
  'MENU:edit',             // edit item names, prices, categories
  'MENU:availability',     // toggle item/category availability
  'REPORTS:sales',         // view daily/period sales reports
  'REPORTS:staff',         // view staff performance reports
  'INVENTORY:view',        // view stock levels
  'INVENTORY:manage',      // add / adjust / write-off stock
  'STAFF:manage',          // create and deactivate staff
  'CUSTOMERS:view',        // view customer contact details
  'CUSTOMERS:export',      // export customer data
  'SETTINGS:printer',      // change printer / KOT settings
] as const

export type Permission = (typeof AVAILABLE_PERMISSIONS)[number]

// OWNER always holds all permissions — these are the roles that can be configured
export const CONFIGURABLE_ROLES = ['MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'INVENTORY_MANAGER'] as const
export type ConfigurableRole = (typeof CONFIGURABLE_ROLES)[number]

// ─── Zod schemas ───────────────────────────────────────────────────────────
const PermissionEnum      = z.enum(AVAILABLE_PERMISSIONS)
const ConfigurableRoleEnum = z.enum(CONFIGURABLE_ROLES)

export const RoleParam = z.object({
  role: ConfigurableRoleEnum,
})

export const RolePermissionParam = z.object({
  role:       ConfigurableRoleEnum,
  permission: PermissionEnum,
})

export const GrantPermissionBody = z.object({
  permission: PermissionEnum,
})

export const BulkSetPermissionsBody = z.object({
  permissions: z.array(PermissionEnum).max(AVAILABLE_PERMISSIONS.length),
})

export type GrantPermissionInput    = z.output<typeof GrantPermissionBody>
export type BulkSetPermissionsInput = z.output<typeof BulkSetPermissionsBody>
