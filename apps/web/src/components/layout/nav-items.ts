export interface NavItem {
  label: string
  href: string
  icon: string        // lucide icon name
  roles?: string[]    // undefined = all roles
  badge?: string
}

export interface NavGroup {
  label: string
  items: NavItem[]
}

export const NAV_GROUPS: NavGroup[] = [
  {
    label: 'Operations',
    items: [
      { label: 'Dashboard',   href: '/dashboard',  icon: 'LayoutDashboard' },
      { label: 'Floor Plan',  href: '/floor',      icon: 'LayoutGrid' },
      { label: 'Orders',      href: '/orders',     icon: 'ClipboardList' },
      { label: 'Billing',     href: '/billing',    icon: 'Receipt' },
      { label: 'Kitchen',     href: '/kds',        icon: 'ChefHat', badge: 'KDS' },
    ],
  },
  {
    label: 'Back Office',
    items: [
      { label: 'Menu',        href: '/menu',       icon: 'UtensilsCrossed', roles: ['OWNER', 'MANAGER'] },
      { label: 'Inventory',   href: '/inventory',  icon: 'Package',         roles: ['OWNER', 'MANAGER'] },
      { label: 'Reports',     href: '/reports',    icon: 'BarChart3',       roles: ['OWNER', 'MANAGER'] },
      { label: 'Aggregators', href: '/aggregators',icon: 'Link',            roles: ['OWNER', 'MANAGER'] },
    ],
  },
  {
    label: 'Settings',
    items: [
      { label: 'Staff',       href: '/staff',      icon: 'Users',           roles: ['OWNER', 'MANAGER'] },
      { label: 'Outlet',      href: '/settings',   icon: 'Settings',        roles: ['OWNER', 'MANAGER'] },
      { label: 'Notifications', href: '/notifications', icon: 'Bell',       roles: ['OWNER', 'MANAGER'] },
    ],
  },
]
