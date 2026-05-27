'use client'

import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export interface DaySchedule {
  enabled: boolean
  start: string
  end: string
}

export type WeekSchedule = Record<string, DaySchedule>

interface ScheduleEditorProps {
  value: WeekSchedule
  onChange: (value: WeekSchedule) => void
}

const DAYS = [
  { key: 'monday', label: 'Lunes' },
  { key: 'tuesday', label: 'Martes' },
  { key: 'wednesday', label: 'Miércoles' },
  { key: 'thursday', label: 'Jueves' },
  { key: 'friday', label: 'Viernes' },
  { key: 'saturday', label: 'Sábado' },
  { key: 'sunday', label: 'Domingo' },
]

const DEFAULT_DAY: DaySchedule = { enabled: false, start: '09:00', end: '17:00' }

export function ScheduleEditor({ value, onChange }: ScheduleEditorProps) {
  const getDay = (key: string): DaySchedule => value[key] ?? DEFAULT_DAY

  const update = (key: string, patch: Partial<DaySchedule>) => {
    onChange({ ...value, [key]: { ...getDay(key), ...patch } })
  }

  return (
    <div className="space-y-1 rounded-lg border p-3">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Disponibilidad semanal
      </p>
      {DAYS.map(({ key, label }) => {
        const day = getDay(key)
        return (
          <div
            key={key}
            className={cn(
              'grid grid-cols-[120px_1fr] items-center gap-3 rounded-md px-2 py-2 transition-colors',
              day.enabled ? 'bg-primary/5' : 'opacity-60',
            )}
          >
            <div className="flex items-center gap-2">
              <Switch
                checked={day.enabled}
                onCheckedChange={(checked) => update(key, { enabled: checked })}
              />
              <Label className="text-sm font-medium">{label}</Label>
            </div>
            {day.enabled ? (
              <div className="flex items-center gap-2">
                <Input
                  type="time"
                  value={day.start}
                  onChange={(e) => update(key, { start: e.target.value })}
                  className="h-8 w-28 text-sm"
                />
                <span className="text-muted-foreground">–</span>
                <Input
                  type="time"
                  value={day.end}
                  onChange={(e) => update(key, { end: e.target.value })}
                  className="h-8 w-28 text-sm"
                />
              </div>
            ) : (
              <span className="text-xs text-muted-foreground">No disponible</span>
            )}
          </div>
        )
      })}
    </div>
  )
}
