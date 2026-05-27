import type { ReactNode } from 'react'

import { AppLogo } from '@/components/app-logo'

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-muted p-6 md:p-10">
      <div className="w-full max-w-md space-y-6">
        <div className="flex justify-center">
          <AppLogo />
        </div>
        <div className="rounded-2xl border bg-card p-8 shadow-sm">{children}</div>
      </div>
    </div>
  )
}
