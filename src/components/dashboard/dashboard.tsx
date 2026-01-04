'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { useAppStore } from '@/store/app-store'
import { Users, FolderKanban, CheckSquare, DollarSign, TrendingUp, Clock } from 'lucide-react'

export function Dashboard() {
  const { clients, projects, tasks, payments, user } = useAppStore()

  // Filtrar datos según el rol del usuario
  const filteredClients = user?.role === 'CLIENT' ? clients.filter(c => c.id === user.clientId) : clients
  const filteredProjects = user?.role === 'CLIENT' ? projects.filter(p => p.clientId === user.clientId) : projects
  const filteredPayments = user?.role === 'CLIENT' ? payments.filter(p => p.clientId === user.clientId) : payments

  // Obtener IDs de proyectos filtrados
  const projectIds = filteredProjects.map(p => p.id)
  const filteredTasks = tasks.filter(t => projectIds.includes(t.projectId))

  // Calcular métricas
  const activeProjects = filteredProjects.filter(p => p.status === 'ACTIVE').length
  const completedProjects = filteredProjects.filter(p => p.status === 'COMPLETED').length
  const pendingTasks = filteredTasks.filter(t => t.status === 'PENDING').length
  const inProgressTasks = filteredTasks.filter(t => t.status === 'IN_PROGRESS').length
  const completedTasks = filteredTasks.filter(t => t.status === 'COMPLETED').length
  const pendingPayments = filteredPayments.filter(p => p.status === 'PENDING').length
  const paidPayments = filteredPayments.filter(p => p.status === 'PAID').length
  const totalRevenue = filteredPayments.filter(p => p.status === 'PAID').reduce((sum, p) => sum + p.amount, 0)
  const pendingRevenue = filteredPayments.filter(p => p.status === 'PENDING').reduce((sum, p) => sum + p.amount, 0)

  const stats = [
    {
      title: 'Clientes',
      value: filteredClients.length,
      icon: Users,
      description: `${filteredClients.filter(c => c.status === 'ACTIVE').length} activos`,
      gradient: 'from-blue-500/10 to-blue-600/5',
      iconColor: 'text-blue-500',
    },
    {
      title: 'Proyectos Activos',
      value: activeProjects,
      icon: FolderKanban,
      description: `${completedProjects} completados`,
      gradient: 'from-emerald-500/10 to-emerald-600/5',
      iconColor: 'text-emerald-500',
    },
    {
      title: 'Tareas Pendientes',
      value: pendingTasks,
      icon: Clock,
      description: `${inProgressTasks} en progreso`,
      gradient: 'from-amber-500/10 to-amber-600/5',
      iconColor: 'text-amber-500',
    },
    {
      title: 'Tareas Completadas',
      value: completedTasks,
      icon: CheckSquare,
      description: `${Math.round((completedTasks / Math.max(tasks.length, 1)) * 100)}% de total`,
      gradient: 'from-purple-500/10 to-purple-600/5',
      iconColor: 'text-purple-500',
    },
    {
      title: 'Pagos Pendientes',
      value: pendingPayments,
      icon: DollarSign,
      description: `$${pendingRevenue.toFixed(2)} por cobrar`,
      gradient: 'from-orange-500/10 to-orange-600/5',
      iconColor: 'text-orange-500',
    },
    {
      title: 'Ingresos Totales',
      value: `$${totalRevenue.toFixed(2)}`,
      icon: TrendingUp,
      description: `${paidPayments} pagos recibidos`,
      gradient: 'from-green-500/10 to-green-600/5',
      iconColor: 'text-green-500',
    },
  ]

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-semibold tracking-tight text-foreground mb-2">
          Dashboard
        </h1>
        <p className="text-muted-foreground text-lg">
          Bienvenido{user?.name ? `, ${user.name}` : ''}
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title} className="rounded-2xl overflow-hidden group shadow-sm hover:shadow-md transition-all duration-300">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2.5 rounded-xl bg-gradient-to-br ${stat.gradient} ${stat.iconColor} transition-all duration-300 group-hover:scale-110`}>
                  <Icon className="h-4 w-4" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <p className="text-xs text-muted-foreground font-medium">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Content Grid */}
      <div className="grid gap-5 md:grid-cols-2">
        {/* Proyectos Recientes */}
        <Card className="rounded-2xl bg-card/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Proyectos Recientes
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredProjects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <FolderKanban className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No hay proyectos registrados
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredProjects.slice(0, 5).map((project) => (
                  <div
                    key={project.id}
                    className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-all duration-300 cursor-pointer"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-foreground text-sm truncate mb-1">
                          {project.name}
                        </p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {project.description || 'Sin descripción'}
                        </p>
                      </div>
                      <span
                        className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                          project.status === 'ACTIVE'
                            ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400'
                            : project.status === 'COMPLETED'
                            ? 'bg-slate-500/10 text-slate-600 dark:text-slate-400'
                            : 'bg-amber-500/10 text-amber-600 dark:text-amber-400'
                        }`}
                      >
                        {project.status === 'ACTIVE'
                          ? 'Activo'
                          : project.status === 'COMPLETED'
                          ? 'Completado'
                          : 'Pausado'}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Tareas Urgentes */}
        <Card className="rounded-2xl bg-card/80 backdrop-blur-xl shadow-sm">
          <CardHeader className="pb-4">
            <CardTitle className="text-lg font-semibold">
              Tareas Prioritarias
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {filteredTasks.filter(t => t.priority === 'HIGH' || t.priority === 'URGENT').length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                  <CheckSquare className="h-5 w-5 text-muted-foreground/50" />
                </div>
                <p className="text-sm text-muted-foreground">
                  No hay tareas urgentes
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {filteredTasks
                  .filter(t => t.priority === 'HIGH' || t.priority === 'URGENT')
                  .slice(0, 5)
                  .map((task) => {
                    const project = filteredProjects.find(p => p.id === task.projectId)
                    return (
                      <div
                        key={task.id}
                        className="p-3.5 rounded-xl bg-muted/40 hover:bg-muted/60 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-foreground text-sm truncate mb-1">
                              {task.name}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {project?.name || 'Sin proyecto'}
                            </p>
                          </div>
                          <span
                            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all duration-200 ${
                              task.priority === 'URGENT'
                                ? 'bg-red-500/10 text-red-600 dark:text-red-400'
                                : 'bg-orange-500/10 text-orange-600 dark:text-orange-400'
                            }`}
                          >
                            {task.priority === 'URGENT' ? 'Urgente' : 'Alta'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Pagos Pendientes */}
      <Card className="rounded-2xl bg-card/80 backdrop-blur-xl shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="text-lg font-semibold">
            Pagos Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {filteredPayments.filter(p => p.status === 'PENDING').length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-muted/50 flex items-center justify-center mb-3">
                <DollarSign className="h-5 w-5 text-muted-foreground/50" />
              </div>
              <p className="text-sm text-muted-foreground">
                No hay pagos pendientes
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {filteredPayments
                .filter(p => p.status === 'PENDING')
                .slice(0, 5)
                .map((payment) => {
                  const client = filteredClients.find(c => c.id === payment.clientId)
                  const project = filteredProjects.find(p => p.id === payment.projectId)
                  return (
                    <div
                      key={payment.id}
                      className="p-4 rounded-xl bg-muted/40 hover:bg-muted/60 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-foreground text-sm mb-1">
                            {payment.description || 'Sin descripción'}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {client?.name || 'Sin cliente'}
                            {project && ` - ${project.name}`}
                          </p>
                        </div>
                        <div className="text-right ml-4">
                          <p className="text-lg font-semibold text-foreground">
                            ${payment.amount.toFixed(2)}
                          </p>
                          {payment.dueDate && (
                            <p className="text-xs text-muted-foreground mt-1">
                              Vence: {new Date(payment.dueDate).toLocaleDateString('es-ES')}
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  )
                })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
