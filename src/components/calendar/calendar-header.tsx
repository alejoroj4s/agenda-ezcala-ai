'use client'

import { addDays, addMonths, addWeeks, format, subDays, subMonths, subWeeks } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarPlus, ChevronLeft, ChevronRight, KeyRound, LogOut, Settings } from 'lucide-react'

import { AppLogo } from '@/components/app-logo'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import type { CalendarView, UserProfile } from '@/types'
import { getInitials } from '@/lib/utils'

interface CalendarHeaderProps {
  currentDate: Date
  view: CalendarView
  loading?: boolean
  user: UserProfile
  onDateChange: (date: Date) => void
  onViewChange: (view: CalendarView) => void
  onCreateEvent: () => void
  onOpenTokens: () => void
  onLogout: () => void
}

function shiftDate(date: Date, view: CalendarView, direction: 'prev' | 'next') {
  if (view === 'month') return direction === 'prev' ? subMonths(date, 1) : addMonths(date, 1)
  if (view === 'week' || view === 'list') return direction === 'prev' ? subWeeks(date, 1) : addWeeks(date, 1)
  return direction === 'prev' ? subDays(date, 1) : addDays(date, 1)
}

function getDateLabel(date: Date, view: CalendarView) {
  if (view === 'month') return format(date, 'MMMM yyyy', { locale: es })
  if (view === 'week') {
    const start = subDays(date, date.getDay())
    const end = addDays(start, 6)
    return `${format(start, 'd MMM', { locale: es })} – ${format(end, 'd MMM yyyy', { locale: es })}`
  }
  if (view === 'day') return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })
  return `Próximos eventos desde ${format(date, 'd MMM', { locale: es })}`
}

export function CalendarHeader({
  currentDate,
  view,
  user,
  onDateChange,
  onViewChange,
  onCreateEvent,
  onOpenTokens,
  onLogout,
}: CalendarHeaderProps) {
  return (
    <header className="flex items-center gap-4 border-b bg-background px-4 py-3">
      {/* Logo */}
      <AppLogo className="shrink-0" />

      <div className="mx-2 h-6 w-px bg-border shrink-0" />

      {/* Date navigation */}
      <div className="flex items-center gap-1.5">
        <Button variant="outline" size="sm" onClick={() => onDateChange(new Date())}>
          Hoy
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => onDateChange(shiftDate(currentDate, view, 'prev'))}>
          <ChevronLeft className="size-4" />
        </Button>
        <Button variant="ghost" size="icon" className="size-8" onClick={() => onDateChange(shiftDate(currentDate, view, 'next'))}>
          <ChevronRight className="size-4" />
        </Button>
        <h1 className="min-w-[200px] text-base font-semibold capitalize">{getDateLabel(currentDate, view)}</h1>
      </div>

      {/* Spacer */}
      <div className="flex-1" />

      {/* View tabs */}
      <Tabs value={view} onValueChange={(next) => onViewChange(next as CalendarView)}>
        <TabsList className="h-8">
          <TabsTrigger value="month" className="text-xs px-3">Mes</TabsTrigger>
          <TabsTrigger value="week" className="text-xs px-3">Semana</TabsTrigger>
          <TabsTrigger value="day" className="text-xs px-3">Día</TabsTrigger>
          <TabsTrigger value="list" className="text-xs px-3">Lista</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* New event */}
      <Button size="sm" onClick={onCreateEvent}>
        <CalendarPlus className="size-4" />
        Nuevo evento
      </Button>

      {/* User dropdown */}
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-9 w-9 rounded-full p-0">
            <Avatar className="size-9 cursor-pointer ring-2 ring-primary/20 hover:ring-primary/50 transition-all">
              <AvatarFallback className="bg-primary text-primary-foreground text-sm font-semibold">
                {getInitials(user.name)}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end" forceMount>
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user.name}</p>
              <p className="text-xs leading-none text-muted-foreground">{user.email}</p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onOpenTokens}>
            <Settings className="mr-2 size-4" />
            Configuración API
            <KeyRound className="ml-auto size-3 text-muted-foreground" />
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={onLogout} className="text-destructive focus:text-destructive">
            <LogOut className="mr-2 size-4" />
            Cerrar sesión
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </header>
  )
}
