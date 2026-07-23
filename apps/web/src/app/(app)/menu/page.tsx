'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useState, useMemo, useRef, useEffect, useCallback } from 'react'
import {
  Plus, Search, Edit2, Trash2, Check, X, Star, ChevronRight,
  SlidersHorizontal, ImageIcon,
} from 'lucide-react'
import { useMenuCategories, useMenuItems } from '@/hooks/use-menu'
import {
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateMenuItem, useUpdateMenuItem, useToggleItemAvailability, useDeleteMenuItem,
  type MenuItemPayload,
} from '@/hooks/use-menu-management'
import { FoodTypeDot } from '@/components/pos/food-type-dot'
import { ImageUpload } from '@/components/ui/image-upload'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { FoodType, MenuCategory, MenuItem } from '@/lib/api-types'

// ─── Constants ────────────────────────────────────────────────────────────────

const GST_RATES = [0, 5, 12, 18, 28] as const

const FOOD_TYPES: { value: FoodType; label: string; color: string }[] = [
  { value: 'VEG',     label: 'Veg',     color: '#22c55e' },
  { value: 'NON_VEG', label: 'Non-veg', color: '#ef4444' },
  { value: 'EGG',     label: 'Egg',     color: '#f59e0b' },
  { value: 'VEGAN',   label: 'Vegan',   color: '#8b5cf6' },
]

const FOOD_TYPE_BG: Record<FoodType, string> = {
  VEG:     'linear-gradient(135deg, #064e3b 0%, #065f46 50%, #0f766e 100%)',
  NON_VEG: 'linear-gradient(135deg, #450a0a 0%, #7f1d1d 50%, #991b1b 100%)',
  EGG:     'linear-gradient(135deg, #451a03 0%, #78350f 50%, #92400e 100%)',
  VEGAN:   'linear-gradient(135deg, #1e1b4b 0%, #3730a3 50%, #4338ca 100%)',
}

