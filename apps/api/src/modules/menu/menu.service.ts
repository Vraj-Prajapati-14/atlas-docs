import { prisma } from '@atlas/db'
import { ConflictError, NotFoundError } from '../../shared/errors.js'
import { buildPagination } from '../../shared/response.js'
import type {
  CreateCategoryInput,
  UpdateCategoryInput,
  CreateItemInput,
  UpdateItemInput,
  ListItemsInput,
  CreateVariantInput,
  UpdateVariantInput,
  CreateAddOnInput,
  UpdateAddOnInput,
} from './menu.schema.js'

// ─── Helpers ─────────────────────────────────────────────────────────────────

async function assertCategoryBelongsToTenant(
  tenantId: string,
  categoryId: string,
): Promise<void> {
  const cat = await prisma.menuCategory.findFirst({
    where: { id: categoryId, tenantId, deletedAt: null },
    select: { id: true },
  })
  if (!cat) throw new NotFoundError('Category', categoryId)
}

async function assertItemBelongsToTenant(
  tenantId: string,
  itemId: string,
): Promise<void> {
  const item = await prisma.menuItem.findFirst({
    where: { id: itemId, tenantId, deletedAt: null },
    select: { id: true },
  })
  if (!item) throw new NotFoundError('Menu item', itemId)
}

// ─── Categories ──────────────────────────────────────────────────────────────

export async function listCategories(tenantId: string) {
  return prisma.menuCategory.findMany({
    where: { tenantId, deletedAt: null },
    orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
    select: {
      id: true,
      name: true,
      description: true,
      imageUrl: true,
      sortOrder: true,
      isActive: true,
      createdAt: true,
      updatedAt: true,
      _count: { select: { items: { where: { deletedAt: null, isAvailable: true } } } },
    },
  })
}

export async function getCategory(tenantId: string, id: string) {
  const cat = await prisma.menuCategory.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      items: {
        where: { deletedAt: null },
        orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
        include: {
          variants: { orderBy: [{ sortOrder: 'asc' }] },
          addOns: { orderBy: [{ sortOrder: 'asc' }] },
        },
      },
    },
  })
  if (!cat) throw new NotFoundError('Category', id)
  return cat
}

export async function createCategory(tenantId: string, data: CreateCategoryInput) {
  try {
    return await prisma.menuCategory.create({
      data: { tenantId, ...data },
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`Category "${data.name}" already exists`)
    }
    throw err
  }
}

export async function updateCategory(
  tenantId: string,
  id: string,
  data: UpdateCategoryInput,
) {
  await assertCategoryBelongsToTenant(tenantId, id)
  try {
    return await prisma.menuCategory.update({ where: { id }, data })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`Category "${data.name}" already exists`)
    }
    throw err
  }
}

export async function deleteCategory(tenantId: string, id: string) {
  await assertCategoryBelongsToTenant(tenantId, id)
  await prisma.menuCategory.update({
    where: { id },
    data: { deletedAt: new Date(), isActive: false },
  })
}

// ─── Items ───────────────────────────────────────────────────────────────────

export async function listItems(tenantId: string, query: ListItemsInput) {
  const { page, limit, categoryId, foodType, isAvailable, search } = query
  const skip = (page - 1) * limit

  const where = {
    tenantId,
    deletedAt: null as null,
    ...(categoryId && { categoryId }),
    ...(foodType && { foodType }),
    ...(isAvailable !== undefined && { isAvailable }),
    ...(search && {
      name: { contains: search, mode: 'insensitive' as const },
    }),
  }

  const [items, total] = await Promise.all([
    prisma.menuItem.findMany({
      where,
      skip,
      take: limit,
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: {
        category: { select: { id: true, name: true } },
        variants: { orderBy: [{ sortOrder: 'asc' }] },
        addOns: { orderBy: [{ sortOrder: 'asc' }] },
      },
    }),
    prisma.menuItem.count({ where }),
  ])

  return { items, pagination: buildPagination(page, limit, total) }
}

export async function getItem(tenantId: string, id: string) {
  const item = await prisma.menuItem.findFirst({
    where: { id, tenantId, deletedAt: null },
    include: {
      category: { select: { id: true, name: true } },
      variants: { orderBy: [{ sortOrder: 'asc' }] },
      addOns: { orderBy: [{ sortOrder: 'asc' }] },
    },
  })
  if (!item) throw new NotFoundError('Menu item', id)
  return item
}

export async function createItem(tenantId: string, data: CreateItemInput) {
  await assertCategoryBelongsToTenant(tenantId, data.categoryId)
  try {
    return await prisma.menuItem.create({
      data: {
        tenantId,
        categoryId: data.categoryId,
        name: data.name,
        description: data.description,
        imageUrl: data.imageUrl,
        priceInPaise: BigInt(data.priceInPaise),
        gstRate: data.gstRate,
        isGSTInclusive: data.isGSTInclusive,
        foodType: data.foodType,
        isAvailable: data.isAvailable,
        isFeatured: data.isFeatured,
        sortOrder: data.sortOrder,
      },
      include: {
        category: { select: { id: true, name: true } },
        variants: true,
        addOns: true,
      },
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`Item "${data.name}" already exists in this category`)
    }
    throw err
  }
}

