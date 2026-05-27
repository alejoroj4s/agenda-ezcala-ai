'use client'

import { eachDayOfInterval, endOfMonth, endOfWeek, format, isSameMonth, isToday, startOfMonth, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { Plus } from 'lucide-react'

import type { CalendarEvent } from '@/types'
import { getEventColor, cn } from '@/lib/utils'

const DIAS = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']

interface CalendarMonthViewProps {
  date: Date
  events: CalendarEvent[]
  onCreateAt: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
  onGoToDay?: (date: Date) => void
}

export function CalendarMonthView({ date, events, onCreateAt, onSelectEvent, onGoToDay }: CalendarMonthViewProps) {
  const days = eachDayOfInterval({
    start: startOfWeek(startOfMonth(date), { weekStartsOn: 0 }),
    end: endOfWeek(endOfMonth(date), { weekStartsOn: 0 }),
  })

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header days */}
      <div className="grid grid-cols-7 border-b bg-muted/40 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        {DIAS.map((day) => (
          <div key={day} className="px-3 py-2.5 text-center">
            {day}
          </div>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-7">
        {days.map((day) => {
          const dayKey = format(day, 'yyyy-MM-dd')
          const dayEvents = events.filter(
            (event) => format(new Date(event.startTime), 'yyyy-MM-dd') === dayKey,
          )
          const today = isToday(day)
          const sameMonth = isSameMonth(day, date)

          return (
            <div
              key={day.toISOString()}
              className={cn(
                'group relative min-h-[120px] border-b border-r p-2 transition-colors hover:bg-muted/20',
                !sameMonth && 'bg-muted/10',
              )}
              onClick={() => onCreateAt(day)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => e.key === 'Enter' && onCreateAt(day)}
            >
              {/* Day number + create button */}
              <div className="mb-1.5 flex items-center justify-between">
                <button
                  type="button"
                  className={cn(
                    'inline-flex size-7 items-center justify-center rounded-full text-sm font-medium transition-colors',
                    today
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-muted text-foreground',
                    !sameMonth && !today && 'text-muted-foreground',
                  )}
                  onClick={(e) => {
                    e.stopPropagation()
                    onGoToDay ? onGoToDay(day) : onCreateAt(day)
                  }}
                >
                  {format(day, 'd')}
                </button>
                <button
                  type="button"
                  className="size-5 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-primary hover:text-primary-foreground text-muted-foreground"
                  onClick={(e) => {
                    e.stopPropagation()
                    onCreateAt(day)
                  }}
                  aria-label="Crear evento"
                >
                  <Plus className="size-3" />
                </button>
              </div>

              {/* Events */}
              <div className="space-y-1">
                {dayEvents.slice(0, 3).map((event) => (
                  <button
                    key={event.id}
                    type="button"
                    className={cn(
                      'block w-full truncate rounded px-1.5 py-0.5 text-left text-xs font-medium text-white shadow-sm hover:brightness-110 transition-all',
                      event.status === 'CANCELLED' && 'opacity-50 line-through',
                    )}
                    style={{ backgroundColor: getEventColor(event.color || event.service?.color) }}
                    onClick={(e) => {
                      e.stopPropagation()
                      onSelectEvent(event)
                    }}
                  >
                    {format(new Date(event.startTime), 'HH:mm')} {event.title}
                  </button>
                ))}
                {dayEvents.length > 3 && (
                  <button
                    type="button"
                    className="px-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    onClick={(e) => {
                      e.stopPropagation()
                      onGoToDay && onGoToDay(day)
                    }}
                  >
                    +{dayEvents.length - 3} más
                  </button>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
