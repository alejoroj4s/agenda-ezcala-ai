import type { ReactNode } from 'react'

import { requireSessionUser } from '@/lib/auth'

export default async function AppLayout({ children }: { children: ReactNode }) {
  await requireSessionUser()
  return <>{children}</>
}
