'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useState } from 'react'
import { Users, Plus, Search, Phone, Mail, Star, Pencil } from 'lucide-react'
import { useCustomers, useCreateCustomer, useUpdateCustomer, useCustomerDetail } from '@/hooks/use-customers'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import type { Customer } from '@/lib/api-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmt(paise: number) {
  return `₹${(paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 })}`
}

function fmtDate(iso: string | null) {
  if (!iso) return '—'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Panel ────────────────────────────────────────────────────────────────────

interface PanelProps {
  customer?: Customer | null
  onClose: () => void
}

function CustomerPanel({ customer, onClose }: PanelProps) {
  const isEdit  = !!customer
  const create  = useCreateCustomer()
  const update  = useUpdateCustomer()

  const [name,        setName]        = useState(customer?.name        ?? '')
  const [phone,       setPhone]       = useState(customer?.phone       ?? '')
  const [email,       setEmail]       = useState(customer?.email       ?? '')
  const [companyName, setCompanyName] = useState(customer?.companyName ?? '')
  const [gstin,       setGstin]       = useState(customer?.gstin       ?? '')
  const [address,     setAddress]     = useState(customer?.address     ?? '')

  const isPending = create.isPending || update.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    const body = {
      name,
      phone,
      email:       email || undefined,
      companyName: companyName || undefined,
      gstin:       gstin || undefined,
      address:     address || undefined,
    }
    if (isEdit) {
      update.mutate({ id: customer.id, ...body }, { onSuccess: onClose })
    } else {
      create.mutate(body, { onSuccess: onClose })
    }
  }

  const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="w-[400px] h-full bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm">{isEdit ? 'Edit Customer' : 'Add Customer'}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          {[
            { label: 'Name',         val: name,        set: setName,        req: true,  type: 'text',  placeholder: 'Full name / business name' },
            { label: 'Phone',        val: phone,       set: setPhone,       req: true,  type: 'tel',   placeholder: '10-digit mobile', pattern: '[6-9]\\d{9}' },
            { label: 'Email',        val: email,       set: setEmail,       req: false, type: 'email', placeholder: 'customer@email.com' },
            { label: 'Company',      val: companyName, set: setCompanyName, req: false, type: 'text',  placeholder: 'For B2B customers' },
            { label: 'GSTIN',        val: gstin,       set: setGstin,       req: false, type: 'text',  placeholder: '15-digit GST number' },
            { label: 'Address',      val: address,     set: setAddress,     req: false, type: 'text',  placeholder: 'Delivery / billing address' },
          ].map(({ label, val, set, req, type, placeholder, pattern }) => (
            <div key={label} className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                {label}{!req && <span className="font-normal opacity-50 ml-1">(optional)</span>}
              </label>
              <input
                value={val} onChange={e => set(e.target.value)}
                required={req} type={type} placeholder={placeholder}
                pattern={pattern}
                className={fieldCls}
              />
            </div>
          ))}
        </form>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={isPending} onClick={(e) => handleSubmit(e as unknown as React.FormEvent)}>
            {isPending && <Spinner size="xs" className="mr-2" />}
            {isEdit ? 'Save Changes' : 'Add Customer'}
          </Button>
        </div>
      </aside>
    </div>
  )
}

// ─── Detail drawer ────────────────────────────────────────────────────────────