function fmt(paise: number) {
  return (paise / 100).toLocaleString('en-IN', { minimumFractionDigits: 0 })
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const allowed = useRequireRole(['OWNER', 'MANAGER'])
  const [activeCatId, setActiveCatId] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [foodFilter, setFoodFilter] = useState<FoodType | 'all'>('all')
  const [dialogItem, setDialogItem] = useState<MenuItem | 'new' | null>(null)

  const { data: categories = [], isLoading: catsLoading } = useMenuCategories()
  const { data: items = [], isLoading: itemsLoading } = useMenuItems(
    activeCatId === 'all'
      ? { search: search || undefined, limit: 300 }
      : { categoryId: activeCatId, search: search || undefined, limit: 300 },
  )

  const filtered = useMemo(() => {
    if (foodFilter === 'all') return items
    return items.filter((i) => i.foodType === foodFilter)
  }, [items, foodFilter])

  const grouped = useMemo(() => {
    if (activeCatId !== 'all') return null
    const map = new Map<string, MenuItem[]>()
    filtered.forEach((item) => {
      const list = map.get(item.categoryId) ?? []
      list.push(item)
      map.set(item.categoryId, list)
    })
    return categories
      .filter((c) => map.has(c.id))
      .map((c) => ({ category: c, items: map.get(c.id)! }))
  }, [activeCatId, filtered, categories])

  const defaultCategoryId =
    activeCatId !== 'all' ? activeCatId : (categories[0]?.id ?? '')

  if (!allowed) return null

  return (
    <div className="flex h-[calc(100dvh-56px)] -m-6 overflow-hidden">

      {/* ── Category rail ────────────────────────────────────────────── */}
      <div className="flex flex-col w-[120px] sm:w-[180px] md:w-[220px] shrink-0 border-r border-border bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border shrink-0">
          <h2 className="text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
            Categories
          </h2>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {catsLoading ? (
            <div className="flex justify-center py-8"><Spinner size="sm" /></div>
          ) : (
            <>
              <CatRow
                label="All items"
                count={items.length}
                active={activeCatId === 'all'}
                onClick={() => setActiveCatId('all')}
              />
              {categories.map((cat) => (
                <EditableCatRow
                  key={cat.id}
                  cat={cat}
                  active={activeCatId === cat.id}
                  onClick={() => setActiveCatId(cat.id)}
                />
              ))}
            </>
          )}
        </div>

        <div className="p-3 border-t border-border shrink-0">
          <AddCategoryInline />
        </div>
      </div>

      {/* ── Main area ────────────────────────────────────────────────── */}
      <div className="flex flex-col flex-1 min-w-0 overflow-hidden">

        {/* Toolbar */}
        <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0 bg-background">
          <div className="relative flex-1 max-w-sm">
            <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <Input
              placeholder="Search items…"
              className="pl-8 h-9 text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          {/* Food type filter pills */}
          <div className="hidden md:flex items-center gap-1.5 flex-wrap">
            <button
              type="button"
              onClick={() => setFoodFilter('all')}
              className={cn(
                'px-3 py-1 rounded-full text-[11px] font-semibold transition-all border',
                foodFilter === 'all'
                  ? 'bg-foreground text-background border-foreground'
                  : 'border-border text-muted-foreground hover:text-foreground',
              )}
            >
              All
            </button>
            {FOOD_TYPES.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setFoodFilter(ft.value === foodFilter ? 'all' : ft.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-semibold transition-all border',
                  foodFilter === ft.value
                    ? 'text-white border-transparent'
                    : 'border-border text-muted-foreground hover:text-foreground',
                )}
                style={
                  foodFilter === ft.value
                    ? { backgroundColor: ft.color, borderColor: ft.color }
                    : {}
                }
              >
                <FoodTypeDot type={ft.value} />
                {ft.label}
              </button>
            ))}
          </div>

          <div className="ml-auto shrink-0">
            <Button size="sm" onClick={() => setDialogItem('new')}>
              <Plus size={13} /> Add Item
            </Button>
          </div>
        </div>

        {/* Grid / grouped view */}
        <div className="flex-1 overflow-y-auto p-5">
          {itemsLoading ? (
            <div className="flex justify-center py-16">
              <Spinner size="lg" className="text-primary-500" />
            </div>
          ) : filtered.length === 0 ? (
            <EmptyState search={search} onAdd={() => setDialogItem('new')} />
          ) : grouped ? (
            <div className="space-y-8">
              {grouped.map(({ category, items: catItems }) => (
                <div key={category.id}>
                  {/* Section header */}
                  <div className="flex items-center gap-3 mb-3">
                    <h3 className="text-sm font-bold text-foreground">{category.name}</h3>
                    <span className="text-[11px] text-muted-foreground border border-border px-2 py-0.5 rounded-full">
                      {catItems.length}
                    </span>
                    <div className="flex-1 h-px bg-border" />
                    <button
                      type="button"
                      onClick={() => setActiveCatId(category.id)}
                      className="text-[11px] text-muted-foreground hover:text-primary-500 transition-colors flex items-center gap-0.5 shrink-0"
                    >
                      View all <ChevronRight size={11} />
                    </button>
                  </div>

                  <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-3">
                    {catItems.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onEdit={() => setDialogItem(item)}
                      />
                    ))}
                    <AddItemPlaceholder
                      onClick={() => {
                        setActiveCatId(category.id)
                        setDialogItem('new')
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-[repeat(auto-fill,minmax(196px,1fr))] gap-3">
              {filtered.map((item) => (
                <ItemCard key={item.id} item={item} onEdit={() => setDialogItem(item)} />
              ))}
              <AddItemPlaceholder onClick={() => setDialogItem('new')} />
            </div>
          )}
        </div>
      </div>

      {/* ── Item dialog ───────────────────────────────────────────────── */}
      {dialogItem !== null && (
        <ItemDialog
          item={dialogItem === 'new' ? undefined : dialogItem}
          defaultCategoryId={defaultCategoryId}
          categories={categories}
          onClose={() => setDialogItem(null)}
        />
      )}
    </div>
  )
}

// ─── Category rail ─────────────────────────────────────────────────────────────

function CatRow({
  label, count, active, onClick,
}: {
  label: string; count?: number; active: boolean; onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100',
        active
          ? 'bg-primary-500/10 text-primary-500 font-semibold border-r-2 border-primary-500'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/3',
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && (
        <span className="text-[11px] opacity-60 shrink-0 ml-2">{count}</span>
      )}
    </button>
  )
}

