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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'
import { Plus, Pencil, Trash2, CheckSquare, Clock, AlertCircle } from 'lucide-react'
import { toast } from 'sonner'

type ViewMode = 'list' | 'kanban'

export function TasksModule() {
  const { tasks, projects, addTask, updateTask, deleteTask, user } = useAppStore()
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState<ReturnType<typeof useAppStore.getState>['tasks'][0] | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')
  const [filterProject, setFilterProject] = useState<string>('all')
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED',
    priority: 'MEDIUM' as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
    projectId: '',
    startDate: '',
    dueDate: '',
  })

  const filteredProjects = user?.role === 'CLIENT'
    ? projects.filter(p => p.clientId === user.clientId)
    : projects

  const projectIds = filteredProjects.map(p => p.id)
  const filteredTasks = tasks.filter(t => projectIds.includes(t.projectId))

  const filteredTasksList = filteredTasks.filter(task => {
    const statusMatch = filterStatus === 'all' || task.status === filterStatus
    const projectMatch = filterProject === 'all' || task.projectId === filterProject
    return statusMatch && projectMatch
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const taskData = {
        ...formData,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        completedAt: formData.status === 'COMPLETED' ? new Date().toISOString() : null,
      }

      if (editingTask) {
        updateTask(editingTask.id, taskData)
        toast.success('Tarea actualizada correctamente')
      } else {
        const newTask = {
          id: Math.random().toString(36).substr(2, 9),
          ...taskData,
          completedAt: null,
          createdAt: new Date().toISOString(),
        }
        addTask(newTask)
        toast.success('Tarea creada correctamente')
      }

      setIsDialogOpen(false)
      setEditingTask(null)
      resetForm()
    } catch (error) {
      toast.error('Error al guardar tarea')
    }
  }

  const handleEdit = (task: typeof tasks[0]) => {
    setEditingTask(task)
    setFormData({
      name: task.name,
      description: task.description || '',
      status: task.status,
      priority: task.priority,
      projectId: task.projectId,
      startDate: task.startDate ? new Date(task.startDate).toISOString().split('T')[0] : '',
      dueDate: task.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : '',
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar esta tarea?')) {
      deleteTask(id)
      toast.success('Tarea eliminada correctamente')
    }
  }

  const handleStatusChange = (taskId: string, newStatus: any) => {
    const completedAt = newStatus === 'COMPLETED' ? new Date().toISOString() : null
    updateTask(taskId, { status: newStatus, completedAt })
    toast.success('Estado de tarea actualizado')
  }

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      status: 'PENDING',
      priority: 'MEDIUM',
      projectId: '',
      startDate: '',
      dueDate: '',
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingTask(null)
      resetForm()
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'URGENT':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
      case 'HIGH':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200'
      case 'MEDIUM':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
      case 'LOW':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      default:
        return 'bg-slate-100 text-slate-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <Clock className="h-4 w-4" />
      case 'IN_PROGRESS':
        return <CheckSquare className="h-4 w-4" />
      case 'BLOCKED':
        return <AlertCircle className="h-4 w-4" />
      case 'COMPLETED':
        return <CheckSquare className="h-4 w-4" />
      default:
        return null
    }
  }

  const kanbanColumns = [
    { id: 'PENDING', title: 'Pendiente', icon: Clock },
    { id: 'IN_PROGRESS', title: 'En Progreso', icon: CheckSquare },
    { id: 'BLOCKED', title: 'Bloqueada', icon: AlertCircle },
    { id: 'COMPLETED', title: 'Completada', icon: CheckSquare },
  ]

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Tareas</h2>
          <p className="text-muted-foreground">
            Gestión de tareas por proyecto
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
          >
            Lista
          </Button>
          <Button
            variant={viewMode === 'kanban' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('kanban')}
          >
            Kanban
          </Button>
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nueva Tarea
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingTask ? 'Editar Tarea' : 'Nueva Tarea'}
                </DialogTitle>
                <DialogDescription>
                  {editingTask
                    ? 'Actualiza la información de la tarea'
                    : 'Completa la información para crear una nueva tarea'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre de la Tarea *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="project">Proyecto *</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                      required
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Selecciona un proyecto" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProjects.map((project) => (
                          <SelectItem key={project.id} value={project.id}>
                            {project.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={3}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridad</Label>
                      <Select
                        value={formData.priority}
                        onValueChange={(value) => setFormData({ ...formData, priority: value as any })}
                      >
                        <SelectTrigger id="priority">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="LOW">Baja</SelectItem>
                          <SelectItem value="MEDIUM">Media</SelectItem>
                          <SelectItem value="HIGH">Alta</SelectItem>
                          <SelectItem value="URGENT">Urgente</SelectItem>
                        </SelectContent>
                      </Select>
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
                          <SelectItem value="PENDING">Pendiente</SelectItem>
                          <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                          <SelectItem value="BLOCKED">Bloqueada</SelectItem>
                          <SelectItem value="COMPLETED">Completada</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
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
                      <Label htmlFor="dueDate">Fecha Límite</Label>
                      <Input
                        id="dueDate"
                        type="date"
                        value={formData.dueDate}
                        onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      />
                    </div>
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
                    {editingTask ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Filtros */}
      <div className="flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Label htmlFor="filterStatus">Estado:</Label>
          <Select value={filterStatus} onValueChange={setFilterStatus}>
            <SelectTrigger id="filterStatus" className="w-[150px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="PENDING">Pendiente</SelectItem>
              <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
              <SelectItem value="BLOCKED">Bloqueada</SelectItem>
              <SelectItem value="COMPLETED">Completada</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Label htmlFor="filterProject">Proyecto:</Label>
          <Select value={filterProject} onValueChange={setFilterProject}>
            <SelectTrigger id="filterProject" className="w-[200px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              {filteredProjects.map((project) => (
                <SelectItem key={project.id} value={project.id}>
                  {project.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Vista Lista */}
      {viewMode === 'list' && (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Tareas</CardTitle>
          </CardHeader>
          <CardContent>
            {filteredTasksList.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-8">
                No hay tareas registradas
              </p>
            ) : (
              <div className="space-y-4">
                {filteredTasksList.map((task) => {
                  const project = projects.find(p => p.id === task.projectId)
                  return (
                    <Card key={task.id}>
                      <CardContent className="pt-6">
                        <div className="flex items-start justify-between gap-4">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              {getStatusIcon(task.status)}
                              <h3 className="font-semibold">{task.name}</h3>
                              <Badge className={getPriorityColor(task.priority)}>
                                {task.priority === 'LOW' ? 'Baja' : task.priority === 'MEDIUM' ? 'Media' : task.priority === 'HIGH' ? 'Alta' : 'Urgente'}
                              </Badge>
                            </div>
                            {task.description && (
                              <p className="text-sm text-muted-foreground">
                                {task.description}
                              </p>
                            )}
                            <div className="flex items-center gap-4 text-sm text-muted-foreground">
                              <span>Proyecto: {project?.name || 'Sin proyecto'}</span>
                              {task.dueDate && (
                                <span>Límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Select
                              value={task.status}
                              onValueChange={(value) => handleStatusChange(task.id, value)}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="PENDING">Pendiente</SelectItem>
                                <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                <SelectItem value="BLOCKED">Bloqueada</SelectItem>
                                <SelectItem value="COMPLETED">Completada</SelectItem>
                              </SelectContent>
                            </Select>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(task)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(task.id)}
                            >
                              <Trash2 className="h-4 w-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* Vista Kanban */}
      {viewMode === 'kanban' && (
        <ScrollArea className="h-[calc(100vh-350px)]">
          <div className="flex gap-4 pb-4">
            {kanbanColumns.map((column) => {
              const ColumnIcon = column.icon
              const columnTasks = filteredTasks.filter(t => t.status === column.id)
              return (
                <Card key={column.id} className="min-w-[300px] flex-shrink-0">
                  <CardHeader className="pb-3">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <ColumnIcon className="h-4 w-4" />
                      {column.title}
                      <Badge variant="secondary">{columnTasks.length}</Badge>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {columnTasks.map((task) => {
                        const project = projects.find(p => p.id === task.projectId)
                        return (
                          <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                            <CardContent className="p-4">
                              <div className="space-y-2">
                                <div className="flex items-start justify-between gap-2">
                                  <h4 className="font-medium text-sm flex-1">{task.name}</h4>
                                  <Badge className={getPriorityColor(task.priority)} variant="secondary">
                                    {task.priority === 'LOW' ? 'Baja' : task.priority === 'MEDIUM' ? 'Media' : task.priority === 'HIGH' ? 'Alta' : 'Urg'}
                                  </Badge>
                                </div>
                                {task.description && (
                                  <p className="text-xs text-muted-foreground line-clamp-2">
                                    {task.description}
                                  </p>
                                )}
                                <p className="text-xs text-muted-foreground">
                                  {project?.name || 'Sin proyecto'}
                                </p>
                                {task.dueDate && (
                                  <p className="text-xs text-muted-foreground">
                                    Límite: {new Date(task.dueDate).toLocaleDateString('es-ES')}
                                  </p>
                                )}
                                <div className="flex gap-2 pt-2">
                                  <Select
                                    value={task.status}
                                    onValueChange={(value) => handleStatusChange(task.id, value)}
                                  >
                                    <SelectTrigger className="h-8 text-xs">
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="PENDING">Pendiente</SelectItem>
                                      <SelectItem value="IN_PROGRESS">En Progreso</SelectItem>
                                      <SelectItem value="BLOCKED">Bloqueada</SelectItem>
                                      <SelectItem value="COMPLETED">Completada</SelectItem>
                                    </SelectContent>
                                  </Select>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleEdit(task)}
                                  >
                                    <Pencil className="h-3 w-3" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 w-8 p-0"
                                    onClick={() => handleDelete(task.id)}
                                  >
                                    <Trash2 className="h-3 w-3 text-destructive" />
                                  </Button>
                                </div>
                              </div>
                            </CardContent>
                          </Card>
                        )
                      })}
                      {columnTasks.length === 0 && (
                        <p className="text-xs text-muted-foreground text-center py-4">
                          No hay tareas
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </ScrollArea>
      )}
    </div>
  )
}
