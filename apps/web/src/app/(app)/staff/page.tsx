'use client'

import { useRequireRole } from '@/hooks/use-require-role'
import { useState } from 'react'
import { Users, Plus, KeyRound, Pencil, Trash2, Power, Search } from 'lucide-react'
import {
  useStaff, useCreateStaff, useUpdateStaff,
  useResetPIN, useToggleStaffStatus, useDeleteStaff,
} from '@/hooks/use-staff'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/spinner'
import { cn } from '@/lib/utils'
import { useAuthStore } from '@/lib/auth-store'
import type { StaffMember, UserRole } from '@/lib/api-types'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const ROLE_BADGE: Record<UserRole, { label: string; variant: 'success' | 'warning' | 'info' | 'muted' | 'default' | 'danger' }> = {
  OWNER:              { label: 'Owner',             variant: 'danger'  },
  MANAGER:            { label: 'Manager',           variant: 'warning' },
  CASHIER:            { label: 'Cashier',           variant: 'info'    },
  WAITER:             { label: 'Waiter',            variant: 'default' },
  CHEF:               { label: 'Chef',              variant: 'success' },
  INVENTORY_MANAGER:  { label: 'Inventory Mgr',    variant: 'muted'   },
}

const ALL_ROLES: UserRole[] = ['MANAGER', 'CASHIER', 'WAITER', 'CHEF', 'INVENTORY_MANAGER']

function formatDate(iso: string | null) {
  if (!iso) return 'Never'
  return new Date(iso).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

// ─── Slide-in Panel ───────────────────────────────────────────────────────────

interface PanelProps {
  member?: StaffMember | null
  onClose: () => void
}

function StaffPanel({ member, onClose }: PanelProps) {
  const isEdit = !!member
  const create = useCreateStaff()
  const update = useUpdateStaff()
  const reset  = useResetPIN()

  const [name,  setName]  = useState(member?.name  ?? '')
  const [phone, setPhone] = useState(member?.phone ?? '')
  const [email, setEmail] = useState(member?.email ?? '')
  const [role,  setRole]  = useState<UserRole>(member?.role ?? 'WAITER')
  const [pin,   setPin]   = useState('')
  const [pinMode, setPinMode] = useState(!isEdit)

  const isPending = create.isPending || update.isPending || reset.isPending

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (isEdit) {
      update.mutate({ id: member.id, name, phone, email: email || undefined, role }, {
        onSuccess: () => {
          if (pinMode && pin.length === 4) {
            reset.mutate({ id: member.id, pin }, { onSuccess: onClose })
          } else {
            onClose()
          }
        },
      })
    } else {
      create.mutate({ name, phone, email: email || undefined, role, pin }, { onSuccess: onClose })
    }
  }

  const fieldCls = 'w-full bg-background border border-border rounded-lg px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40'

  return (
    <div className="fixed inset-0 z-50 flex">
      <button type="button" className="flex-1 bg-black/50" onClick={onClose} />
      <aside className="w-[400px] h-full bg-background border-l border-border flex flex-col">
        <div className="flex items-center justify-between px-5 py-4 border-b border-border">
          <h3 className="font-bold text-sm">{isEdit ? 'Edit Staff Member' : 'Add Staff Member'}</h3>
          <button type="button" onClick={onClose} className="text-muted-foreground hover:text-foreground text-lg leading-none">×</button>
        </div>

        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Name</label>
            <input value={name} onChange={e => setName(e.target.value)} required minLength={2}
              placeholder="Full name" className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Phone</label>
            <input value={phone} onChange={e => setPhone(e.target.value)} required
              placeholder="10-digit mobile" pattern="[6-9]\d{9}" className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Email <span className="font-normal opacity-50">(optional)</span></label>
            <input value={email} onChange={e => setEmail(e.target.value)} type="email"
              placeholder="staff@restaurant.com" className={fieldCls} />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Role</label>
            <div className="flex flex-wrap gap-2">
              {ALL_ROLES.map((r) => (
                <button key={r} type="button" onClick={() => setRole(r)}
                  className={cn(
                    'px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors',
                    role === r
                      ? 'bg-primary-500 border-primary-500 text-white'
                      : 'border-border text-muted-foreground hover:border-primary-500/50 hover:text-foreground',
                  )}>
                  {ROLE_BADGE[r].label}
                </button>
              ))}
            </div>
          </div>

          {/* PIN section */}
          {isEdit ? (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Reset PIN</label>
                <button type="button" onClick={() => setPinMode(!pinMode)}
                  className="text-xs text-primary-500 hover:underline">
                  {pinMode ? 'Cancel' : 'Change PIN'}
                </button>
              </div>
              {pinMode && (
                <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                  placeholder="New 4-digit PIN" maxLength={4} className={fieldCls} />
              )}
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">PIN</label>
              <input value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, '').slice(0, 4))}
                required placeholder="4-digit login PIN" maxLength={4} pattern="\d{4}" className={fieldCls} />
            </div>
          )}
        </form>

        <div className="px-5 py-4 border-t border-border flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button className="flex-1" disabled={isPending}
            onClick={(e) => { e.preventDefault(); handleSubmit(e as unknown as React.FormEvent) }}>
            {isPending ? <Spinner size="xs" className="mr-2" /> : null}
            {isEdit ? 'Save Changes' : 'Add Staff'}
          </Button>
        </div>
      </aside>
    </div>
  )
}