function EditableCatRow({
  cat, active, onClick,
}: {
  cat: MenuCategory; active: boolean; onClick: () => void
}) {
  const [editing, setEditing] = useState(false)
  const [name, setName] = useState(cat.name)
  const updateCat = useUpdateCategory()
  const deleteCat = useDeleteCategory()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (editing) inputRef.current?.focus() }, [editing])

  const commit = () => {
    if (name.trim() && name.trim() !== cat.name) {
      updateCat.mutate({ id: cat.id, name: name.trim() })
    } else {
      setName(cat.name)
    }
    setEditing(false)
  }

  if (editing) {
    return (
      <div className="flex items-center gap-1 px-3 py-1.5">
        <Input
          ref={inputRef}
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-7 text-sm flex-1"
          onKeyDown={(e) => {
            if (e.key === 'Enter') commit()
            if (e.key === 'Escape') { setName(cat.name); setEditing(false) }
          }}
        />
        <button type="button" onClick={commit} className="text-success p-1"><Check size={13} /></button>
        <button type="button" onClick={() => { setName(cat.name); setEditing(false) }} className="text-muted-foreground p-1"><X size={13} /></button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex items-center px-4 py-2.5 transition-colors duration-100 cursor-pointer',
        active
          ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500'
          : 'text-muted-foreground hover:text-foreground hover:bg-white/3',
      )}
      onClick={onClick}
    >
      <span className="flex-1 text-sm font-medium truncate">{cat.name}</span>
      <div className="hidden group-hover:flex items-center gap-0.5 shrink-0">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); setEditing(true) }}
          className="p-1 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground"
        >
          <Edit2 size={11} />
        </button>
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            if (window.confirm(`Delete category "${cat.name}"? Items will not be deleted.`)) {
              deleteCat.mutate(cat.id)
            }
          }}
          className="p-1 rounded hover:bg-danger/20 text-muted-foreground hover:text-danger"
        >
          <Trash2 size={11} />
        </button>
      </div>
    </div>
  )
}

function AddCategoryInline() {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const createCat = useCreateCategory()
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => { if (open) inputRef.current?.focus() }, [open])

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) return
    await createCat.mutateAsync({ name: name.trim() })
    setName('')
    setOpen(false)
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="w-full flex items-center gap-2 text-xs text-muted-foreground hover:text-primary-500 transition-colors py-1"
      >
        <Plus size={12} /> Add category
      </button>
    )
  }

  return (
    <form onSubmit={submit} className="flex items-center gap-1">
      <Input
        ref={inputRef}
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Category name…"
        className="h-7 text-sm flex-1"
      />
      <button type="submit" disabled={createCat.isPending} className="text-success p-1"><Check size={13} /></button>
      <button type="button" onClick={() => { setName(''); setOpen(false) }} className="text-muted-foreground p-1"><X size={13} /></button>
    </form>
  )
}

// ─── Item card ────────────────────────────────────────────────────────────────