export async function updateItem(tenantId: string, id: string, data: UpdateItemInput) {
  await assertItemBelongsToTenant(tenantId, id)
  if (data.categoryId) {
    await assertCategoryBelongsToTenant(tenantId, data.categoryId)
  }
  try {
    return await prisma.menuItem.update({
      where: { id },
      data: {
        ...data,
        ...(data.priceInPaise !== undefined
          ? { priceInPaise: BigInt(data.priceInPaise) }
          : {}),
      },
      include: {
        category: { select: { id: true, name: true } },
        variants: { orderBy: [{ sortOrder: 'asc' }] },
        addOns: { orderBy: [{ sortOrder: 'asc' }] },
      },
    })
  } catch (err: unknown) {
    if (isPrismaUniqueError(err)) {
      throw new ConflictError(`Item "${data.name}" already exists in this category`)
    }
    throw err
  }
}

export async function deleteItem(tenantId: string, id: string) {
  await assertItemBelongsToTenant(tenantId, id)
  await prisma.menuItem.update({
    where: { id },
    data: { deletedAt: new Date(), isAvailable: false },
  })
}

// ─── Variants ────────────────────────────────────────────────────────────────

export async function createVariant(
  tenantId: string,
  itemId: string,
  data: CreateVariantInput,
) {
  await assertItemBelongsToTenant(tenantId, itemId)

  // Enforce single default: unset existing default if new one is flagged
  if (data.isDefault) {
    await prisma.menuItemVariant.updateMany({
      where: { menuItemId: itemId, isDefault: true },
      data: { isDefault: false },
    })
  }

  return prisma.menuItemVariant.create({
    data: {
      menuItemId: itemId,
      name: data.name,
      priceInPaise: BigInt(data.priceInPaise),
      isDefault: data.isDefault,
      sortOrder: data.sortOrder,
    },
  })
}

export async function updateVariant(
  tenantId: string,
  itemId: string,
  variantId: string,
  data: UpdateVariantInput,
) {
  await assertItemBelongsToTenant(tenantId, itemId)

  const variant = await prisma.menuItemVariant.findFirst({
    where: { id: variantId, menuItemId: itemId },
    select: { id: true },
  })
  if (!variant) throw new NotFoundError('Variant', variantId)

  if (data.isDefault) {
    await prisma.menuItemVariant.updateMany({
      where: { menuItemId: itemId, isDefault: true, NOT: { id: variantId } },
      data: { isDefault: false },
    })
  }

  return prisma.menuItemVariant.update({
    where: { id: variantId },
    data: {
      ...data,
      ...(data.priceInPaise !== undefined
        ? { priceInPaise: BigInt(data.priceInPaise) }
        : {}),
    },
  })
}

export async function deleteVariant(tenantId: string, itemId: string, variantId: string) {
  await assertItemBelongsToTenant(tenantId, itemId)

  const variant = await prisma.menuItemVariant.findFirst({
    where: { id: variantId, menuItemId: itemId },
    select: { id: true },
  })
  if (!variant) throw new NotFoundError('Variant', variantId)

  await prisma.menuItemVariant.delete({ where: { id: variantId } })
}

// ─── Add-ons ─────────────────────────────────────────────────────────────────

export async function createAddOn(
  tenantId: string,
  itemId: string,
  data: CreateAddOnInput,
) {
  await assertItemBelongsToTenant(tenantId, itemId)
  return prisma.menuItemAddOn.create({
    data: {
      menuItemId: itemId,
      name: data.name,
      priceInPaise: BigInt(data.priceInPaise),
      isDefault: data.isDefault,
      sortOrder: data.sortOrder,
    },
  })
}

export async function updateAddOn(
  tenantId: string,
  itemId: string,
  addOnId: string,
  data: UpdateAddOnInput,
) {
  await assertItemBelongsToTenant(tenantId, itemId)

  const addOn = await prisma.menuItemAddOn.findFirst({
    where: { id: addOnId, menuItemId: itemId },
    select: { id: true },
  })
  if (!addOn) throw new NotFoundError('Add-on', addOnId)

  return prisma.menuItemAddOn.update({
    where: { id: addOnId },
    data: {
      ...data,
      ...(data.priceInPaise !== undefined
        ? { priceInPaise: BigInt(data.priceInPaise) }
        : {}),
    },
  })
}

export async function deleteAddOn(tenantId: string, itemId: string, addOnId: string) {
  await assertItemBelongsToTenant(tenantId, itemId)

  const addOn = await prisma.menuItemAddOn.findFirst({
    where: { id: addOnId, menuItemId: itemId },
    select: { id: true },
  })
  if (!addOn) throw new NotFoundError('Add-on', addOnId)

  await prisma.menuItemAddOn.delete({ where: { id: addOnId } })
}

// ─── Internal ────────────────────────────────────────────────────────────────

function isPrismaUniqueError(err: unknown): boolean {
  return (
    typeof err === 'object' &&
    err !== null &&
    'code' in err &&
    (err as { code: string }).code === 'P2002'
  )
}
