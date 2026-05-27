'use client'

import { Copy, Key, Plus, Trash2 } from 'lucide-react'
import { useEffect, useState } from 'react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/components/ui/use-toast'

interface Token {
  id: string
  label: string
  token: string
  expiresAt?: string | null
  lastUsedAt?: string | null
  createdAt: string
}

interface TokenManagerProps {
  open: boolean
  onClose: () => void
}

export function TokenManager({ open, onClose }: TokenManagerProps) {
  const [tokens, setTokens] = useState<Token[]>([])
  const [loading, setLoading] = useState(false)
  const [newLabel, setNewLabel] = useState('')
  const [newExpiry, setNewExpiry] = useState('')
  const [freshToken, setFreshToken] = useState<string | null>(null)
  const { toast } = useToast()

  const load = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/tokens')
      if (res.ok) {
        const data = await res.json()
        setTokens(Array.isArray(data) ? data : (data.tokens ?? []))
      }
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (open) {
      void load()
      setFreshToken(null)
    }
  }, [open])

  const generate = async () => {
    if (!newLabel.trim()) {
      toast({ variant: 'destructive', title: 'La etiqueta es obligatoria' })
      return
    }
    try {
      const res = await fetch('/api/tokens', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ label: newLabel, expiresAt: newExpiry || undefined }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error ?? 'Error al generar token')
      setFreshToken(data.token?.token ?? data.token)
      setNewLabel('')
      setNewExpiry('')
      await load()
    } catch (err) {
      toast({ variant: 'destructive', title: err instanceof Error ? err.message : 'Error' })
    }
  }

  const deleteToken = async (id: string) => {
    try {
      const res = await fetch(`/api/tokens/${id}`, { method: 'DELETE' })
      if (!res.ok) throw new Error()
      setTokens((prev) => prev.filter((t) => t.id !== id))
      toast({ title: 'Token eliminado' })
    } catch {
      toast({ variant: 'destructive', title: 'No se pudo eliminar el token' })
    }
  }

  const copy = (text: string) => {
    void navigator.clipboard.writeText(text)
    toast({ title: 'Copiado al portapapeles' })
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" aria-describedby={undefined}>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Key className="size-4" />
            Tokens de API
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Alert for new token */}
          {freshToken && (
            <div className="rounded-lg border border-primary/30 bg-primary/5 p-3">
              <p className="mb-1.5 text-sm font-semibold text-primary">¡Token generado!</p>
              <p className="mb-2 text-xs text-muted-foreground">Copia este token ahora — no se mostrará de nuevo.</p>
              <div className="flex gap-2">
                <code className="flex-1 truncate rounded bg-muted px-2 py-1 text-xs">{freshToken}</code>
                <Button size="sm" variant="outline" onClick={() => copy(freshToken)}>
                  <Copy className="size-3.5" />
                </Button>
              </div>
            </div>
          )}

          {/* Generate form */}
          <div className="rounded-lg border p-3 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Generar nuevo token</p>
            <div className="grid grid-cols-[1fr_auto] gap-2 items-end">
              <div className="space-y-1">
                <Label className="text-xs">Etiqueta</Label>
                <Input
                  placeholder="Ej. Agente IA, App móvil..."
                  value={newLabel}
                  onChange={(e) => setNewLabel(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && void generate()}
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Expira (opcional)</Label>
                <Input
                  type="date"
                  value={newExpiry}
                  onChange={(e) => setNewExpiry(e.target.value)}
                />
              </div>
            </div>
            <Button onClick={generate} className="w-full gap-2">
              <Plus className="size-4" />
              Generar token
            </Button>
          </div>

          {/* Token list */}
          <div className="space-y-2">
            {loading ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Cargando...</p>
            ) : tokens.length === 0 ? (
              <p className="py-4 text-center text-sm text-muted-foreground">Sin tokens generados</p>
            ) : (
              tokens.map((token) => (
                <div key={token.id} className="flex items-center gap-3 rounded-lg border px-3 py-2.5">
                  <Key className="size-4 shrink-0 text-muted-foreground" />
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-sm font-medium">{token.label}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      {token.expiresAt && (
                        <Badge variant="outline" className="text-xs">
                          Expira {new Date(token.expiresAt).toLocaleDateString('es')}
                        </Badge>
                      )}
                      {token.lastUsedAt && (
                        <span className="text-xs text-muted-foreground">
                          Último uso: {new Date(token.lastUsedAt).toLocaleDateString('es')}
                        </span>
                      )}
                    </div>
                  </div>
                  <Button size="icon" variant="ghost" className="size-8 text-destructive hover:text-destructive" onClick={() => void deleteToken(token.id)}>
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cerrar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
