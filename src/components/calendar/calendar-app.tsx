'use client'

import { addDays, addHours, endOfDay, endOfMonth, endOfWeek, isSameDay, setHours, setMinutes, startOfDay, startOfMonth, startOfWeek } from 'date-fns'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { CalendarDayView } from '@/components/calendar/calendar-day-view'
import { CalendarHeader } from '@/components/calendar/calendar-header'
import { CalendarListView } from '@/components/calendar/calendar-list-view'
import { CalendarMonthView } from '@/components/calendar/calendar-month-view'
import { CalendarWeekView } from '@/components/calendar/calendar-week-view'
import { EventDetailModal } from '@/components/calendar/event-detail-modal'
import { EventModal } from '@/components/calendar/event-modal'
import { ServiceModal } from '@/components/services/service-modal'
import { ServiceSidebar } from '@/components/services/service-sidebar'
import { TokenManager } from '@/components/tokens/token-manager'
import { useToast } from '@/components/ui/use-toast'
import type { CalendarEvent, CalendarView, ServiceItem, UserProfile } from '@/types'

interface CalendarAppProps {
  initialEvents: CalendarEvent[]
  initialServices: ServiceItem[]
  user: UserProfile
}

function getRangeForView(view: CalendarView, currentDate: Date) {
  if (view === 'month') {
    return {
      from: startOfWeek(startOfMonth(currentDate), { weekStartsOn: 0 }),
      to: endOfWeek(endOfMonth(currentDate), { weekStartsOn: 0 }),
    }
  }

  if (view === 'week') {
    return {
      from: startOfWeek(currentDate, { weekStartsOn: 0 }),
      to: endOfWeek(currentDate, { weekStartsOn: 0 }),
    }
  }

  if (view === 'day') {
    return { from: startOfDay(currentDate), to: endOfDay(currentDate) }
  }

  return { from: startOfDay(currentDate), to: endOfDay(addDays(currentDate, 45)) }
}

function normalizeDraftDate(date?: Date | null) {
  if (!date) {
    const now = new Date()
    return setMinutes(setHours(now, Math.max(now.getHours() + 1, 9)), 0)
  }

  if (date.getHours() === 0 && date.getMinutes() === 0) {
    return setMinutes(setHours(date, 9), 0)
  }

  return date
}

