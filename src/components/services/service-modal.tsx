'use client'

import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import {
  Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,
} from '@/components/ui/form'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import type { ServiceItem as Service } from '@/types'

const schema = z.object({
  name: z.string().min(1, 'El nombre es obligatorio'),
  description: z.string().optional(),
  duration: z.number().min(5, 'Mínimo 5 minutos').max(480, 'Máximo 480 minutos'),
  bufferTime: z.number().min(0).max(120),
  maxBookings: z.number().min(1),
  color: z.string(),
  isActive: z.boolean(),
})

type FormValues = z.infer<typeof schema>

interface ServiceModalProps {
  open: boolean
  service?: Service | null
  onClose: () => void
  onSave: (data: FormValues & { id?: string }) => Promise<void>
}

export function ServiceModal({ open, service, onClose, onSave }: ServiceModalProps) {
  const isEditing = !!service

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {
      name: '',
      description: '',
      duration: 60,
      bufferTime: 0,
      maxBookings: 1,
      color: '#22c55e',
      isActive: true,
    },
  })

  useEffect(() => {
    if (open) {
      form.reset(
        service
          ? {
              name: service.name,
              description: service.description ?? '',
              duration: service.duration,
              bufferTime: service.bufferTime,
              maxBookings: service.maxBookings,
              color: service.color,
              isActive: service.isActive,
            }
          : {
              name: '',
              description: '',
              duration: 60,
              bufferTime: 0,
              maxBookings: 1,
              color: '#22c55e',
              isActive: true,
            },
      )
    }
  }, [open, service])

  const handleSubmit = async (values: FormValues) => {
    await onSave({ ...values, id: service?.id })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>Nombre *</FormLabel>
                <FormControl><Input placeholder="Ej. Consulta inicial" {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="description" render={({ field }) => (
              <FormItem>
                <FormLabel>Descripción</FormLabel>
                <FormControl><Textarea placeholder="Descripción del servicio..." rows={2} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="duration" render={({ field }) => (
                <FormItem>
                  <FormLabel>Duración (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={5} max={480}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="bufferTime" render={({ field }) => (
                <FormItem>
                  <FormLabel>Tiempo buffer (min)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0} max={120}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <FormField control={form.control} name="maxBookings" render={({ field }) => (
                <FormItem>
                  <FormLabel>Máx. reservas por turno</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={1}
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />

              <FormField control={form.control} name="color" render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <FormControl>
                    <div className="flex gap-2 items-center">
                      <Input type="color" className="h-9 w-14 cursor-pointer rounded" {...field} />
                      <Input {...field} placeholder="#22c55e" className="flex-1" />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )} />
            </div>

            <FormField control={form.control} name="isActive" render={({ field }) => (
              <FormItem className="flex items-center justify-between rounded-lg border p-3">
                <div>
                  <FormLabel className="text-sm font-medium">Activo</FormLabel>
                  <FormDescription className="text-xs">
                    Los servicios activos están disponibles para reservas
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch checked={field.value} onCheckedChange={field.onChange} />
                </FormControl>
              </FormItem>
            )} />

            <DialogFooter className="gap-2">
              <Button type="button" variant="outline" onClick={onClose}>Cancelar</Button>
              <Button type="submit" disabled={form.formState.isSubmitting}>
                {form.formState.isSubmitting ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear servicio'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
