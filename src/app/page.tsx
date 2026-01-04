'use client'

import { useAppStore } from '@/store/app-store'
import { LoginForm } from '@/components/auth/login-form'
import { Sidebar, SidebarHeader } from '@/components/layout/sidebar'
import { Dashboard } from '@/components/dashboard/dashboard'
import { ClientsModule } from '@/components/clients/clients-module'
import { ProjectsModule } from '@/components/projects/projects-module'
import { TasksModule } from '@/components/tasks/tasks-module'
import { PaymentsModule } from '@/components/payments/payments-module'
import { DocumentsModule } from '@/components/documents/documents-module'
import { useIsMobile } from '@/hooks/use-mobile'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Menu } from 'lucide-react'

export default function Home() {
  const { isAuthenticated, currentView } = useAppStore()
  const isMobile = useIsMobile()

  if (!isAuthenticated) {
    return <LoginForm />
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />
      case 'clients':
        return <ClientsModule />
      case 'projects':
        return <ProjectsModule />
      case 'tasks':
        return <TasksModule />
      case 'payments':
        return <PaymentsModule />
      case 'documents':
        return <DocumentsModule />
      default:
        return <Dashboard />
    }
  }

  const getTitle = () => {
    const titles = {
      dashboard: 'Dashboard',
      clients: 'Clientes',
      projects: 'Proyectos',
      tasks: 'Tareas',
      payments: 'Pagos',
      documents: 'Documentos',
    }
    return titles[currentView as keyof typeof titles] || 'Dashboard'
  }

  if (isMobile) {
    return (
      <div className="min-h-screen flex flex-col">
        <Sheet>
          <SheetTrigger asChild>
            <Button
              variant="ghost"
              size="icon"
              className="fixed top-4 left-4 z-50 w-10 h-10 rounded-xl bg-background/80 backdrop-blur-xl border border-border/50 shadow-sm"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-80 border-r border-border/40">
            <Sidebar />
          </SheetContent>
        </Sheet>

        <main className="flex-1 pt-20 px-4 pb-6">
          <div className="mx-auto max-w-7xl">
            <div className="mb-6">
              <h1 className="text-2xl font-semibold tracking-tight text-foreground">
                {getTitle()}
              </h1>
            </div>
            {renderView()}
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex">
      <aside className="hidden lg:block w-72 border-r border-border/40">
        <Sidebar />
      </aside>

      <main className="flex-1 overflow-auto">
        <SidebarHeader onToggle={() => {}} />
        <div className="container mx-auto px-6 lg:px-8 py-8">
          <div className="mb-6">
            <h1 className="text-2xl font-semibold tracking-tight text-foreground">
              {getTitle()}
            </h1>
          </div>
          {renderView()}
        </div>
      </main>
    </div>
  )
}
