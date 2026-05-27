'use client'

import { addDays, format, isSameDay, isToday, startOfWeek } from 'date-fns'
import { es } from 'date-fns/locale'
import { useEffect, useRef } from 'react'

import type { CalendarEvent } from '@/types'
import { getEventColor, cn } from '@/lib/utils'

interface CalendarWeekViewProps {
  date: Date
  events: CalendarEvent[]
  onCreateAt: (date: Date) => void
  onSelectEvent: (event: CalendarEvent) => void
}

const START_HOUR = 7
const END_HOUR = 22
const ROW_HEIGHT = 64

export function CalendarWeekView({ date, events, onCreateAt, onSelectEvent }: CalendarWeekViewProps) {
  const days = Array.from({ length: 7 }, (_, i) => addDays(startOfWeek(date, { weekStartsOn: 0 }), i))
  const hours = Array.from({ length: END_HOUR - START_HOUR + 1 }, (_, i) => START_HOUR + i)
  const now = new Date()
  const nowMinutes = (now.getHours() - START_HOUR) * 60 + now.getMinutes()
  const nowTop = (nowMinutes / 60) * ROW_HEIGHT
  const currentDayIndex = days.findIndex((d) => isToday(d))
  const scrollRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (scrollRef.current) {
      const scrollTo = Math.max(0, nowTop - 150)
      scrollRef.current.scrollTop = scrollTo
    }
  }, [])

  return (
    <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
      {/* Header */}
      <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))] border-b bg-muted/40 sticky top-0 z-10">
        <div className="border-r" />
        {days.map((day, i) => {
          const today = isToday(day)
          return (
            <div key={day.toISOString()} className={cn('border-r px-2 py-2.5 text-center last:border-r-0', today && 'bg-primary/5')}>
              <p className="text-xs uppercase tracking-wide text-muted-foreground">
                {format(day, 'EEE', { locale: es })}
              </p>
              <span
                className={cn(
                  'mx-auto mt-1 flex size-7 items-center justify-center rounded-full text-sm font-semibold',
                  today && 'bg-primary text-primary-foreground',
                )}
              >
                {format(day, 'd')}
              </span>
            </div>
          )
        })}
      </div>

      {/* Scrollable time grid */}
      <div ref={scrollRef} className="max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="grid grid-cols-[56px_repeat(7,minmax(0,1fr))]">
          {/* Time labels */}
          <div className="border-r bg-muted/10">
            {hours.map((hour) => (
              <div key={hour} className="h-[64px] border-b px-2 pt-1 text-right text-xs text-muted-foreground">
                {format(new Date(`2000-01-01T${String(hour).padStart(2, '0')}:00:00`), 'HH:mm')}
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, dayIdx) => {
            const dayEvents = events.filter((e) => isSameDay(new Date(e.startTime), day))
            const today = isToday(day)
            return (
              <div key={day.toISOString()} className={cn('relative border-r last:border-r-0', today && 'bg-primary/[0.02]')}>
                {/* Hour slots */}
                {hours.map((hour) => {
                  const slot = new Date(day)
                  slot.setHours(hour, 0, 0, 0)
                  return (
                    <button
                      key={hour}
                      type="button"
                      className="block h-[64px] w-full border-b text-left hover:bg-primary/5 transition-colors"
                      onClick={() => onCreateAt(slot)}
                    />
                  )
                })}

                {/* Events */}
                <div className="pointer-events-none absolute inset-0">
                  {dayEvents.map((event) => {
                    const start = new Date(event.startTime)
                    const end = new Date(event.endTime)
                    const startMins = (start.getHours() - START_HOUR) * 60 + start.getMinutes()
                    const durMins = Math.max((end.getTime() - start.getTime()) / 60000, 30)
                    const top = (startMins / 60) * ROW_HEIGHT
                    const height = Math.max((durMins / 60) * ROW_HEIGHT, 28)
                    const cancelled = event.status === 'CANCELLED'
                    return (
                      <button
                        key={event.id}
                        type="button"
                        className={cn(
                          'pointer-events-auto absolute left-0.5 right-0.5 overflow-hidden rounded-md px-1.5 py-1 text-left text-xs text-white shadow-sm hover:brightness-105 transition-all',
                          cancelled && 'opacity-50',
                        )}
                        style={{ top, height, backgroundColor: getEventColor(event.color || event.service?.color) }}
                        onClick={() => onSelectEvent(event)}
                      >
                        <p className={cn('truncate font-semibold', cancelled && 'line-through')}>{event.title}</p>
                        {height > 32 && (
                          <p className="truncate opacity-85">
                            {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
                          </p>
                        )}
                      </button>
                    )
                  })}
                </div>

                {/* Current time indicator */}
                {today && nowTop >= 0 && nowTop <= hours.length * ROW_HEIGHT && (
                  <div
                    className="pointer-events-none absolute inset-x-0 z-20 flex items-center"
                    style={{ top: nowTop }}
                  >
                    <span className="size-2.5 rounded-full bg-red-500 -ml-1.5 shrink-0" />
                    <span className="h-px flex-1 bg-red-500" />
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
