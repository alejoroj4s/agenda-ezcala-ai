'use client'

import { format, isSameDay } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useRef } from 'react'

import type { CalendarEvent } from '@/types'
import { getEventColor, cn } from '@/lib/utils'

interface CalendarDayViewProps {
  date: Date
  events: CalendarEvent[]
  onCreateAt: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

const START_HOUR = 7
const END_HOUR = 22
const ROW_HEIGHT = 72

export function CalendarDayView({ date, events, onCreateAt, onSelectEvent }: CalendarDayViewProps) {
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), date))
  const now = new Date()
  const nowMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes()
  const nowTop = (nowMinutes / 60) * ROW_HEIGHT
  const isToday = isSameDay(date, now)
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = Math.max(0, nowTop - 150)
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Day header */}
      <div className="border-b bg-muted/40 px-4 py-3 text-center sticky top-0 z-10">
        <p className="text-xs uppercase tracking-wide text-muted-foreground">
          {format(date, 'EEEE', { locale: es })}
        </p>
        <p
          className={cn(
            'mx-auto mt-1 flex size-10 items-center justify-center rounded-full text-xl font-bold',
            isToday && 'bg-primary text-primary-foreground',
          )}
        >
          {format(date, 'd')}
        </p>
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-[56px_1fr]">
          {/* Time labels */}
          <div className="border-r bg-muted/10">
            {hours.map((hour) => (
              <div key={hour} className="h-[72px] border-b px-2 pt-1 text-right text-xs text-muted-foreground">
                {format(new Date(`2000-01-01T${String(hour).padStart(2, '0')}:00:00`), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Event column */}
          <div className="relative">
            {hours.map((hour) => {
              const slot = new Date(date)
              slot.setHours(hour, 0, 0, 0)
              return (
                <button
                  key={hour}
                  type="button"
                  className="block h-[72px] w-full border-b text-left hover:bg-primary/5 transition-colors"
                  onClick={() => onCreateAt(slot)}
                />
              )
            })}

            {/* Events */}
            <div className="pointer-events-none absolute inset-0 px-2">
              {dayEvents.map((event) => {
                const start = new Date(event.startTime)
                const end = new Date(event.endTime)
                const startMins = (start.getHours() - START_HOUR) * 60 + start.getMinutes()
                const durMins = Math.max((end.getTime() - start.getTime()) / 60000, 30)
                const top = (startMins / 60) * ROW_HEIGHT
                const height = Math.max((durMins / 60) * ROW_HEIGHT, 32)
                const cancelled = event.status === 'CANCELLED'
                return (
                  <button
                    key={event.id}
                    type="button"
                    className={cn(
                      'pointer-events-auto absolute left-2 right-2 overflow-hidden rounded-lg px-3 py-2 text-left text-sm text-white shadow hover:brightness-105 transition-all',
                      cancelled && 'opacity-50',
                    )}
                    style={{ top, height, backgroundColor: getEventColor(event.color || event.service?.color) }}
                    onClick={() => onSelectEvent(event)}
                  >
                    <p className={cn('truncate font-semibold', cancelled && 'line-through')}>{event.title}</p>
                    <p className="truncate text-xs opacity-85">
                      {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                    </p>
                    {event.attendeeName && <p className="truncate text-xs opacity-75">{event.attendeeName}</p>}
                  </button>
                )
              })}
            </div>

            {/* Current time indicator */}
            {isToday && nowTop >= 0 && (
              <div className="pointer-events-none absolute inset-x-0 z-20 flex items-center" style={{ top: nowTop }}>
                <span className="size-3 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                <span className="h-px flex-1 bg-red-500" />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
