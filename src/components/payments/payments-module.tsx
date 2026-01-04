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
import { Plus, Pencil, Trash2, DollarSign, Download, FileText } from 'lucide-react'
import { toast } from 'sonner'

export function PaymentsModule() {
  const { payments, projects, clients, addPayment, updatePayment, deletePayment, user } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [editingPayment, setEditingPayment] = useState<ReturnType<typeof useAppStore.getState>['payments'][0] | null>(null)
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    status: 'PENDING' as 'PENDING' | 'PAID' | 'CANCELLED',
    paymentMethod: '',
    paymentDate: '',
    dueDate: '',
    invoiceNumber: '',
    projectId: '',
    clientId: '',
  })

  const filteredClients = user?.role === 'CLIENT'
    ? clients.filter(c => c.id === user.clientId)
    : clients

  const filteredProjects = user?.role === 'CLIENT'
    ? projects.filter(p => p.clientId === user.clientId)
    : projects

  const filteredPayments = user?.role === 'CLIENT'
    ? payments.filter(p => p.clientId === user.clientId)
    : payments

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const paymentData = {
        ...formData,
        amount: parseFloat(formData.amount),
        paymentDate: formData.paymentDate ? new Date(formData.paymentDate).toISOString() : null,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
        projectId: formData.projectId || null,
      }

      if (editingPayment) {
        updatePayment(editingPayment.id, paymentData)
        toast.success('Pago actualizado correctamente')
      } else {
        const newPayment = {
          id: Math.random().toString(36).substr(2, 9),
          ...paymentData,
          createdAt: new Date().toISOString(),
        }
        addPayment(newPayment)
        toast.success('Pago creado correctamente')
      }

      setIsDialogOpen(false)
      setEditingPayment(null)
      resetForm()
    } catch (error) {
      toast.error('Error al guardar pago')
    }
  }

  const handleEdit = (payment: typeof payments[0]) => {
    setEditingPayment(payment)
    setFormData({
      amount: payment.amount.toString(),
      description: payment.description || '',
      status: payment.status,
      paymentMethod: payment.paymentMethod || '',
      paymentDate: payment.paymentDate ? new Date(payment.paymentDate).toISOString().split('T')[0] : '',
      dueDate: payment.dueDate ? new Date(payment.dueDate).toISOString().split('T')[0] : '',
      invoiceNumber: payment.invoiceNumber || '',
      projectId: payment.projectId || '',
      clientId: payment.clientId,
    })
    setIsDialogOpen(true)
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este pago?')) {
      deletePayment(id)
      toast.success('Pago eliminado correctamente')
    }
  }

  const resetForm = () => {
    setFormData({
      amount: '',
      description: '',
      status: 'PENDING',
      paymentMethod: '',
      paymentDate: '',
      dueDate: '',
      invoiceNumber: '',
      projectId: '',
      clientId: '',
    })
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      setEditingPayment(null)
      resetForm()
    }
  }

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, clientId, projectId: '' })
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Pagos</h2>
          <p className="text-muted-foreground">
            Gestión de pagos y facturación
          </p>
        </div>
        {user?.role === 'ADMIN' && (
          <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Nuevo Pago
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[600px]">
              <DialogHeader>
                <DialogTitle>
                  {editingPayment ? 'Editar Pago' : 'Nuevo Pago'}
                </DialogTitle>
                <DialogDescription>
                  {editingPayment
                    ? 'Actualiza la información del pago'
                    : 'Completa la información para crear un nuevo pago'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="amount">Monto *</Label>
                      <Input
                        id="amount"
                        type="number"
                        step="0.01"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="invoiceNumber">N° Factura</Label>
                      <Input
                        id="invoiceNumber"
                        value={formData.invoiceNumber}
                        onChange={(e) => setFormData({ ...formData, invoiceNumber: e.target.value })}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="client">Cliente *</Label>
                    <Select
                      value={formData.clientId}
                      onValueChange={handleClientChange}
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
                    <Label htmlFor="project">Proyecto</Label>
                    <Select
                      value={formData.projectId}
                      onValueChange={(value) => setFormData({ ...formData, projectId: value })}
                    >
                      <SelectTrigger id="project">
                        <SelectValue placeholder="Selecciona un proyecto (opcional)" />
                      </SelectTrigger>
                      <SelectContent>
                        {filteredProjects.filter(p => p.clientId === formData.clientId).map((project) => (
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
                      rows={2}
                      placeholder="Descripción del pago..."
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
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
                          <SelectItem value="PAID">Pagado</SelectItem>
                          <SelectItem value="CANCELLED">Cancelado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="paymentMethod">Método de Pago</Label>
                      <Input
                        id="paymentMethod"
                        value={formData.paymentMethod}
                        onChange={(e) => setFormData({ ...formData, paymentMethod: e.target.value })}
                        placeholder="Ej: Transferencia, PayPal..."
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="paymentDate">Fecha de Pago</Label>
                      <Input
                        id="paymentDate"
                        type="date"
                        value={formData.paymentDate}
                        onChange={(e) => setFormData({ ...formData, paymentDate: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="dueDate">Fecha Vencimiento</Label>
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
                    {editingPayment ? 'Actualizar' : 'Crear'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}
      </div>

      {/* Resumen de pagos */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pendiente</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredPayments
                .filter(p => p.status === 'PENDING')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPayments.filter(p => p.status === 'PENDING').length} pagos pendientes
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Pagado</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600 dark:text-green-400">
              ${filteredPayments
                .filter(p => p.status === 'PAID')
                .reduce((sum, p) => sum + p.amount, 0)
                .toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPayments.filter(p => p.status === 'PAID').length} pagos recibidos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total General</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${filteredPayments.reduce((sum, p) => sum + p.amount, 0).toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              {filteredPayments.length} pagos registrados
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Pagos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredPayments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay pagos registrados
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Proyecto</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fechas</TableHead>
                  <TableHead>N° Factura</TableHead>
                  {user?.role === 'ADMIN' && (
                    <TableHead className="text-right">Acciones</TableHead>
                  )}
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => {
                  const client = clients.find(c => c.id === payment.clientId)
                  const project = projects.find(p => p.id === payment.projectId)
                  return (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">
                        {payment.description || 'Sin descripción'}
                      </TableCell>
                      <TableCell>{client?.name || 'Sin cliente'}</TableCell>
                      <TableCell>
                        {project?.name || <span className="text-muted-foreground">-</span>}
                      </TableCell>
                      <TableCell className="font-bold">
                        ${payment.amount.toFixed(2)}
                      </TableCell>
                      <TableCell>
                        <span
                          className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                            payment.status === 'PAID'
                              ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                              : payment.status === 'PENDING'
                              ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                              : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                          }`}
                        >
                          {payment.status === 'PAID' ? 'Pagado' : payment.status === 'PENDING' ? 'Pendiente' : 'Cancelado'}
                        </span>
                      </TableCell>
                      <TableCell className="text-sm">
                        <div className="space-y-1">
                          {payment.paymentDate && (
                            <p>Pago: {new Date(payment.paymentDate).toLocaleDateString('es-ES')}</p>
                          )}
                          {payment.dueDate && (
                            <p>Vence: {new Date(payment.dueDate).toLocaleDateString('es-ES')}</p>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {payment.invoiceNumber ? (
                            <>
                              <span>{payment.invoiceNumber}</span>
                              <Button
                                variant="ghost"
                                size="sm"
                                className="h-6 w-6 p-0"
                                title="Descargar factura"
                              >
                                <Download className="h-3 w-3" />
                              </Button>
                            </>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </div>
                      </TableCell>
                      {user?.role === 'ADMIN' && (
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(payment)}
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(payment.id)}
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
