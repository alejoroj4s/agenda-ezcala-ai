'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { format } from 'date-fns'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import type { CalendarEvent, ServiceItem as Service } from '@/types'

const schema = z.object({
  title: z.string().min(1, 'El título es obligatorio'),
  description: z.string().optional(),
  serviceId: z.string().optional(),
  status: z.enum(['SCHEDULED', 'COMPLETED', 'CANCELLED', 'NO_SHOW'] as const),
  startDate: z.string().min(1, 'Requerido'),
  startTime: z.string().min(1, 'Requerido'),
  endDate: z.string().min(1, 'Requerido'),
  endTime: z.string().min(1, 'Requerido'),
  attendeeName: z.string().optional(),
  attendeeEmail: z.string().email('Email inválido').optional().or(z.literal('')),
  attendeePhone: z.string().optional(),
  notes: z.string().optional(),
  color: z.string().optional(),
})

type FormValues = z.infer<typeof schema>

interface EventModalProps {
  open: boolean
  event?: CalendarEvent | null
  defaultDate?: Date | null
  services: Service[]
  onClose: () => void
  onSave: (data: FormValues & { id?: string }) => Promise<void>
}

const STATUS_OPTIONS = [
  { value: 'SCHEDULED', label: 'Agendado' },
  { value: 'COMPLETED', label: 'Completado' },
  { value: 'CANCELLED', label: 'Cancelado' },
  { value: 'NO_SHOW', label: 'No asistió' },
]

export function EventModal({ open, event, defaultDate, services, onClose, onSave }: EventModalProps) {
  const isEditing = !!event

  const defaultStart = defaultDate ?? new Date()
  const defaultEnd = new Date(defaultStart.getTime() + 60 * 60 * 1000)

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      description: '',
      serviceId: undefined,
      status: 'SCHEDULED',
      startDate: format(defaultStart, 'yyyy-MM-dd'),
      startTime: format(defaultStart, 'HH:mm'),
      endDate: format(defaultEnd, 'yyyy-MM-dd'),
      endTime: format(defaultEnd, 'HH:mm'),
      attendeeName: '',
      attendeeEmail: '',
      attendeePhone: '',
      notes: '',
      color: '',
    },
  })

  useEffect(() => {
    if (open) {
      if (event) {
        const start = new Date(event.startTime)
        const end = new Date(event.endTime)
        form.reset({
          title: event.title,
          description: event.description ?? '',
          serviceId: event.serviceId ?? undefined,
          status: (event.status ?? 'SCHEDULED') as FormValues['status'],
          startDate: format(start, 'yyyy-MM-dd'),
          startTime: format(start, 'HH:mm'),
          endDate: format(end, 'yyyy-MM-dd'),
          endTime: format(end, 'HH:mm'),
          attendeeName: event.attendeeName ?? '',
          attendeeEmail: event.attendeeEmail ?? '',
          attendeePhone: event.attendeePhone ?? '',
          notes: event.notes ?? '',
          color: event.color ?? '',
        })
      } else {
        const ref = defaultDate ?? new Date()
        const end = new Date(ref.getTime() + 60 * 60 * 1000)
        form.reset({
          title: '',
          description: '',
          serviceId: undefined,
          status: 'SCHEDULED',
          startDate: format(ref, 'yyyy-MM-dd'),
          startTime: format(ref, 'HH:mm'),
          endDate: format(end, 'yyyy-MM-dd'),
          endTime: format(end, 'HH:mm'),
          attendeeName: '',
          attendeeEmail: '',
          attendeePhone: '',
          notes: '',
          color: '',
        })
      }
    }
  }, [open, event, defaultDate])

  const handleSubmit = async (values: FormValues) => {
    await onSave({ ...values, id: event?.id })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar evento' : 'Nuevo evento'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            {/* Title */}
            <FormField control={form.control} name="title" render={({ field }) => (
              <FormItem>
                <FormLabel>Título *</FormLabel>
                <FormControl><Input placeholder="Nombre del evento" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Service + Status */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="serviceId" render={({ field }) => (
                <FormItem>
                  <FormLabel>Servicio</FormLabel>
                  <Select value={field.value ?? '__none__'} onValueChange={(v) => field.onChange(v === '__none__' ? undefined : v)}>
                    <FormControl>
                      <SelectTrigger><SelectValue placeholder="Ninguno" /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="__none__">Ninguno</SelectItem>
                      {services.map((s) => (
                        <SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="status" render={({ field }) => (
                <FormItem>
                  <FormLabel>Estado</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {STATUS_OPTIONS.map((o) => (
                        <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Start date/time */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="startDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha inicio</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="startTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora inicio</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* End date/time */}
            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="endDate" render={({ field }) => (
                <FormItem>
                  <FormLabel>Fecha fin</FormLabel>
                  <FormControl><Input type="date" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="endTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Hora fin</FormLabel>
                  <FormControl><Input type="time" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            {/* Description */}
            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción opcional..." rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            {/* Attendee section */}
            <div className="space-y-3 rounded-lg border p-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Asistente</p>
              <FormField control={form.control} name="attendeeName" render={({ field }) => (
                <FormItem>
                  <FormLabel>Nombre</FormLabel>
                  <FormControl><Input placeholder="Nombre del asistente" {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <div className="grid grid-cols-2 gap-3">
                <FormField control={form.control} name="attendeeEmail" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="email@ejemplo.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
                <FormField control={form.control} name="attendeePhone" render={({ field }) => (
                  <FormItem>
                    <FormLabel>Teléfono</FormLabel>
                    <FormControl><Input type="tel" placeholder="+1 234 567 8900" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )} />
              </div>
            </div>

            {/* Notes + color */}
            <div className="grid grid-cols-[1fr_auto] gap-3 items-start">
              <FormField control={form.control} name="notes" render={({ field }) => (
                <FormItem>
                  <FormLabel>Notas internas</FormLabel>
                  <FormControl><Textarea placeholder="Notas privadas..." rows={2} {...field} /></FormControl>
                  <FormMessage />
                </FormItem>
              )} />
              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <Input type="color" className="h-10 w-14 cursor-pointer rounded" {...field} value={field.value || '#22c55e'} />
                  </FormControl>
                </FormItem>
              )} />
            </div>

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear evento'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
