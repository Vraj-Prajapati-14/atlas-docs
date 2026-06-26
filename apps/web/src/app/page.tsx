/**
 * Root page — redirects authenticated users to dashboard,
 * unauthenticated users to login.
 * In MVP this is a simple redirect; auth state check added in Session 2.
 */

import { redirect } from 'next/navigation'

export default function RootPage() {
  // TODO Session 2: check auth cookie — redirect to /dashboard if logged in
  redirect('/login')
}
