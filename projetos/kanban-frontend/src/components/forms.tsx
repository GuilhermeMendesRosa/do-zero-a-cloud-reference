import { useEffect, useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Task } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

const nameSchema = z.object({ name: z.string().trim().min(1, "Informe um nome").max(120, "Use no máximo 120 caracteres") })
type NameValues = z.infer<typeof nameSchema>

interface NameDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  initialName?: string
  submitLabel?: string
  pending?: boolean
  onSubmit: (name: string) => Promise<void> | void
}

export function NameDialog({ open, onOpenChange, title, description, initialName = "", submitLabel = "Salvar", pending, onSubmit }: NameDialogProps) {
  const form = useForm<NameValues>({ resolver: zodResolver(nameSchema), defaultValues: { name: initialName } })
  useEffect(() => { if (open) form.reset({ name: initialName }) }, [open, initialName, form])

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>{title}</DialogTitle><DialogDescription>{description}</DialogDescription></DialogHeader>
      <form className="space-y-5" onSubmit={form.handleSubmit(async ({ name }) => { await onSubmit(name.trim()); onOpenChange(false) })}>
        <div className="space-y-2"><Label htmlFor="resource-name">Nome</Label><Input id="resource-name" autoFocus {...form.register("name")} /><p className="text-xs text-red-600">{form.formState.errors.name?.message}</p></div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando…" : submitLabel}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}

const taskSchema = z.object({
  name: z.string().trim().min(1, "Informe um nome").max(120, "Use no máximo 120 caracteres"),
  dueDate: z.string(),
  tags: z.string().refine((value) => value.split(",").every((tag) => tag.trim().length <= 40), "Cada tag deve ter no máximo 40 caracteres"),
})
type TaskValues = z.infer<typeof taskSchema>

export interface TaskFormValues { name: string; dueDate: string | null; tags: string[] }

interface TaskDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  task?: Task
  pending?: boolean
  onSubmit: (values: TaskFormValues) => Promise<void> | void
}

export function TaskDialog({ open, onOpenChange, task, pending, onSubmit }: TaskDialogProps) {
  const form = useForm<TaskValues>({ resolver: zodResolver(taskSchema), defaultValues: { name: "", dueDate: "", tags: "" } })
  useEffect(() => {
    if (open) form.reset({ name: task?.name ?? "", dueDate: task?.dueDate?.slice(0, 10) ?? "", tags: task?.tags.join(", ") ?? "" })
  }, [open, task, form])

  return <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent>
      <DialogHeader><DialogTitle>{task ? "Editar tarefa" : "Nova tarefa"}</DialogTitle><DialogDescription>Organize o trabalho com prazo e tags opcionais.</DialogDescription></DialogHeader>
      <form className="space-y-4" onSubmit={form.handleSubmit(async (values) => {
        const tags = [...new Set(values.tags.split(",").map((tag) => tag.trim()).filter(Boolean))]
        const dueDate = values.dueDate ? new Date(`${values.dueDate}T23:59:59.999`).toISOString() : null
        await onSubmit({ name: values.name.trim(), dueDate, tags }); onOpenChange(false)
      })}>
        <div className="space-y-2"><Label htmlFor="task-name">Nome</Label><Input id="task-name" autoFocus {...form.register("name")} /><p className="text-xs text-red-600">{form.formState.errors.name?.message}</p></div>
        <div className="space-y-2"><Label htmlFor="task-due">Prazo</Label><Input id="task-due" type="date" {...form.register("dueDate")} /></div>
        <div className="space-y-2"><Label htmlFor="task-tags">Tags</Label><Input id="task-tags" placeholder="backend, urgente, revisão" {...form.register("tags")} /><p className="text-xs text-neutral-500">Separe as tags com vírgulas.</p><p className="text-xs text-red-600">{form.formState.errors.tags?.message}</p></div>
        <DialogFooter><Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Cancelar</Button><Button type="submit" disabled={pending}>{pending ? "Salvando…" : "Salvar tarefa"}</Button></DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
}

interface ConfirmProps { title: string; description: string; onConfirm: () => Promise<void> | void; children: React.ReactNode }
export function ConfirmAction({ title, description, onConfirm, children }: ConfirmProps) {
  const [open, setOpen] = useState(false)
  return <AlertDialog open={open} onOpenChange={setOpen}>
    <span onClick={() => setOpen(true)}>{children}</span>
    <AlertDialogContent>
      <AlertDialogHeader><AlertDialogTitle>{title}</AlertDialogTitle><AlertDialogDescription>{description}</AlertDialogDescription></AlertDialogHeader>
      <AlertDialogFooter><AlertDialogCancel>Cancelar</AlertDialogCancel><AlertDialogAction onClick={async (event) => { event.preventDefault(); await onConfirm(); setOpen(false) }}>Excluir</AlertDialogAction></AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
}