// ─── Delete confirm ───────────────────────────────────────────────────────────

function DeleteConfirm({ member, onClose }: { member: StaffMember; onClose: () => void }) {
  const del = useDeleteStaff()
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
      <div className="bg-background-card border border-border rounded-xl p-6 w-80 space-y-4">
        <h3 className="font-bold text-sm">Remove {member.name}?</h3>
        <p className="text-xs text-muted-foreground">This will deactivate their account and revoke login access. This action cannot be undone.</p>
        <div className="flex gap-3">
          <Button variant="ghost" className="flex-1" onClick={onClose}>Cancel</Button>
          <Button variant="danger" className="flex-1" disabled={del.isPending}
            onClick={() => del.mutate(member.id, { onSuccess: onClose })}>
            {del.isPending ? <Spinner size="xs" className="mr-1" /> : null}
            Remove
          </Button>
        </div>
      </div>
    </div>
  )
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function StaffPage() {
  const allowed   = useRequireRole(['OWNER', 'MANAGER'])
  const user      = useAuthStore((s) => s.user)
  const isOwner   = user?.role === 'OWNER'
  const isManager = user?.role === 'MANAGER'
  if (!allowed) return null

  const [search,  setSearch]  = useState('')
  const [panel,   setPanel]   = useState<'add' | StaffMember | null>(null)
  const [deleting, setDeleting] = useState<StaffMember | null>(null)

  const { data, isLoading } = useStaff(search ? { search } : undefined)
  const toggleStatus = useToggleStaffStatus()

  const members = data?.items ?? []

  return (
    <div className="flex flex-col h-full -m-6 bg-background-card">
      {/* Header */}
      <div className="flex items-center justify-between px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="flex items-center gap-3">
          <Users size={18} className="text-primary-500" />
          <span className="text-sm font-bold">Staff</span>
          {data && <Badge variant="muted">{data.pagination.total} members</Badge>}
        </div>
        {(isOwner || isManager) && (
          <Button size="sm" className="gap-2 text-xs" onClick={() => setPanel('add')}>
            <Plus size={13} /> Add Staff
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="px-6 py-3 border-b border-border bg-background shrink-0">
        <div className="relative max-w-xs">
          <Search size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search by name…"
            className="w-full bg-background-card border border-border rounded-lg pl-8 pr-3 py-2 text-sm text-foreground focus:outline-none focus:ring-1 focus:ring-primary-500 placeholder:text-muted-foreground/40"
          />
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-y-auto overflow-x-auto">
        {isLoading ? (
          <div className="flex items-center justify-center h-full">
            <Spinner size="xl" className="text-primary-500" />
          </div>
        ) : members.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-muted-foreground">
            <Users size={48} className="opacity-15" />
            <p className="text-sm font-semibold">{search ? 'No staff match your search.' : 'No staff members yet.'}</p>
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-background/40 sticky top-0">
                <th className="text-left px-6 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Name</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Phone</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Role</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Status</th>
                <th className="text-left px-4 py-3 text-[11px] font-bold text-muted-foreground uppercase tracking-wider">Last Login</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {members.map((m) => {
                const rb = ROLE_BADGE[m.role]
                const isSelf = m.id === user?.id
                return (
                  <tr key={m.id} className="border-b border-border/50 last:border-0 hover:bg-white/[0.02]">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-primary-500/15 text-primary-500 text-xs font-bold flex items-center justify-center shrink-0">
                          {m.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{m.name}</p>
                          {m.email && <p className="text-[11px] text-muted-foreground">{m.email}</p>}
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-muted-foreground tabular-nums">{m.phone}</td>
                    <td className="px-4 py-3.5">
                      <Badge variant={rb.variant}>{rb.label}</Badge>
                    </td>
                    <td className="px-4 py-3.5">
                      <Badge variant={m.isActive ? 'success' : 'muted'}>{m.isActive ? 'Active' : 'Inactive'}</Badge>
                    </td>
                    <td className="px-4 py-3.5 text-xs text-muted-foreground">{formatDate(m.lastLoginAt)}</td>
                    <td className="px-4 py-3.5">
                      {!m.isOwner && !isSelf && (isOwner || isManager) && (
                        <div className="flex items-center gap-1 justify-end">
                          <button type="button" title="Edit"
                            onClick={() => setPanel(m)}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                            <Pencil size={13} />
                          </button>
                          <button type="button" title="Reset PIN"
                            onClick={() => setPanel({ ...m })}
                            className="p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-white/5">
                            <KeyRound size={13} />
                          </button>
                          {isOwner && (
                            <>
                              <button type="button" title={m.isActive ? 'Deactivate' : 'Activate'}
                                disabled={toggleStatus.isPending}
                                onClick={() => toggleStatus.mutate(m.id)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-warning hover:bg-warning/10">
                                <Power size={13} />
                              </button>
                              <button type="button" title="Remove"
                                onClick={() => setDeleting(m)}
                                className="p-1.5 rounded-md text-muted-foreground hover:text-danger hover:bg-danger/10">
                                <Trash2 size={13} />
                              </button>
                            </>
                          )}
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Panels */}
      {panel !== null && (
        <StaffPanel
          member={panel === 'add' ? null : panel}
          onClose={() => setPanel(null)}
        />
      )}
      {deleting && (
        <DeleteConfirm member={deleting} onClose={() => setDeleting(null)} />
      )}
    </div>
  )
}