export function CalendarApp({ initialEvents, initialServices, user }: CalendarAppProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [services, setServices] = useState(initialServices)
  const [events, setEvents] = useState(initialEvents)
  const [visibleServiceIds, setVisibleServiceIds] = useState(initialServices.map((service) => service.id))
  const [currentDate, setCurrentDate] = useState(new Date())
  const [view, setView] = useState<CalendarView>('month')
  const [loading, setLoading] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)
  const [editingEvent, setEditingEvent] = useState<CalendarEvent | null>(null)
  const [eventModalOpen, setEventModalOpen] = useState(false)
  const [serviceModalOpen, setServiceModalOpen] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [tokenManagerOpen, setTokenManagerOpen] = useState(false)
  const [draftStart, setDraftStart] = useState<Date | null>(null)
  const [draftEnd, setDraftEnd] = useState<Date | null>(null)

  const loadServices = useCallback(async () => {
    const response = await fetch('/api/services')
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load services')

    const nextServices = data.services as ServiceItem[]
    const previousIds = new Set(services.map((service) => service.id))

    setVisibleServiceIds((current) => {
      const nextVisible = new Set(current)
      nextServices.forEach((service) => {
        if (!previousIds.has(service.id)) {
          nextVisible.add(service.id)
        }
      })
      return nextServices.filter((service) => nextVisible.has(service.id)).map((service) => service.id)
    })
    setServices(nextServices)
  }, [services])

  const loadEvents = useCallback(async () => {
    const range = getRangeForView(view, currentDate)
    const params = new URLSearchParams({ from: range.from.toISOString(), to: range.to.toISOString() })
    const response = await fetch(`/api/events?${params.toString()}`)
    const data = await response.json()
    if (!response.ok) throw new Error(data.error || 'Unable to load events')
    setEvents(data.events)
  }, [currentDate, view])

  const refreshData = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([loadServices(), loadEvents()])
    } catch (error) {
      toast({ variant: 'destructive', title: 'Error al actualizar', description: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setLoading(false)
    }
  }, [loadEvents, loadServices, toast])

  useEffect(() => {
    let cancelled = false

    const run = async () => {
      setLoading(true)
      try {
        await loadEvents()
      } catch (error) {
        if (!cancelled) {
          toast({ variant: 'destructive', title: 'No se pudieron cargar los eventos', description: error instanceof Error ? error.message : 'Error desconocido' })
        }
      } finally {
        if (!cancelled) {
          setLoading(false)
        }
      }
    }

    void run()

    return () => {
      cancelled = true
    }
  }, [loadEvents, toast])

  const filteredEvents = useMemo(
    () =>
      events
        .filter((event) => !event.serviceId || visibleServiceIds.includes(event.serviceId))
        .sort((first, second) => new Date(first.startTime).getTime() - new Date(second.startTime).getTime()),
    [events, visibleServiceIds],
  )

  const dayEvents = useMemo(
    () => filteredEvents.filter((event) => isSameDay(new Date(event.startTime), currentDate)),
    [currentDate, filteredEvents],
  )

  function openCreateEvent(date?: Date) {
    const start = normalizeDraftDate(date)
    setDraftStart(start)
    setDraftEnd(addHours(start, 1))
    setEditingEvent(null)
    setEventModalOpen(true)
  }

  async function handleDeleteService(service: ServiceItem) {
    if (!window.confirm(`¿Eliminar el servicio "${service.name}"? Los eventos existentes conservarán sus datos.`)) return

    const response = await fetch(`/api/services/${service.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = await response.json()
      toast({ variant: 'destructive', title: 'No se pudo eliminar el servicio', description: data.error || 'Unknown error' })
      return
    }

    toast({ title: 'Servicio eliminado' })
    await refreshData()
  }

  async function handleDeleteEvent(event: CalendarEvent) {
    if (!window.confirm(`¿Eliminar el evento "${event.title}"?`)) return

    const response = await fetch(`/api/events/${event.id}`, { method: 'DELETE' })
    if (!response.ok) {
      const data = await response.json()
      toast({ variant: 'destructive', title: 'No se pudo eliminar el evento', description: data.error || 'Unknown error' })
      return
    }

    setSelectedEvent(null)
    toast({ title: 'Evento eliminado' })
    await loadEvents()
  }

  async function handleCancelEvent(event: CalendarEvent) {
    const response = await fetch(`/api/events/${event.id}/cancel`, { method: 'PATCH' })
    if (!response.ok) {
      const data = await response.json()
      toast({ variant: 'destructive', title: 'No se pudo cancelar el evento', description: data.error || 'Unknown error' })
      return
    }

    setSelectedEvent(null)
    toast({ title: 'Evento cancelado' })
    await loadEvents()
  }

  async function handleLogout() {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <div className="flex h-screen overflow-hidden bg-muted/30">
      <ServiceSidebar
        services={services}
        visibleServiceIds={visibleServiceIds}
        onToggleVisible={(serviceId) =>
          setVisibleServiceIds((current) =>
            current.includes(serviceId) ? current.filter((item) => item !== serviceId) : [...current, serviceId],
          )
        }
        onCreate={() => {
          setEditingService(null)
          setServiceModalOpen(true)
        }}
        onEdit={(service) => {
          setEditingService(service)
          setServiceModalOpen(true)
        }}
        onDelete={(service) => void handleDeleteService(service)}
      />
      <main className="flex min-w-0 flex-1 flex-col">
        <CalendarHeader
          currentDate={currentDate}
          view={view}
          loading={loading}
          user={user}
          onDateChange={setCurrentDate}
          onViewChange={setView}
          onCreateEvent={() => openCreateEvent()}
          onOpenTokens={() => setTokenManagerOpen(true)}
          onLogout={() => void handleLogout()}
        />
        <div className="flex-1 overflow-auto p-6">
          {view === 'month' ? (
            <CalendarMonthView date={currentDate} events={filteredEvents} onCreateAt={openCreateEvent} onSelectEvent={setSelectedEvent} onGoToDay={(day) => { setCurrentDate(day); setView('day') }} />
          ) : null}
          {view === 'week' ? (
            <CalendarWeekView date={currentDate} events={filteredEvents} onCreateAt={openCreateEvent} onSelectEvent={setSelectedEvent} />
          ) : null}
          {view === 'day' ? (
            <CalendarDayView date={currentDate} events={dayEvents} onCreateAt={openCreateEvent} onSelectEvent={setSelectedEvent} />
          ) : null}
          {view === 'list' ? (
            <CalendarListView events={filteredEvents} onSelectEvent={setSelectedEvent} />
          ) : null}
        </div>
      </main>

      {eventModalOpen ? (
        <EventModal
          event={editingEvent}
          services={services}
          defaultDate={draftStart}
          open={eventModalOpen}
          onClose={() => setEventModalOpen(false)}
          onSave={async (data) => {
            const startTime = new Date(`${data.startDate}T${data.startTime}:00`).toISOString()
            const endTime = new Date(`${data.endDate}T${data.endTime}:00`).toISOString()
            const payload = {
              title: data.title,
              description: data.description,
              serviceId: data.serviceId,
              status: data.status,
              startTime,
              endTime,
              attendeeName: data.attendeeName,
              attendeeEmail: data.attendeeEmail,
              attendeePhone: data.attendeePhone,
              notes: data.notes,
              color: data.color,
            }
            const res = data.id
              ? await fetch(`/api/events/${data.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                })
              : await fetch('/api/events', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(payload),
                })
            if (!res.ok) {
              const err = await res.json()
              toast({ variant: 'destructive', title: 'No se pudo guardar el evento', description: err.error || 'Error desconocido' })
              return
            }
            setEventModalOpen(false)
            await loadEvents()
          }}
        />
      ) : null}
      <EventDetailModal
        event={selectedEvent}
        open={Boolean(selectedEvent)}
        onClose={() => setSelectedEvent(null)}
        onEdit={(event) => {
          setSelectedEvent(null)
          setEditingEvent(event)
          setDraftStart(new Date(event.startTime))
          setDraftEnd(new Date(event.endTime))
          setEventModalOpen(true)
        }}
        onCancel={(event) => void handleCancelEvent(event)}
        onDelete={(event) => void handleDeleteEvent(event)}
      />
      {serviceModalOpen ? (
        <ServiceModal
          open={serviceModalOpen}
          service={editingService}
          onClose={() => setServiceModalOpen(false)}
          onSave={async (data) => {
            const res = data.id
              ? await fetch(`/api/services/${data.id}`, {
                  method: 'PUT',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
              : await fetch('/api/services', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify(data),
                })
            if (!res.ok) {
              const err = await res.json()
              toast({ variant: 'destructive', title: 'No se pudo guardar el servicio', description: err.error || 'Error desconocido' })
              return
            }
            setServiceModalOpen(false)
            await refreshData()
          }}
        />
      ) : null}
      {tokenManagerOpen ? <TokenManager open={tokenManagerOpen} onClose={() => setTokenManagerOpen(false)} /> : null}
    </div>
  )
}
