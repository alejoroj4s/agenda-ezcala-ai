'use client'

import { format, isToday, isTomorrow, isYesterday, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar } from 'lucide-react'

import type { CalendarEvent } from '@/types'
import { getEventColor, cn } from '@/lib/utils'

interface CalendarListViewProps {
  events: CalendarEvent[]
  onSelectEvent: (event: CalendarEvent) => void
}

function getDayLabel(date: Date) {
  if (isToday(date)) return 'Hoy'
  if (isTomorrow(date)) return 'Mañana'
  if (isYesterday(date)) return 'Ayer'
  return format(date, "EEEE, d 'de' MMMM yyyy", { locale: es })
}

export function CalendarListView({ events, onSelectEvent }: CalendarListViewProps) {
  if (!events.length) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-center text-muted-foreground">
        <Calendar className="mb-4 size-12 opacity-30" />
        <p className="text-lg font-medium">Sin eventos</p>
        <p className="text-sm">No hay eventos en este período</p>
      </div>
    )
  }

  // Group events by date
  const groups = events.reduce<Record<string, CalendarEvent[]>>((acc, event) => {
    const key = format(new Date(event.startTime), 'yyyy-MM-dd')
    acc[key] = acc[key] ?? []
    acc[key].push(event)
    return acc
  }, {})

  const sortedDates = Object.keys(groups).sort()

  return (
    <div className="space-y-6 overflow-hidden rounded-xl border bg-card p-4 shadow-sm">
      {sortedDates.map((dateKey) => {
        const dayDate = new Date(dateKey + 'T00:00:00')
        const dayEvents = groups[dateKey].sort(
          (a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
        )
        const today = isToday(dayDate)

        return (
          <div key={dateKey}>
            <h3
              className={cn(
                'mb-2 text-sm font-semibold capitalize',
                today ? 'text-primary' : 'text-muted-foreground',
              )}
            >
              {getDayLabel(dayDate)}
            </h3>
            <div className="divide-y rounded-lg border overflow-hidden">
              {dayEvents.map((event) => {
                const start = new Date(event.startTime)
                const end = new Date(event.endTime)
                const cancelled = event.status === 'CANCELLED'
                const color = getEventColor(event.color || event.service?.color)

                return (
                  <button
                    key={event.id}
                    type="button"
                    className="flex w-full items-start gap-4 px-4 py-3 text-left hover:bg-muted/40 transition-colors"
                    onClick={() => onSelectEvent(event)}
                  >
                    {/* Color bar */}
                    <span className="mt-1.5 h-3 w-1.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />

                    {/* Time */}
                    <span className="w-20 shrink-0 pt-0.5 text-xs tabular-nums text-muted-foreground">
                      {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                    </span>

                    {/* Details */}
                    <div className="min-w-0 flex-1">
                      <p
                        className={cn(
                          'truncate font-medium text-sm',
                          cancelled && 'line-through opacity-50',
                        )}
                      >
                        {event.title}
                      </p>
                      {event.service && (
                        <p className="truncate text-xs text-muted-foreground">{event.service.name}</p>
                      )}
                      {event.attendeeName && (
                        <p className="truncate text-xs text-muted-foreground">{event.attendeeName}</p>
                      )}
                    </div>

                    {/* Status badge */}
                    {cancelled && (
                      <span className="shrink-0 rounded-full bg-destructive/10 px-2 py-0.5 text-xs font-medium text-destructive">
                        Cancelado
                      </span>
                    )}
                    {event.status === 'SCHEDULED' && !cancelled && (
                      <span className="shrink-0 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                        Agendado
                      </span>
                    )}
                    {event.status === 'COMPLETED' && (
                      <span className="shrink-0 rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-700">
                        Completado
                      </span>
                    )}
                  </button>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
