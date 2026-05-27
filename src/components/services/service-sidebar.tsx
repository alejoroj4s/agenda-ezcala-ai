'use client'

import { CalendarClock, MoreHorizontal, Plus } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Switch } from '@/components/ui/switch'
import type { ServiceItem } from '@/types'
import { cn, formatTimeRange } from '@/lib/utils'

const DIAS_SEMANA = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface ServiceSidebarProps {
  services: ServiceItem[]
  visibleServiceIds: string[]
  onToggleVisible: (serviceId: string) => void
  onCreate: () => void
  onEdit: (service: ServiceItem) => void
  onDelete: (service: ServiceItem) => void
}

function getActiveDaysCount(service: ServiceItem) {
  return Object.values(service.schedule).filter((day) => day.active).length
}

export function ServiceSidebar({
  services,
  visibleServiceIds,
  onToggleVisible,
  onCreate,
  onEdit,
  onDelete,
}: ServiceSidebarProps) {
  return (
    <aside className="flex h-full w-full max-w-[260px] flex-col border-r bg-sidebar">
      <div className="border-b px-4 py-4">
        <div className="flex items-center justify-between gap-2">
          <div>
            <h2 className="font-semibold text-sm">Servicios</h2>
            <p className="text-xs text-muted-foreground">Calendarios configurables</p>
          </div>
          <Button size="icon" className="size-7" onClick={onCreate} aria-label="Crear servicio">
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>

      <ScrollArea className="flex-1">
        <div className="space-y-2 p-3">
          {services.length ? (
            services.map((service) => {
              const visible = visibleServiceIds.includes(service.id)
              return (
                <div
                  key={service.id}
                  className={cn(
                    'rounded-xl border bg-card p-3 shadow-sm transition-opacity',
                    !service.isActive && 'opacity-55',
                  )}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 space-y-1.5">
                      <div className="flex items-center gap-2">
                        <span
                          className="size-3 shrink-0 rounded-full"
                          style={{ backgroundColor: service.color }}
                        />
                        <h3 className="truncate text-sm font-medium leading-none">{service.name}</h3>
                      </div>
                      <div className="flex flex-wrap gap-1.5">
                        <Badge variant="secondary" className="text-xs px-1.5 py-0">{service.duration} min</Badge>
                        <Badge variant="outline" className="text-xs px-1.5 py-0">{getActiveDaysCount(service)} días</Badge>
                        {!service.isActive && (
                          <Badge variant="destructive" className="text-xs px-1.5 py-0">Inactivo</Badge>
                        )}
                      </div>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="size-6 shrink-0">
                          <MoreHorizontal className="size-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => onEdit(service)}>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          className="text-destructive focus:text-destructive"
                          onClick={() => onDelete(service)}
                        >
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>

                  {service.description ? (
                    <p className="mt-2 text-xs text-muted-foreground line-clamp-2">{service.description}</p>
                  ) : null}

                  <div className="mt-2.5 flex items-center justify-between rounded-lg bg-muted/60 px-2.5 py-1.5">
                    <p className="text-xs font-medium">Visible en calendario</p>
                    <Switch
                      checked={visible}
                      onCheckedChange={() => onToggleVisible(service.id)}
                      className="scale-90"
                    />
                  </div>

                  <div className="mt-2.5 rounded-lg bg-muted/40 p-2.5 text-xs text-muted-foreground">
                    <div className="mb-1.5 flex items-center gap-1.5 font-medium text-foreground">
                      <CalendarClock className="size-3" /> Horario semanal
                    </div>
                    <div className="grid gap-0.5">
                      {DIAS_SEMANA.map((day, index) => {
                        const schedule = service.schedule[String(index)]
                        return (
                          <div key={day} className="flex items-center justify-between gap-2">
                            <span className="w-8">{day}</span>
                            <span className={cn(!schedule?.active && 'text-muted-foreground/50')}>
                              {schedule?.active && schedule.start && schedule.end
                                ? formatTimeRange(
                                    `2000-01-01T${schedule.start}:00`,
                                    `2000-01-01T${schedule.end}:00`,
                                  )
                                : '—'}
                            </span>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                </div>
              )
            })
          ) : (
            <div className="rounded-xl border border-dashed p-6 text-center text-xs text-muted-foreground">
              Sin servicios. Crea uno para empezar a recibir reservas.
            </div>
          )}
        </div>
      </ScrollArea>
    </aside>
  )
}