function CustomerDrawer({ customerId, onClose, onEdit }: { customerId: string; onClose: () => void; onEdit: () => void }) {
  const { data, isLoading } = useCustomerDetail(customerId)

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="w-[480px] h-full bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm">Customer Profile</h3>
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="sm" onClick={onEdit}><Pencil size={13} /></Button>
            <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg">×</button>
          </div>
        </div>

        {isLoading ? (
          <div className="flex-1 flex items-center justify-center"><Spinner size="xl" className="text-primary-500" /></div>
        ) : data ? (
          <div className="flex-1 overflow-y-auto p-5 space-y-5">
            {/* Header */}
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-full bg-primary-500/15 text-primary-500 text-xl font-bold flex items-center justify-center shrink-0">
                {data.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="font-bold text-base">{data.name}</h2>
                {data.companyName && <p className="text-xs text-muted-foreground">{data.companyName}</p>}
                <div className="flex items-center gap-3 mt-1">
                  <span className="flex items-center gap-1 text-xs text-muted-foreground"><Phone size={11}/>{data.phone}</span>
                  {data.email && <span className="flex items-center gap-1 text-xs text-muted-foreground"><Mail size={11}/>{data.email}</span>}
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { label: 'Total Visits',  value: data.totalVisits },
                { label: 'Total Spent',   value: fmt(data.totalSpentPaise) },
                { label: 'Last Visit',    value: fmtDate(data.lastVisitAt) },
              ].map(({ label, value }) => (
                <div key={label} className="bg-background-card border border-border rounded-lg p-3 text-center">
                  <p className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</p>
                  <p className="font-bold text-sm mt-0.5">{value}</p>
                </div>
              ))}
            </div>

            {data.gstin && (
              <div className="bg-background-card border border-border rounded-lg p-3 text-xs">
                <span className="text-muted-foreground">GSTIN: </span>
                <span className="font-mono">{data.gstin}</span>
              </div>
            )}

            {/* Order history */}
            <div>
              <p className="text-xs font-bold uppercase tracking-wide text-muted-foreground mb-3">Order History</p>
              {data.orders.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-6">No orders yet.</p>
              ) : (
                <div className="space-y-2">
                  {data.orders.map((o) => (
                    <div key={o.id} className="flex items-center justify-between bg-background-card border border-border rounded-lg px-3 py-2.5">
                      <div>
                        <p className="text-xs font-semibold">#{o.orderNumber}</p>
                        <p className="text-[11px] text-muted-foreground">{fmtDate(o.createdAt)} · {o.type}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-bold">{o.bill ? fmt(o.bill.grandTotalInPaise) : '—'}</p>
                        <Badge variant={o.bill?.paymentStatus === 'PAID' ? 'success' : 'muted'} className="text-[10px] px-1">
                          {o.bill?.paymentStatus ?? o.status}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        ) : null}
      </aside>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function CustomersPage() {
  const allowed = useRequireRole(['OWNER', 'MANAGER', 'CASHIER'])
  const [search,    setSearch]    = useState('')
  if (!allowed) return null
  const [page,      setPage]      = useState(1)
  const [panel,     setPanel]     = useState<'add' | Customer | null>(null)
  const [detailId,  setDetailId]  = useState<string | null>(null)

  const { data, isLoading } = useCustomers(search ? { search, page } : { page })
  const customers = data?.items ?? []
  const pagination = data?.pagination

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Customers</span>
          {data && <Badge variant="muted">{data.pagination.total} total</Badge>}
        </div>
        <Button size="sm" className="gap-2 text-xs" onClick={() => setPanel('add')}>
          <Plus size={13} /> Add Customer
        </Button>
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
            placeholder="Search by name, phone, email…"
            className="w-full bg-background-card border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full"><Spinner size="xl" className="text-primary-500" /></div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Users size={48} className="opacity-15" />
            <p className="text-sm font-semibold">{search ? 'No customers match your search.' : 'No customers yet.'}</p>
            {!search && <Button size="sm" onClick={() => setPanel('add')}>Add your first customer</Button>}
          </div>
        ) : (
          <table className="w-full text-sm min-w-[600px]">
            <thead>
              <tr className="border-b border-border bg-background/40 sticky top-0">
                {['Customer', 'Phone', 'Visits', 'Total Spent', 'Last Visit', ''].map(h => (
                  <th key={h} className="text-left px-5 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c.id}
                  onClick={() => setDetailId(c.id)}
                  className="border-b border-border/50 last:border-0 hover:bg-white/[0.02] cursor-pointer">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary-500/15 text-primary-500 text-xs font-bold flex items-center justify-center shrink-0">
                        {c.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <p className="font-semibold">{c.name}</p>
                        {c.companyName && <p className="text-[11px] text-muted-foreground">{c.companyName}</p>}
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 text-muted-foreground tabular-nums">{c.phone}</td>
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-1">
                      <Star size={11} className={cn('shrink-0', c.totalVisits >= 10 ? 'text-warning fill-warning' : 'text-muted-foreground/30')} />
                      <span className="tabular-nums">{c.totalVisits}</span>
                    </div>
                  </td>
                  <td className="px-5 py-3.5 font-semibold tabular-nums">{fmt(c.totalSpentPaise)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground">{fmtDate(c.lastVisitAt)}</td>
                  <td className="px-5 py-3.5">
                    <button
                      type="button" title="Edit"
                      onClick={e => { e.stopPropagation(); setPanel(c) }}
                      className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                      <Pencil size={13} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border bg-background shrink-0">
          <p className="text-xs text-muted-foreground">
            Page {pagination.page} of {pagination.totalPages} · {pagination.total} customers
          </p>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" disabled={!pagination.hasPrev} onClick={() => setPage(p => p - 1)}>Previous</Button>
            <Button variant="ghost" size="sm" disabled={!pagination.hasNext} onClick={() => setPage(p => p + 1)}>Next</Button>
          </div>
        </div>
      )}

      {/* Panels */}
      {panel !== null && (
        <CustomerPanel
          customer={panel === 'add' ? null : panel}
          onClose={() => setPanel(null)}
        />
      )}
      {detailId && (
        <CustomerDrawer
          customerId={detailId}
          onClose={() => setDetailId(null)}
          onEdit={() => {
            const c = customers.find(x => x.id === detailId)
            if (c) { setPanel(c); setDetailId(null) }
          }}
        />
      )}
    </div>
  )
}
