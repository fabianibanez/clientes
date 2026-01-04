'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
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
import { Plus, Trash2, FileText, Download, Upload } from 'lucide-react'
import { toast } from 'sonner'

export function DocumentsModule() {
  const { documents, projects, payments, clients, addDocument, deleteDocument, user } = useAppStore()
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    projectId: '',
    paymentId: '',
    clientId: '',
  })

  const filteredClients = user?.role === 'CLIENT'
    ? clients.filter(c => c.id === user.clientId)
    : clients

  const filteredProjects = user?.role === 'CLIENT'
    ? projects.filter(p => p.clientId === user.clientId)
    : projects

  const filteredDocuments = user?.role === 'CLIENT'
    ? documents.filter(d => d.clientId === user.clientId)
    : documents

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      setFile(selectedFile)
      if (!formData.name) {
        setFormData({ ...formData, name: selectedFile.name })
      }
    }
  }

  const handleClientChange = (clientId: string) => {
    setFormData({ ...formData, clientId, projectId: '', paymentId: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!file) {
      toast.error('Por favor selecciona un archivo')
      return
    }

    setIsUploading(true)
    setUploadProgress(0)

    try {
      // Simular upload de archivo
      for (let i = 0; i <= 100; i += 10) {
        await new Promise((resolve) => setTimeout(resolve, 100))
        setUploadProgress(i)
      }

      const newDocument = {
        id: Math.random().toString(36).substr(2, 9),
        name: formData.name,
        fileName: file.name,
        filePath: `/uploads/${Date.now()}_${file.name}`,
        fileSize: file.size,
        mimeType: file.type,
        projectId: formData.projectId || null,
        paymentId: formData.paymentId || null,
        clientId: formData.clientId,
        createdAt: new Date().toISOString(),
      }

      addDocument(newDocument)
      toast.success('Documento subido correctamente')

      setIsDialogOpen(false)
      setFile(null)
      resetForm()
    } catch (error) {
      toast.error('Error al subir documento')
    } finally {
      setIsUploading(false)
      setUploadProgress(0)
    }
  }

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este documento?')) {
      deleteDocument(id)
      toast.success('Documento eliminado correctamente')
    }
  }

  const resetForm = () => {
    setFormData({
      name: '',
      projectId: '',
      paymentId: '',
      clientId: '',
    })
    setFile(null)
  }

  const handleDialogClose = (open: boolean) => {
    setIsDialogOpen(open)
    if (!open) {
      resetForm()
    }
  }

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const getFileIcon = (mimeType: string) => {
    if (mimeType.includes('image')) return '🖼️'
    if (mimeType.includes('pdf')) return '📄'
    if (mimeType.includes('word')) return '📝'
    if (mimeType.includes('excel') || mimeType.includes('spreadsheet')) return '📊'
    return '📎'
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Documentos</h2>
          <p className="text-muted-foreground">
            Gestión de documentos y archivos
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={handleDialogClose}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Subir Documento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Subir Documento</DialogTitle>
              <DialogDescription>
                Sube un documento y asígnalo a un proyecto o pago
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4 py-4">
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
                  <Label htmlFor="project">Asociar a Proyecto (opcional)</Label>
                  <Select
                    value={formData.projectId}
                    onValueChange={(value) => setFormData({ ...formData, projectId: value, paymentId: '' })}
                  >
                    <SelectTrigger id="project">
                      <SelectValue placeholder="Selecciona un proyecto" />
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
                  <Label htmlFor="payment">Asociar a Pago (opcional)</Label>
                  <Select
                    value={formData.paymentId}
                    onValueChange={(value) => setFormData({ ...formData, paymentId: value, projectId: '' })}
                  >
                    <SelectTrigger id="payment">
                      <SelectValue placeholder="Selecciona un pago" />
                    </SelectTrigger>
                    <SelectContent>
                      {payments.filter(p => p.clientId === formData.clientId).map((payment) => (
                        <SelectItem key={payment.id} value={payment.id}>
                          {payment.description || `Pago $${payment.amount}`} - ${new Date(payment.createdAt).toLocaleDateString('es-ES')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="name">Nombre del Documento</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    placeholder="Nombre descriptivo del documento"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="file">Archivo *</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      id="file"
                      type="file"
                      onChange={handleFileChange}
                      className="flex-1"
                      accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png"
                      required
                    />
                  </div>
                  {file && (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <FileText className="h-4 w-4" />
                      <span>{file.name}</span>
                      <span>({formatFileSize(file.size)})</span>
                    </div>
                  )}
                </div>
                {isUploading && (
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Subiendo...</span>
                      <span>{uploadProgress}%</span>
                    </div>
                    <div className="w-full bg-secondary rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${uploadProgress}%` }}
                      />
                    </div>
                  </div>
                )}
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleDialogClose(false)}
                  disabled={isUploading}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isUploading}>
                  {isUploading ? 'Subiendo...' : 'Subir'}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Estadísticas */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Documentos</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredDocuments.length}</div>
            <p className="text-xs text-muted-foreground mt-1">
              Archivos en total
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Espacio Usado</CardTitle>
            <Upload className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatFileSize(filteredDocuments.reduce((sum, d) => sum + d.fileSize, 0))}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Tamaño total de archivos
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Proyectos con Docs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {new Set(filteredDocuments.filter(d => d.projectId).map(d => d.projectId)).size}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Proyectos con archivos
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Documentos</CardTitle>
        </CardHeader>
        <CardContent>
          {filteredDocuments.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">
              No hay documentos subidos
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Asociado a</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Tamaño</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredDocuments.map((document) => {
                  const client = clients.find(c => c.id === document.clientId)
                  const project = projects.find(p => p.id === document.projectId)
                  const payment = payments.find(p => p.id === document.paymentId)
                  return (
                    <TableRow key={document.id}>
                      <TableCell className="font-medium">
                        <div className="flex items-center gap-2">
                          <span className="text-lg">{getFileIcon(document.mimeType)}</span>
                          {document.name}
                        </div>
                      </TableCell>
                      <TableCell>{client?.name || 'Sin cliente'}</TableCell>
                      <TableCell>
                        {project && (
                          <Badge variant="secondary" className="mr-1">
                            Proyecto: {project.name}
                          </Badge>
                        )}
                        {payment && (
                          <Badge variant="outline">
                            Pago: ${payment.amount.toFixed(2)}
                          </Badge>
                        )}
                        {!project && !payment && (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm">
                        {document.mimeType.split('/')[1]?.toUpperCase() || 'ARCHIVO'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {formatFileSize(document.fileSize)}
                      </TableCell>
                      <TableCell className="text-sm">
                        {new Date(document.createdAt).toLocaleDateString('es-ES')}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            title="Descargar"
                          >
                            <Download className="h-4 w-4" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(document.id)}
                          >
                            <Trash2 className="h-4 w-4 text-destructive" />
                          </Button>
                        </div>
                      </TableCell>
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
