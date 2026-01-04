import { create } from 'zustand'

export type UserRole = 'ADMIN' | 'CLIENT'

export interface User {
  id: string
  email: string
  name: string | null
  role: UserRole
  clientId?: string | null
}

export interface Client {
  id: string
  name: string
  company: string | null
  email: string
  phone: string | null
  status: 'ACTIVE' | 'PAUSED' | 'INACTIVE'
  createdAt: string
}

export interface Project {
  id: string
  name: string
  description: string | null
  status: 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  startDate: string | null
  estimatedEndDate: string | null
  actualEndDate: string | null
  clientId: string
  client?: Client
  createdAt: string
}

export interface Task {
  id: string
  name: string
  description: string | null
  status: 'PENDING' | 'IN_PROGRESS' | 'BLOCKED' | 'COMPLETED'
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  startDate: string | null
  dueDate: string | null
  completedAt: string | null
  projectId: string
  project?: Project
  createdAt: string
}

export interface Payment {
  id: string
  amount: number
  description: string | null
  status: 'PENDING' | 'PAID' | 'CANCELLED'
  paymentMethod: string | null
  paymentDate: string | null
  dueDate: string | null
  invoiceNumber: string | null
  projectId: string | null
  project?: Project
  clientId: string
  client?: Client
  createdAt: string
}

export interface Document {
  id: string
  name: string
  fileName: string
  filePath: string
  fileSize: number
  mimeType: string
  projectId: string | null
  paymentId: string | null
  clientId: string
  createdAt: string
}

type ViewType = 'dashboard' | 'clients' | 'projects' | 'tasks' | 'payments' | 'documents'

interface AppState {
  // Auth
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean

  // Navigation
  currentView: ViewType
  sidebarOpen: boolean

  // Data
  clients: Client[]
  projects: Project[]
  tasks: Task[]
  payments: Payment[]
  documents: Document[]

  // Actions
  setUser: (user: User | null) => void
  setAuth: (isAuthenticated: boolean) => void
  setLoading: (isLoading: boolean) => void
  setCurrentView: (view: ViewType) => void
  setSidebarOpen: (open: boolean) => void

  // Data actions
  setClients: (clients: Client[]) => void
  addClient: (client: Client) => void
  updateClient: (id: string, client: Partial<Client>) => void
  deleteClient: (id: string) => void

  setProjects: (projects: Project[]) => void
  addProject: (project: Project) => void
  updateProject: (id: string, project: Partial<Project>) => void
  deleteProject: (id: string) => void

  setTasks: (tasks: Task[]) => void
  addTask: (task: Task) => void
  updateTask: (id: string, task: Partial<Task>) => void
  deleteTask: (id: string) => void

  setPayments: (payments: Payment[]) => void
  addPayment: (payment: Payment) => void
  updatePayment: (id: string, payment: Partial<Payment>) => void
  deletePayment: (id: string) => void

  setDocuments: (documents: Document[]) => void
  addDocument: (document: Document) => void
  deleteDocument: (id: string) => void

  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  // Initial state
  user: null,
  isAuthenticated: false,
  isLoading: false,
  currentView: 'dashboard',
  sidebarOpen: true,
  clients: [],
  projects: [],
  tasks: [],
  payments: [],
  documents: [],

  // Actions
  setUser: (user) => set({ user }),
  setAuth: (isAuthenticated) => set({ isAuthenticated }),
  setLoading: (isLoading) => set({ isLoading }),
  setCurrentView: (currentView) => set({ currentView }),
  setSidebarOpen: (sidebarOpen) => set({ sidebarOpen }),

  setClients: (clients) => set({ clients }),
  addClient: (client) => set((state) => ({ clients: [...state.clients, client] })),
  updateClient: (id, clientUpdate) =>
    set((state) => ({
      clients: state.clients.map((c) => (c.id === id ? { ...c, ...clientUpdate } : c)),
    })),
  deleteClient: (id) =>
    set((state) => ({ clients: state.clients.filter((c) => c.id !== id) })),

  setProjects: (projects) => set({ projects }),
  addProject: (project) => set((state) => ({ projects: [...state.projects, project] })),
  updateProject: (id, projectUpdate) =>
    set((state) => ({
      projects: state.projects.map((p) => (p.id === id ? { ...p, ...projectUpdate } : p)),
    })),
  deleteProject: (id) =>
    set((state) => ({ projects: state.projects.filter((p) => p.id !== id) })),

  setTasks: (tasks) => set({ tasks }),
  addTask: (task) => set((state) => ({ tasks: [...state.tasks, task] })),
  updateTask: (id, taskUpdate) =>
    set((state) => ({
      tasks: state.tasks.map((t) => (t.id === id ? { ...t, ...taskUpdate } : t)),
    })),
  deleteTask: (id) => set((state) => ({ tasks: state.tasks.filter((t) => t.id !== id) })),

  setPayments: (payments) => set({ payments }),
  addPayment: (payment) => set((state) => ({ payments: [...state.payments, payment] })),
  updatePayment: (id, paymentUpdate) =>
    set((state) => ({
      payments: state.payments.map((p) => (p.id === id ? { ...p, ...paymentUpdate } : p)),
    })),
  deletePayment: (id) =>
    set((state) => ({ payments: state.payments.filter((p) => p.id !== id) })),

  setDocuments: (documents) => set({ documents }),
  addDocument: (document) => set((state) => ({ documents: [...state.documents, document] })),
  deleteDocument: (id) =>
    set((state) => ({ documents: state.documents.filter((d) => d.id !== id) })),

  logout: () =>
    set({
      user: null,
      isAuthenticated: false,
      clients: [],
      projects: [],
      tasks: [],
      payments: [],
      documents: [],
      currentView: 'dashboard',
    }),
}))
