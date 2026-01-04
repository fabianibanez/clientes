'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useAppStore } from '@/store/app-store'
import { Plus, Pencil, Trash2, FolderKanban } from 'lucide-react'
import { toast } from 'sonner'

export function ProjectsModule() {
  const { projects, clients, addProject, updateProject, deleteProject, user } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<ReturnType<typeof useAppStore.getState>['projects'][0] | null>(null)
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'ACTIVE' as 'ACTIVE' | 'PAUSED' | 'COMPLETED',
    clientId: '',
    startDate: '',
    estimatedEndDate: '',
  })

  const filteredClients = user?.role === 'CLIENT'
    ? clients.filter(c => c.id === user.clientId)
    : clients

  const filteredProjects = user?.role === 'CLIENT'
    ? projects.filter(p => p.clientId === user.clientId)
    : projects

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const projectData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        estimatedEndDate: formData.estimatedEndDate ? new Date(formData.estimatedEndDate).toISOString() : null,
      }

      if (editingProject) {
        updateProject(editingProject.id, projectData)
        toast.success('Proyecto actualizado correctamente')
      } else {
        const newProject = {
          id: Math.random().toString(36).substr(2, 9),
          ...projectData,
          actualEndDate: null,
          createdAt: new Date().toISOString(),
        }
        addProject(newProject)
        toast.success('Proyecto creado correctamente')
      }

      setIsDialogOpen(false)
      setEditingProject(null)
      resetForm()
    } catch (error) {
      toast.error('Error al guardar proyecto')
    }
  }

  const handleEdit = (project: typeof projects[0]) => {
    setEditingProject(project)
    setFormData({
      name: project.name,
      description: project.description || '',
      status: project.status,
      clientId: project.clientId,
      startDate: project.startDate ? new Date(project.startDate).toISOString().split('T')[0] : '',
      estimatedEndDate: project.estimatedEndDate ? new Date(project.estimatedEndDate).toISOString().split('T')[0] : '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este proyecto?')) {
      deleteProject(id)
      toast.success('Proyecto eliminado correctamente')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'ACTIVE',
      clientId: '',
      startDate: '',
      estimatedEndDate: '',
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingProject(null)
      resetForm()
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Proyectos</h2>
          <p className="text-muted-foreground">
            Gestión de proyectos por cliente
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Proyecto
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingProject ? 'Editar Proyecto' : 'Nuevo Proyecto'}
                </DialogTitle>
                <DialogDescription>
                  {editingProject
                    ? 'Actualiza la información del proyecto'
                    : 'Completa la información para crear un nuevo proyecto'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre del Proyecto *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={(value) => setFormData({ ...formData, clientId: value })}
                      required
                    >
                      <SelectTrigger id="client">
                        <SelectValue placeholder="Selecciona un cliente" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredClients.map((client) => (
                          <SelectItem key={client.id} value={client.id}>
                            {client.name} {client.company && `(${client.company})`}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción / Alcance</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      placeholder="Describe el alcance, objetivos y notas del proyecto..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="startDate">Fecha Inicio</Label>
                      <Input
                        id="startDate"
                        type="date"
                        value={formData.startDate}
                        onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="estimatedEndDate">Fecha Estimada Término</Label>
                      <Input
                        id="estimatedEndDate"
                        type="date"
                        value={formData.estimatedEndDate}
                        onChange={(e) => setFormData({ ...formData, estimatedEndDate: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Estado</Label>
                    <Select
                      value={formData.status}
                      onValueChange={(value) => setFormData({ ...formData, status: value as any })}
                    >
                      <SelectTrigger id="status">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="ACTIVE">Activo</SelectItem>
                        <SelectItem value="PAUSED">Pausado</SelectItem>
                        <SelectItem value="COMPLETED">Completado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleDialogClose(false)}
                  >
                    Cancelar
                  </Button>
                  <Button type="submit">
                    {editingProject ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Proyectos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredProjects.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay proyectos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>Estado</TableHead>
                  {user?.role === 'ADMIN' && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjects.map((project) => {
                  const client = clients.find(c => c.id === project.clientId)
                  return (
                    <TableRow key={project.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <FolderKanban className="h-4 w-4 text-muted-foreground" />
                          {project.name}
                        </div>
                      </TableCell>
                      <TableCell>{client?.name || 'Sin cliente'}</TableCell>
                      <TableCell className="max-w-xs">
                        <p className="text-sm text-muted-foreground truncate">
                          {project.description || 'Sin descripción'}
                        </p>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          {project.startDate && (
                            <p>Inicio: {new Date(project.startDate).toLocaleDateString('es-ES')}</p>
                          )}
                          {project.estimatedEndDate && (
                            <p>Término: {new Date(project.estimatedEndDate).toLocaleDateString('es-ES')}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            project.status === 'ACTIVE'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : project.status === 'COMPLETED'
                              ? 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-200'
                              : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                          }`}
                        >
                          {project.status === 'ACTIVE'
                            ? 'Activo'
                            : project.status === 'COMPLETED'
                            ? 'Completado'
                            : 'Pausado'}
                        </span>
                      </TableCell>
                      {user?.role === 'ADMIN' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(project)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(project.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      )}
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
