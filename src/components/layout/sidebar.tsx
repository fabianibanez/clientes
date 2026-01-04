'use client'

import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { useAppStore } from '@/store/app-store'
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  DollarSign,
  FileText,
  LogOut,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useState } from 'react'

interface SidebarProps {
  className?: string
}

export function Sidebar({ className }: SidebarProps) {
  const { currentView, setCurrentView, user, logout } = useAppStore()
  const [hoveredItem, setHoveredItem] = useState<string | null>(null)

  const menuItems = [
    {
      id: 'dashboard' as const,
      label: 'Dashboard',
      icon: LayoutDashboard,
      show: true,
    },
    {
      id: 'clients' as const,
      label: 'Clientes',
      icon: Users,
      show: user?.role === 'ADMIN',
    },
    {
      id: 'projects' as const,
      label: 'Proyectos',
      icon: FolderKanban,
      show: true,
    },
    {
      id: 'tasks' as const,
      label: 'Tareas',
      icon: CheckSquare,
      show: true,
    },
    {
      id: 'payments' as const,
      label: 'Pagos',
      icon: DollarSign,
      show: true,
    },
    {
      id: 'documents' as const,
      label: 'Documentos',
      icon: FileText,
      show: true,
    },
  ]

  const visibleMenuItems = menuItems.filter((item) => item.show)

  return (
    <div className={cn('flex h-full flex-col bg-sidebar/50 backdrop-blur-xl', className)}>
      {/* Logo/Brand Section */}
      <div className="h-16 flex items-center px-6 border-b border-border/40">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
            <svg
              className="w-4 h-4 text-primary"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <span className="text-lg font-semibold text-sidebar-foreground">
            Gestión
          </span>
        </div>
      </div>

      {/* Navigation */}
      <ScrollArea className="flex-1 px-3 py-6">
        <nav className="space-y-1">
          {visibleMenuItems.map((item) => {
            const Icon = item.icon
            const isActive = currentView === item.id
            const isHovered = hoveredItem === item.id

            return (
              <Button
                key={item.id}
                variant="ghost"
                className={cn(
                  'w-full justify-start h-11 px-4 gap-3 transition-all duration-200 font-medium',
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-sm'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground',
                  isHovered && !isActive && 'bg-sidebar-accent/80'
                )}
                onClick={() => setCurrentView(item.id)}
                onMouseEnter={() => setHoveredItem(item.id)}
                onMouseLeave={() => setHoveredItem(null)}
              >
                <Icon className="h-4 w-4 flex-shrink-0" />
                <span className="truncate">{item.label}</span>
                {isActive && (
                  <div className="ml-auto w-1.5 h-1.5 rounded-full bg-current opacity-60" />
                )}
              </Button>
            )
          })}
        </nav>
      </ScrollArea>

      {/* Footer with User & Logout */}
      <div className="border-t border-border/40 p-4 space-y-2">
        {user && (
          <div className="px-2 py-3 rounded-xl bg-sidebar-accent/50 mb-2">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                <span className="text-sm font-semibold text-primary">
                  {user.name?.charAt(0).toUpperCase() || 'A'}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-sidebar-foreground truncate">
                  {user.name || 'Usuario'}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  {user.role === 'ADMIN' ? 'Administrador' : 'Cliente'}
                </p>
              </div>
            </div>
          </div>
        )}
        <Button
          variant="ghost"
          className={cn(
            'w-full justify-start h-11 px-4 gap-3 text-muted-foreground',
            'hover:text-destructive hover:bg-destructive/10 transition-all duration-200 font-medium'
          )}
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          <span>Cerrar Sesión</span>
        </Button>
      </div>
    </div>
  )
}

interface SidebarHeaderProps {
  onToggle: () => void
}

export function SidebarHeader({ onToggle }: SidebarHeaderProps) {
  const { user } = useAppStore()

  return (
    <div className="h-16 flex items-center justify-between px-4 lg:px-6 border-b border-border/40 bg-background/80 backdrop-blur-xl sticky top-0 z-10">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
          <svg
            className="w-4 h-4 text-primary"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
        </div>
        <span className="text-lg font-semibold text-foreground">
          Gestión
        </span>
      </div>
      {user && (
        <div className="flex items-center gap-3">
          <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full bg-muted/50">
            <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
              <span className="text-xs font-semibold text-primary">
                {user.name?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <span className="text-sm font-medium text-foreground">
              {user.name || 'Usuario'}
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
