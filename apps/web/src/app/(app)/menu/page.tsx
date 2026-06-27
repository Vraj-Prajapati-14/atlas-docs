'use client'

import { useState, useRef, useEffect } from 'react'
import { Plus, Search, Edit2, Trash2, Check, X, ToggleLeft, ToggleRight, Star, ChevronRight } from 'lucide-react'
import { useMenuCategories, useMenuItems } from '@/hooks/use-menu'
import {
  useCreateCategory, useUpdateCategory, useDeleteCategory,
  useCreateMenuItem, useUpdateMenuItem, useToggleItemAvailability, useDeleteMenuItem,
  type MenuItemPayload,
} from '@/hooks/use-menu-management'
import { FoodTypeDot } from '@/components/pos/food-type-dot'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { FoodType, MenuCategory, MenuItem } from '@/lib/api-types'

// ─── constants ────────────────────────────────────────────────────────────────

const GST_RATES = [0, 5, 12, 18, 28] as const
const FOOD_TYPES: { value: FoodType; label: string }[] = [
  { value: 'VEG',     label: 'Veg' },
  { value: 'NON_VEG', label: 'Non-veg' },
  { value: 'EGG',     label: 'Egg' },
  { value: 'VEGAN',   label: 'Vegan' },
]

function paiseToRupees(p: number) {
  return (p / 100).toFixed(2)
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function MenuPage() {
  const { data: categories = [], isLoading: catsLoading } = useMenuCategories()
  const [activeCatId, setActiveCatId] = useState<string | 'all'>('all')
  const [search, setSearch] = useState('')
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null)
  const [isCreating, setIsCreating] = useState(false)

  // Items for active category (or all if 'all')
  const { data: items = [], isLoading: itemsLoading } = useMenuItems(
    activeCatId === 'all'
      ? { search: search || undefined, limit: 100 }
      : { categoryId: activeCatId, search: search || undefined, limit: 100 },
  )

  const panelOpen = isCreating || !!editingItem

  const handleNewItem = () => {
    setEditingItem(null)
    setIsCreating(true)
  }

  const handleEdit = (item: MenuItem) => {
    setIsCreating(false)
    setEditingItem(item)
  }

  const handleClosePanel = () => {
    setIsCreating(false)
    setEditingItem(null)
  }

  return (
    <div className="flex h-[calc(100dvh-56px)] -m-6 overflow-hidden">

      {/* ── Category rail ──────────────────────────────────────────────── */}
      <div className="flex flex-col w-[220px] shrink-0 border-r border-border bg-background overflow-hidden">
        <div className="px-4 py-3 border-b border-border">
          <h2 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Categories</h2>
        </div>

        <div className="flex-1 overflow-y-auto py-1">
          {catsLoading ? (
            <div className="flex justify-center py-6"><Spinner size="sm" /></div>
          ) : (
            <>
              <CatRow
                label="All items"
                count={undefined}
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

        <div className="p-3 border-t border-border">
          <AddCategoryInline />
        </div>
      </div>

      {/* ── Items area ─────────────────────────────────────────────────── */}
      <div className="flex-1 flex min-w-0 overflow-hidden">

        {/* Items main column */}
        <div className={cn('flex flex-col flex-1 min-w-0 transition-all duration-200', panelOpen && 'opacity-50 pointer-events-none')}>
          {/* Toolbar */}
          <div className="flex items-center gap-3 px-5 py-3 border-b border-border shrink-0">
            <div className="relative flex-1 max-w-xs">
              <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search items…"
                className="pl-8 h-8 text-sm"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Button size="sm" onClick={handleNewItem}>
              <Plus size={13} /> Add Item
            </Button>
          </div>

          {/* Grid */}
          <div className="flex-1 overflow-y-auto p-5">
            {itemsLoading ? (
              <div className="flex justify-center py-12"><Spinner size="lg" className="text-primary-500" /></div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground gap-3">
                <p className="text-sm">No items{search ? ` matching "${search}"` : ' in this category'}</p>
                <Button variant="ghost" size="sm" onClick={handleNewItem}><Plus size={13} /> Add first item</Button>
              </div>
            ) : (
              <div className="grid grid-cols-[repeat(auto-fill,minmax(220px,1fr))] gap-3">
                {items.map((item) => (
                  <ItemCard key={item.id} item={item} onEdit={() => handleEdit(item)} />
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Edit/Create panel */}
        {panelOpen && (
          <div className="w-[400px] shrink-0 border-l border-border bg-background-card overflow-y-auto">
            <ItemPanel
              item={editingItem ?? undefined}
              defaultCategoryId={activeCatId !== 'all' ? activeCatId : (categories[0]?.id ?? '')}
              categories={categories}
              onClose={handleClosePanel}
            />
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Category rows ─────────────────────────────────────────────────────────────

function CatRow({ label, count, active, onClick }: { label: string; count?: number; active: boolean; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'w-full flex items-center justify-between px-4 py-2.5 text-sm transition-colors duration-100',
        active ? 'bg-primary-500/10 text-primary-500 font-semibold border-r-2 border-primary-500' : 'text-muted-foreground hover:text-foreground hover:bg-white/3',
      )}
    >
      <span className="truncate">{label}</span>
      {count !== undefined && <span className="text-[11px] opacity-60 shrink-0 ml-2">{count}</span>}
    </button>
  )
}

function EditableCatRow({ cat, active, onClick }: { cat: MenuCategory; active: boolean; onClick: () => void }) {
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
          onKeyDown={(e) => { if (e.key === 'Enter') commit(); if (e.key === 'Escape') { setName(cat.name); setEditing(false) } }}
        />
        <button type="button" onClick={commit} className="text-success hover:text-success/80 p-1"><Check size={13} /></button>
        <button type="button" onClick={() => { setName(cat.name); setEditing(false) }} className="text-muted-foreground hover:text-foreground p-1"><X size={13} /></button>
      </div>
    )
  }

  return (
    <div
      className={cn(
        'group flex items-center px-4 py-2.5 transition-colors duration-100 cursor-pointer',
        active ? 'bg-primary-500/10 text-primary-500 border-r-2 border-primary-500' : 'text-muted-foreground hover:text-foreground hover:bg-white/3',
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
          onClick={(e) => { e.stopPropagation(); if (window.confirm(`Delete category "${cat.name}"?`)) deleteCat.mutate(cat.id) }}
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
      <Input ref={inputRef} value={name} onChange={(e) => setName(e.target.value)} placeholder="Category name…" className="h-7 text-sm flex-1" />
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
    <div className={cn(
      'group relative flex flex-col rounded-xl border bg-card p-3.5 transition-all duration-150',
      item.isAvailable ? 'border-border' : 'border-border/50 opacity-60',
    )}>
      {/* Top row: food type + featured */}
      <div className="flex items-center justify-between mb-2">
        <FoodTypeDot type={item.foodType} />
        {item.isFeatured && <Star size={11} className="text-warning fill-warning" />}
      </div>

      {/* Name */}
      <p className="text-sm font-semibold text-foreground leading-snug line-clamp-2 mb-1">{item.name}</p>

      {/* Price */}
      <p className="text-primary-500 font-mono font-bold text-sm tabular-nums mt-auto pt-2">
        ₹ {paiseToRupees(item.priceInPaise)}
        {item.variants.length > 0 && <span className="text-[10px] text-muted-foreground font-normal ml-1">+{item.variants.length} var</span>}
      </p>

      {/* GST badge */}
      {item.gstRate > 0 && (
        <span className="text-[10px] text-muted-foreground">GST {item.gstRate}%{item.isGSTInclusive ? ' incl.' : ''}</span>
      )}

      {/* Hover actions */}
      <div className="absolute inset-x-0 bottom-0 flex items-center justify-between px-3 py-2 bg-card rounded-b-xl border-t border-border/0 group-hover:border-border transition-all opacity-0 group-hover:opacity-100">
        <button
          type="button"
          onClick={() => toggle.mutate({ id: item.id, isAvailable: !item.isAvailable })}
          className={cn('flex items-center gap-1 text-[11px] font-semibold transition-colors', item.isAvailable ? 'text-success' : 'text-muted-foreground')}
        >
          {item.isAvailable ? <ToggleRight size={14} /> : <ToggleLeft size={14} />}
          {item.isAvailable ? 'Available' : 'Unavailable'}
        </button>
        <div className="flex items-center gap-1">
          <button type="button" onClick={onEdit} className="p-1.5 rounded hover:bg-white/10 text-muted-foreground hover:text-foreground">
            <Edit2 size={12} />
          </button>
          <button
            type="button"
            onClick={() => { if (window.confirm(`Remove "${item.name}" from the menu?`)) deleteItem.mutate(item.id) }}
            className="p-1.5 rounded hover:bg-danger/20 text-muted-foreground hover:text-danger"
          >
            <Trash2 size={12} />
          </button>
        </div>
      </div>
    </div>
  )
}

// ─── Item create/edit panel ────────────────────────────────────────────────────

interface VariantRow { id?: string; name: string; priceInPaise: number; isDefault: boolean }

interface ItemPanelProps {
  item?: MenuItem
  defaultCategoryId: string
  categories: MenuCategory[]
  onClose: () => void
}

function ItemPanel({ item, defaultCategoryId, categories, onClose }: ItemPanelProps) {
  const createItem = useCreateMenuItem()
  const updateItem = useUpdateMenuItem()

  const [name, setName] = useState(item?.name ?? '')
  const [description, setDescription] = useState(item?.description ?? '')
  const [categoryId, setCategoryId] = useState(item?.categoryId ?? defaultCategoryId)
  const [foodType, setFoodType] = useState<FoodType>(item?.foodType ?? 'VEG')
  const [priceStr, setPriceStr] = useState(item ? paiseToRupees(item.priceInPaise) : '')
  const [gstRate, setGstRate] = useState<0 | 5 | 12 | 18 | 28>(item?.gstRate ?? 5)
  const [isGSTInclusive, setIsGSTInclusive] = useState(item?.isGSTInclusive ?? true)
  const [isAvailable, setIsAvailable] = useState(item?.isAvailable ?? true)
  const [isFeatured, setIsFeatured] = useState(item?.isFeatured ?? false)
  const [variants, setVariants] = useState<VariantRow[]>(
    item?.variants.map((v) => ({ id: v.id, name: v.name, priceInPaise: v.priceInPaise, isDefault: v.isDefault })) ?? [],
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

  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i))

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const paise = Math.round(parseFloat(priceStr) * 100)
    if (!name.trim() || !categoryId || isNaN(paise) || paise <= 0) return

    const payload: MenuItemPayload = {
      categoryId,
      name: name.trim(),
      description: description.trim() || undefined,
      priceInPaise: paise,
      gstRate,
      isGSTInclusive,
      foodType,
      isAvailable,
      isFeatured,
      variants: variants.length > 0 ? variants.map((v) => ({ name: v.name, priceInPaise: v.priceInPaise, isDefault: v.isDefault })) : undefined,
    }

    if (item) {
      await updateItem.mutateAsync({ id: item.id, ...payload })
    } else {
      await createItem.mutateAsync(payload)
    }
    onClose()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col h-full">
      {/* Panel header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-border shrink-0">
        <h2 className="text-sm font-bold">{item ? 'Edit Item' : 'New Item'}</h2>
        <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground p-1"><X size={15} /></button>
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5">

        {/* Category */}
        <div className="space-y-1.5">
          <Label>Category</Label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full h-9 rounded-lg border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30"
          >
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
        </div>

        {/* Name */}
        <div className="space-y-1.5">
          <Label>Item name <span className="text-danger">*</span></Label>
          <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="e.g. Butter Chicken" required />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label>Description</Label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={2}
            placeholder="Optional short description…"
            className="w-full rounded-lg border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary-500/30 resize-none"
          />
        </div>

        {/* Food type */}
        <div className="space-y-1.5">
          <Label>Food type</Label>
          <div className="flex gap-2">
            {FOOD_TYPES.map((ft) => (
              <button
                key={ft.value}
                type="button"
                onClick={() => setFoodType(ft.value)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition-all',
                  foodType === ft.value ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-border text-muted-foreground hover:border-primary-500/40',
                )}
              >
                <FoodTypeDot type={ft.value} /> {ft.label}
              </button>
            ))}
          </div>
        </div>

        {/* Price + GST */}
        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Price (₹) <span className="text-danger">*</span></Label>
            <Input
              type="number"
              step="0.01"
              min="1"
              value={priceStr}
              onChange={(e) => setPriceStr(e.target.value)}
              placeholder="0.00"
              className="font-mono"
            />
          </div>
          <div className="space-y-1.5">
            <Label>GST Rate</Label>
            <div className="flex gap-1 flex-wrap">
              {GST_RATES.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => setGstRate(r)}
                  className={cn(
                    'px-2 py-1 rounded text-[11px] font-bold border transition-all',
                    gstRate === r ? 'border-primary-500 bg-primary-500/10 text-primary-500' : 'border-border text-muted-foreground hover:border-primary-500/30',
                  )}
                >
                  {r}%
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* GST inclusive toggle */}
        <label className="flex items-center gap-3 cursor-pointer select-none">
          <ToggleSwitch checked={isGSTInclusive} onChange={setIsGSTInclusive} />
          <span className="text-sm text-muted-foreground">Price is GST-inclusive</span>
        </label>

        {/* Available + featured */}
        <div className="flex gap-4">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <ToggleSwitch checked={isAvailable} onChange={setIsAvailable} />
            <span className="text-sm text-muted-foreground">Available</span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <ToggleSwitch checked={isFeatured} onChange={setIsFeatured} />
            <span className="text-sm text-muted-foreground">Featured</span>
          </label>
        </div>

        {/* Variants */}
        <div className="space-y-2">
          <Label>Variants <span className="text-[11px] text-muted-foreground font-normal">(optional — e.g. Half / Full)</span></Label>
          {variants.map((v, i) => (
            <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-background border border-border">
              <span className="flex-1 text-sm">{v.name}</span>
              <span className="font-mono text-sm text-primary-500 tabular-nums">₹ {paiseToRupees(v.priceInPaise)}</span>
              {v.isDefault && <Badge variant="muted" className="text-[9px]">Default</Badge>}
              <button type="button" onClick={() => removeVariant(i)} className="text-muted-foreground hover:text-danger"><X size={12} /></button>
            </div>
          ))}
          <div className="flex gap-2">
            <Input
              value={newVarName}
              onChange={(e) => setNewVarName(e.target.value)}
              placeholder="Variant name"
              className="h-8 text-sm flex-1"
              onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addVariant() } }}
            />
            <Input
              type="number"
              value={newVarPrice}
              onChange={(e) => setNewVarPrice(e.target.value)}
              placeholder="₹ price"
              className="h-8 text-sm w-24 font-mono"
            />
            <Button type="button" variant="ghost" size="icon-sm" onClick={addVariant}><Plus size={13} /></Button>
          </div>
        </div>
      </div>

      {/* Footer actions */}
      <div className="shrink-0 flex gap-2 px-5 py-4 border-t border-border">
        <Button type="button" variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? <Spinner size="xs" /> : item ? 'Save Changes' : 'Add Item'}
        </Button>
      </div>
    </form>
  )
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function ToggleSwitch({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        'relative w-8 h-5 rounded-full transition-colors duration-150 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-500',
        checked ? 'bg-primary-500' : 'bg-white/15',
      )}
    >
      <span className={cn(
        'absolute top-0.5 left-0.5 w-4 h-4 rounded-full bg-white shadow-sm transition-transform duration-150',
        checked ? 'translate-x-3' : 'translate-x-0',
      )} />
    </button>
  )
}