function ItemCard({ item, onEdit }: { item: MenuItem; onEdit: () => void }) {
  const toggle = useToggleItemAvailability()
  const deleteItem = useDeleteMenuItem()

  return (
    <div
      className={cn(
        'group relative flex flex-col rounded-xl border bg-card overflow-hidden transition-all duration-150',
        item.isAvailable ? 'border-border' : 'border-border/40 opacity-60',
        'hover:border-primary-500/30 hover:shadow-[0_4px_20px_rgba(0,0,0,0.12)]',
      )}
    >
      {/* Image area */}
      <div className="relative h-[148px] shrink-0 overflow-hidden bg-background-card">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-[1.04]"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ background: FOOD_TYPE_BG[item.foodType] }}
          >
            <ImageIcon size={28} className="text-white/15" />
          </div>
        )}

        {/* Food type dot — bottom-left overlay */}
        <div className="absolute bottom-2 left-2.5">
          <FoodTypeDot type={item.foodType} />
        </div>

        {/* Featured badge — top-right overlay */}
        {item.isFeatured && (
          <div className="absolute top-2 right-2">
            <span className="flex items-center gap-0.5 bg-black/55 backdrop-blur-sm rounded-full px-2 py-0.5 text-[10px] font-bold text-warning">
              <Star size={9} className="fill-warning text-warning" /> Featured
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-col px-3 pt-2.5 pb-2 flex-1">
        <p className="text-[13px] font-semibold text-foreground line-clamp-2 leading-snug">
          {item.name}
        </p>

        <div className="flex items-baseline gap-2 mt-auto pt-2">
          <span className="text-primary-500 font-bold text-sm tabular-nums">
            ₹ {fmt(item.priceInPaise)}
          </span>
          {item.variants.length > 0 && (
            <span className="text-[10px] text-muted-foreground">
              +{item.variants.length} sizes
            </span>
          )}
        </div>
        {item.gstRate > 0 && (
          <p className="text-[10px] text-muted-foreground">
            GST {item.gstRate}%{item.isGSTInclusive ? ' incl.' : ' excl.'}
          </p>
        )}
      </div>

      {/* Hover action bar */}
      <div
        className={cn(
          'flex items-center justify-between px-3 py-2 border-t transition-all duration-150',
          'border-border/0 opacity-0 translate-y-1',
          'group-hover:border-border group-hover:opacity-100 group-hover:translate-y-0',
        )}
      >
        <button
          type="button"
          onClick={() => toggle.mutate({ id: item.id, isAvailable: !item.isAvailable })}
          className={cn(
            'flex items-center gap-1.5 text-[11px] font-semibold px-2 py-1 rounded-md transition-colors',
            item.isAvailable
              ? 'text-success hover:bg-success/10'
              : 'text-muted-foreground hover:bg-white/5',
          )}
        >
          <span
            className={cn(
              'w-1.5 h-1.5 rounded-full shrink-0',
              item.isAvailable ? 'bg-success' : 'bg-muted-foreground',
            )}
          />
          {item.isAvailable ? 'Available' : 'Off menu'}
        </button>

        <div className="flex items-center gap-0.5">
          <button
            type="button"
            onClick={onEdit}
            className="p-1.5 rounded-md hover:bg-white/8 text-muted-foreground hover:text-foreground transition-colors"
          >
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => {
              if (window.confirm(`Remove "${item.name}" from the menu?`)) deleteItem.mutate(item.id)
            }}
            className="p-1.5 rounded-md hover:bg-danger/15 text-muted-foreground hover:text-danger transition-colors"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

function AddItemPlaceholder({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border min-h-[220px] text-muted-foreground hover:text-primary-500 hover:border-primary-500/40 hover:bg-primary-500/3 transition-all duration-150 gap-2"
    >
      <div className="w-9 h-9 rounded-full border-2 border-dashed border-current flex items-center justify-center">
        <Plus size={16} />
      </div>
      <span className="text-xs font-medium">Add item</span>
    </button>
  )
}

function EmptyState({ search, onAdd }: { search: string; onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-24 gap-4 text-muted-foreground">
      <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center">
        <SlidersHorizontal size={28} className="opacity-40" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-foreground">
          {search ? `No results for "${search}"` : 'No items yet'}
        </p>
        <p className="text-xs mt-1">
          {search ? 'Try a different search term' : 'Add your first menu item to get started'}
        </p>
      </div>
      {!search && (
        <Button size="sm" onClick={onAdd}><Plus size={13} /> Add first item</Button>
      )}
    </div>
  )
}

// ─── Item dialog (create / edit) ──────────────────────────────────────────────

interface VariantRow { id?: string; name: string; priceInPaise: number; isDefault: boolean }

interface ItemDialogProps {
  item?: MenuItem
  defaultCategoryId: string
  categories: MenuCategory[]
  onClose: () => void
}

function ItemDialog({ item, defaultCategoryId, categories, onClose }: ItemDialogProps) {
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()

  const [imageUrl, setImageUrl] = useState<string | null>(item?.imageUrl ?? null)
  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCategoryId)
  const [foodType, setFoodType] = useState<FoodType>(item?.foodType ?? 'VEG')
  const [priceStr, setPriceStr] = useState(item ? fmt(item.priceInPaise) : '')
  const [gstRate, setGstRate] = useState<0 | 5 | 12 | 18 | 28>(item?.gstRate ?? 5)
  const [isGSTInclusive, setIsGSTInclusive] = useState(item?.isGSTInclusive ?? true)
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true)
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured ?? false)
  const [variants, setVariants] = useState<VariantRow[]>(
    item?.variants.map((v) => ({
      id: v.id, name: v.name, priceInPaise: v.priceInPaise, isDefault: v.isDefault,
    })) ?? [],
  )
  const [newVarName, setNewVarName] = useState('')
  const [newVarPrice, setNewVarPrice] = useState('')

  const isPending = createItem.isPending || updateItem.isPending

  const addVariant = () => {
    if (!newVarName.trim()) return
    const paise = Math.round(parseFloat(newVarPrice || '0') * 100)
    setVariants((v) => [...v, { name: newVarName.trim(), priceInPaise: paise, isDefault: v.length === 0 }])
    setNewVarName('')
    setNewVarPrice('')
  }

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      const paise = Math.round(parseFloat(priceStr) * 100)
      if (!name.trim() || !categoryId || isNaN(paise) || paise <= 0) return

      const payload: MenuItemPayload = {
        categoryId,
        name: name.trim(),
        description: description.trim() || undefined,
        imageUrl: imageUrl ?? undefined,
        priceInPaise: paise,
        gstRate,
        isGSTInclusive,
        foodType,
        isAvailable,
        isFeatured,
        variants:
          variants.length > 0
            ? variants.map((v) => ({ name: v.name, priceInPaise: v.priceInPaise, isDefault: v.isDefault }))
            : undefined,
      }

      if (item) {
        await updateItem.mutateAsync({ id: item.id, ...payload })
      } else {
        await createItem.mutateAsync(payload)
      }
      onClose()
    },
    [name, categoryId, priceStr, description, imageUrl, gstRate, isGSTInclusive,
     foodType, isAvailable, isFeatured, variants, item, createItem, updateItem, onClose],
  )

  // Close on Escape
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose() }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl max-h-[90dvh] flex flex-col rounded-2xl border border-border bg-background shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border shrink-0">
          <h2 className="text-base font-bold">{item ? 'Edit Item' : 'New Menu Item'}</h2>
          <button
            type="button"
            onClick={onClose}
            className="text-muted-foreground hover:text-foreground p-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            <X size={16} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="flex-1 overflow-y-auto">

            {/* Row 1: Image + core fields */}
            <div className="grid grid-cols-[200px_1fr] gap-6 p-6 border-b border-border">
              {/* Image upload */}
              <div className="space-y-2">
                <Label className="text-xs">Photo</Label>
                <ImageUpload
                  value={imageUrl}
                  onChange={setImageUrl}
                  folder="menu"
                  aspectRatio="square"
                  className="w-full"
                />
                <p className="text-[10px] text-muted-foreground text-center">
                  Square photos look best · max 5 MB
                </p>
              </div>

              {/* Core fields */}
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Category</Label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <Label>Item name <span className="text-danger">*</span></Label>
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Butter Chicken"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Description</Label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={2}
                    placeholder="Short description (optional)…"
                    className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>Food type</Label>
                  <div className="flex gap-2 flex-wrap">
                    {FOOD_TYPES.map((ft) => (
                      <button
                        key={ft.value}
                        type="button"
                        onClick={() => setFoodType(ft.value)}
                        className={cn(
                          'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                          foodType === ft.value
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                            : 'border-border text-muted-foreground hover:border-primary-500/40',
                        )}
                      >
                        <FoodTypeDot type={ft.value} /> {ft.label}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* Row 2: Pricing + toggles */}
            <div className="p-6 border-b border-border space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Price (₹) <span className="text-danger">*</span></Label>
                  <Input
                    type="number"
                    step="0.01"
                    min="0.01"
                    value={priceStr}
                    onChange={(e) => setPriceStr(e.target.value)}
                    placeholder="0.00"
                    className="font-mono"
                    required
                  />
                </div>

                <div className="space-y-1.5">
                  <Label>GST rate</Label>
                  <div className="flex gap-1.5 flex-wrap">
                    {GST_RATES.map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setGstRate(r)}
                        className={cn(
                          'px-2.5 py-1 rounded-md text-[11px] font-bold border transition-all',
                          gstRate === r
                            ? 'border-primary-500 bg-primary-500/10 text-primary-500'
                            : 'border-border text-muted-foreground hover:border-primary-500/30',
                        )}
                      >
                        {r}%
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-6 flex-wrap">
                <ToggleField label="GST-inclusive price" checked={isGSTInclusive} onChange={setIsGSTInclusive} />
                <ToggleField label="Available on menu" checked={isAvailable} onChange={setIsAvailable} />
                <ToggleField label="Featured item" checked={isFeatured} onChange={setIsFeatured} />
              </div>
            </div>

            {/* Row 3: Variants */}
            <div className="p-6 space-y-3">
              <Label>
                Variants
                <span className="ml-2 text-[11px] text-muted-foreground font-normal">
                  optional — e.g. Half / Full
                </span>
              </Label>

              {variants.length > 0 && (
                <div className="space-y-1.5">
                  {variants.map((v, i) => (
                    <div key={i} className="flex items-center gap-3 px-3 py-2 rounded-lg bg-background border border-border">
                      <span className="flex-1 text-sm">{v.name}</span>
                      <span className="font-mono text-sm text-primary-500 tabular-nums">₹ {fmt(v.priceInPaise)}</span>
                      {v.isDefault && <Badge variant="muted" className="text-[9px]">Default</Badge>}
                      <button
                        type="button"
                        onClick={() => setVariants((prev) => prev.filter((_, idx) => idx !== i))}
                        className="text-muted-foreground hover:text-danger"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="flex gap-2">
                <Input
                  value={newVarName}
                  onChange={(e) => setNewVarName(e.target.value)}
                  placeholder="Name (e.g. Half)"
                  className="h-8 text-sm flex-1"
                  onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariant() } }}
                />
                <Input
                  type="number"
                  value={newVarPrice}
                  onChange={(e) => setNewVarPrice(e.target.value)}
                  placeholder="₹"
                  className="h-8 text-sm w-24 font-mono"
                />
                <Button type="button" variant="ghost" size="icon-sm" onClick={addVariant}>
                  <Plus size={13} />
                </Button>
              </div>
            </div>
          </div>

          {/* Footer */}
          <div className="shrink-0 flex gap-3 px-6 py-4 border-t border-border bg-background">
            <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              className="flex-1"
              disabled={isPending || !name.trim() || !priceStr}
            >
              {isPending ? <Spinner size="xs" /> : item ? 'Save Changes' : 'Add Item'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ToggleField({
  label, checked, onChange,
}: {
  label: string; checked: boolean; onChange: (v: boolean) => void
}) {
  return (
    <label className="flex items-center gap-2.5 cursor-pointer select-none">
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={cn(
          'relative w-8 h-5 rounded-full transition-colors duration-150',
          checked ? 'bg-primary-500' : 'bg-white/15',
        )}
      >
        <span
          className={cn(
            'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150',
            checked ? 'translate-x-3' : 'translate-x-0',
          )}
        />
      </button>
      <span className="text-sm text-muted-foreground">{label}</span>
    </label>
  )
}
