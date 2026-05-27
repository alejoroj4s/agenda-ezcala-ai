'use client'

import { format } from 'date-fns'
import { es } from 'date-fns/locale'
import { Calendar, Clock, Edit2, Mail, MessageSquare, Phone, Trash2, User, XCircle } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import type { CalendarEvent } from '@/types'
import { getEventColor } from '@/lib/utils'

interface EventDetailModalProps {
  event: CalendarEvent | null
  open: boolean
  onClose: () => void
  onEdit: (event: CalendarEvent) => void
  onDelete: (event: CalendarEvent) => void
  onCancel: (event: CalendarEvent) => void
}

const statusLabels: Record<string, string> = {
  SCHEDULED: 'Agendado',
  CANCELLED: 'Cancelado',
  COMPLETED: 'Completado',
  NO_SHOW: 'No asistió',
}

const statusVariants: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  SCHEDULED: 'default',
  CANCELLED: 'destructive',
  COMPLETED: 'outline',
  NO_SHOW: 'outline',
}

export function EventDetailModal({ event, open, onClose, onEdit, onDelete, onCancel }: EventDetailModalProps) {
  if (!event) return null

  const start = new Date(event.startTime)
  const end = new Date(event.endTime)
  const isCancelled = event.status === 'CANCELLED'
  const color = getEventColor(event.color || event.service?.color)

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <div className="flex items-start gap-3">
            <span className="mt-1 size-4 shrink-0 rounded-full" style={{ backgroundColor: color }} />
            <div className="flex-1 min-w-0">
              <DialogTitle className="text-lg leading-tight">{event.title}</DialogTitle>
              {event.service && (
                <p className="mt-0.5 text-sm text-muted-foreground">{event.service.name}</p>
              )}
            </div>
            <Badge variant={statusVariants[event.status] ?? 'secondary'}>
              {statusLabels[event.status] ?? event.status}
            </Badge>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Date & time */}
          <div className="flex items-center gap-3 text-sm">
            <Calendar className="size-4 shrink-0 text-muted-foreground" />
            <div>
              <p className="font-medium capitalize">
                {format(start, "EEEE, d 'de' MMMM yyyy", { locale: es })}
              </p>
              <p className="text-muted-foreground">
                {format(start, 'HH:mm')} – {format(end, 'HH:mm')}
              </p>
            </div>
          </div>

          {/* Description */}
          {event.description && (
            <>
              <Separator />
              <div className="flex items-start gap-3 text-sm">
                <MessageSquare className="mt-0.5 size-4 shrink-0 text-muted-foreground" />
                <p className="text-muted-foreground">{event.description}</p>
              </div>
            </>
          )}

          {/* Attendee */}
          {event.attendeeName && (
            <>
              <Separator />
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asistente</p>
              <div className="flex items-center gap-3 text-sm">
                <User className="size-4 shrink-0 text-muted-foreground" />
                <span>{event.attendeeName}</span>
              </div>
              {event.attendeeEmail && (
                <div className="flex items-center gap-3 text-sm">
                  <Mail className="size-4 shrink-0 text-muted-foreground" />
                  <span>{event.attendeeEmail}</span>
                </div>
              )}
              {event.attendeePhone && (
                <div className="flex items-center gap-3 text-sm">
                  <Phone className="size-4 shrink-0 text-muted-foreground" />
                  <span>{event.attendeePhone}</span>
                </div>
              )}
            </>
          )}

          {/* Notes */}
          {event.notes && (
            <>
              <Separator />
              <div className="rounded-md bg-muted/50 p-3 text-sm text-muted-foreground">
                <p className="mb-1 font-semibold text-foreground">Notas</p>
                {event.notes}
              </div>
            </>
          )}
        </div>

        {/* Actions */}
        <div className="mt-4 flex gap-2">
          <Button
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => onEdit(event)}
            disabled={isCancelled}
          >
            <Edit2 className="size-3.5" />
            Editar
          </Button>

          {!isCancelled && (
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-yellow-600 hover:text-yellow-700"
              onClick={() => onCancel(event)}
            >
              <XCircle className="size-3.5" />
              Cancelar evento
            </Button>
          )}

          <Button
            variant="outline"
            size="sm"
            className="ml-auto gap-1.5 text-destructive hover:text-destructive"
            onClick={() => onDelete(event)}
          >
            <Trash2 className="size-3.5" />
            Eliminar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
