/**
 * Database seed — creates a demo tenant with realistic data for development.
 * Run: pnpm --filter @atlas/db seed
 */

import { PrismaClient, RestaurantType, UserRole, FoodType, InventoryUnit } from '@prisma/client'
import { createHash } from 'node:crypto'

const prisma = new PrismaClient()

// Minimal bcrypt stub for seed — real password hashing is in the API module
function hashPin(pin: string): string {
  return createHash('sha256').update(`seed:${pin}`).digest('hex')
}

async function main(): Promise<void> {
  console.log('Seeding database...')

  // Tenant
  const tenant = await prisma.tenant.upsert({
    where: { slug: 'demo-kitchen' },
    update: {},
    create: {
      name: 'Demo Kitchen',
      slug: 'demo-kitchen',
      type: RestaurantType.CASUAL_DINING,
      phone: '9876543210',
      email: 'owner@demokitchen.in',
      gstin: '29ABCDE1234F1Z5',
      fssaiLicense: '12345678901234',
      addressLine1: '42, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
    },
  })

  console.log(`Tenant: ${tenant.name} (${tenant.id})`)

  // Outlet
  const outlet = await prisma.outlet.upsert({
    where: { id: 'outlet-demo-main' },
    update: {},
    create: {
      id: 'outlet-demo-main',
      tenantId: tenant.id,
      name: 'Main Branch',
      addressLine1: '42, MG Road',
      city: 'Bengaluru',
      state: 'Karnataka',
      pincode: '560001',
      phone: '9876543210',
    },
  })

  // Floor
  const floor = await prisma.floor.upsert({
    where: { id: 'floor-demo-ground' },
    update: {},
    create: {
      id: 'floor-demo-ground',
      tenantId: tenant.id,
      outletId: outlet.id,
      name: 'Ground Floor',
      sortOrder: 1,
    },
  })

  // Tables
  const tableNames = ['T1', 'T2', 'T3', 'T4', 'T5', 'T6']
  for (const [i, name] of tableNames.entries()) {
    await prisma.table.upsert({
      where: { id: `table-demo-${name.toLowerCase()}` },
      update: {},
      create: {
        id: `table-demo-${name.toLowerCase()}`,
        tenantId: tenant.id,
        outletId: outlet.id,
        floorId: floor.id,
        name,
        capacity: 4,
        positionX: (i % 3) * 120 + 60,
        positionY: Math.floor(i / 3) * 120 + 60,
      },
    })
  }

  // Staff
  const owner = await prisma.user.upsert({
    where: { id: 'user-demo-owner' },
    update: {},
    create: {
      id: 'user-demo-owner',
      tenantId: tenant.id,
      name: 'Priya Sharma',
      phone: '9876543210',
      email: 'owner@demokitchen.in',
      role: UserRole.OWNER,
      isOwner: true,
      pin: hashPin('1234'),
    },
  })

  await prisma.user.upsert({
    where: { id: 'user-demo-manager' },
    update: {},
    create: {
      id: 'user-demo-manager',
      tenantId: tenant.id,
      name: 'Rahul Verma',
      phone: '9876543211',
      role: UserRole.MANAGER,
      pin: hashPin('2345'),
    },
  })

  await prisma.user.upsert({
    where: { id: 'user-demo-cashier' },
    update: {},
    create: {
      id: 'user-demo-cashier',
      tenantId: tenant.id,
      name: 'Amit Kumar',
      phone: '9876543212',
      role: UserRole.CASHIER,
      pin: hashPin('3456'),
    },
  })

  await prisma.user.upsert({
    where: { id: 'user-demo-chef' },
    update: {},
    create: {
      id: 'user-demo-chef',
      tenantId: tenant.id,
      name: 'Suresh Babu',
      phone: '9876543213',
      role: UserRole.CHEF,
      pin: hashPin('4567'),
    },
  })

  console.log(`Staff seeded (Owner: ${owner.name})`)

  // Menu categories
  const categories = await Promise.all([
    prisma.menuCategory.upsert({
      where: { id: 'cat-demo-starters' },
      update: {},
      create: { id: 'cat-demo-starters', tenantId: tenant.id, name: 'Starters', sortOrder: 1 },
    }),
    prisma.menuCategory.upsert({
      where: { id: 'cat-demo-mains' },
      update: {},
      create: { id: 'cat-demo-mains', tenantId: tenant.id, name: 'Main Course', sortOrder: 2 },
    }),
    prisma.menuCategory.upsert({
      where: { id: 'cat-demo-drinks' },
      update: {},
      create: { id: 'cat-demo-drinks', tenantId: tenant.id, name: 'Beverages', sortOrder: 3 },
    }),
  ])

  // Menu items
  const menuItems = [
    { id: 'mi-paneer-tikka',    catIdx: 0, name: 'Paneer Tikka',        price: 28000n, gst: 5, food: FoodType.VEG },
    { id: 'mi-dal-makhani',     catIdx: 1, name: 'Dal Makhani',         price: 22000n, gst: 5, food: FoodType.VEG },
    { id: 'mi-butter-chicken',  catIdx: 1, name: 'Butter Chicken',      price: 35000n, gst: 5, food: FoodType.NON_VEG },
    { id: 'mi-veg-biryani',     catIdx: 1, name: 'Veg Biryani',         price: 25000n, gst: 5, food: FoodType.VEG },
    { id: 'mi-chicken-biryani', catIdx: 1, name: 'Chicken Biryani',     price: 32000n, gst: 5, food: FoodType.NON_VEG },
    { id: 'mi-lassi',           catIdx: 2, name: 'Sweet Lassi',         price:  8000n, gst: 5, food: FoodType.VEG },
    { id: 'mi-chai',            catIdx: 2, name: 'Masala Chai',         price:  3000n, gst: 5, food: FoodType.VEG },
  ]

  for (const item of menuItems) {
    const cat = categories[item.catIdx]
    if (!cat) continue
    await prisma.menuItem.upsert({
      where: { id: item.id },
      update: {},
      create: {
        id: item.id,
        tenantId: tenant.id,
        categoryId: cat.id,
        name: item.name,
        priceInPaise: item.price,
        gstRate: item.gst,
        foodType: item.food,
      },
    })
  }

  console.log(`Menu: ${menuItems.length} items seeded`)

  // Inventory items
  const inventoryItems = [
    { name: 'Paneer',           unit: InventoryUnit.KG,    stock: 5.0,  low: 1.0 },
    { name: 'Chicken',          unit: InventoryUnit.KG,    stock: 10.0, low: 2.0 },
    { name: 'Basmati Rice',     unit: InventoryUnit.KG,    stock: 25.0, low: 5.0 },
    { name: 'Dal (Urad)',       unit: InventoryUnit.KG,    stock: 8.0,  low: 2.0 },
    { name: 'Cooking Oil',      unit: InventoryUnit.LITRE, stock: 10.0, low: 2.0 },
    { name: 'Onion',            unit: InventoryUnit.KG,    stock: 15.0, low: 3.0 },
    { name: 'Tomato',           unit: InventoryUnit.KG,    stock: 10.0, low: 2.0 },
    { name: 'Milk',             unit: InventoryUnit.LITRE, stock: 20.0, low: 5.0 },
  ]

  for (const inv of inventoryItems) {
    await prisma.inventoryItem.upsert({
      where: { tenantId_name: { tenantId: tenant.id, name: inv.name } },
      update: {},
      create: {
        tenantId: tenant.id,
        name: inv.name,
        unit: inv.unit,
        currentStock: inv.stock,
        lowStockThreshold: inv.low,
      },
    })
  }

  console.log(`Inventory: ${inventoryItems.length} items seeded`)

  // Tenant settings
  await prisma.tenantSettings.upsert({
    where: { tenantId: tenant.id },
    update: {},
    create: {
      tenantId: tenant.id,
      serviceChargePercent: 0,
      roundOffBill: true,
      printKOTAutomatically: true,
      whatsappReceipts: false,
      nightlySummaryPhone: owner.phone,
      nightlySummaryTime: '23:30',
    },
  })

  console.log('Seed complete.')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
