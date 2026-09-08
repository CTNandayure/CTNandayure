import { useEffect, useMemo, useState } from 'react'
import { Alert, Badge, Button, Input, Modal, Select, useToast } from '../../../components/ui'
import { usersAdminService, type UserAdminRecord } from '../services/usersAdminService'
import { UsersTable } from '../components/UsersTable/UsersTable'
import { validateEmail, validateLastName, validateName, validatePhone } from '../utils/adminUsersValidators'

const emptyForm = {
  name: '',
  first_lastname: '',
  second_lastname: '',
  phone: '',
  email: '',
  role: 'NEGOCIO',
}

export default function UsersAdminPage() {
  const { showToast } = useToast()
  const [users, setUsers] = useState<UserAdminRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [roleFilter, setRoleFilter] = useState('all')
  const [detailUser, setDetailUser] = useState<UserAdminRecord | null>(null)
  const [editingUser, setEditingUser] = useState<UserAdminRecord | null>(null)
  const [formOpen, setFormOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [pendingStatusUser, setPendingStatusUser] = useState<UserAdminRecord | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState(emptyForm)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await usersAdminService.getUsers()
      setUsers(data)
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudieron cargar los usuarios', description: error instanceof Error ? error.message : 'Intenta nuevamente' })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase()
    return users.filter((user) => {
      const fullName = [user.person?.name, user.person?.first_lastname, user.person?.second_lastname].filter(Boolean).join(' ').toLowerCase()
      const matchesSearch = !q || fullName.includes(q) || user.email.toLowerCase().includes(q)
      const matchesStatus = statusFilter === 'all' || user.status === statusFilter
      const matchesRole = roleFilter === 'all' || user.role === roleFilter
      return matchesSearch && matchesStatus && matchesRole && user.status !== 'PENDIENTE_ACTIVACION'
    })
  }, [users, search, statusFilter, roleFilter])

  const stats = useMemo(() => {
    const visibleUsers = users.filter((u) => u.status !== 'PENDIENTE_ACTIVACION')
    return {
      total: visibleUsers.length,
      active: visibleUsers.filter((u) => u.status === 'ACTIVO').length,
      inactive: visibleUsers.filter((u) => u.status === 'INACTIVO').length,
    }
  }, [users])

  const validateForm = () => {
    const nextErrors: Record<string, string> = {}
    const nameError = validateName(form.name, 'Nombre')
    const firstLastNameError = validateLastName(form.first_lastname, 'Primer apellido')
    const secondLastNameError = validateLastName(form.second_lastname, 'Segundo apellido')
    const phoneError = validatePhone(form.phone)
    const emailError = validateEmail(form.email)

    if (nameError) nextErrors.name = nameError
    if (firstLastNameError) nextErrors.first_lastname = firstLastNameError
    if (secondLastNameError) nextErrors.second_lastname = secondLastNameError
    if (phoneError) nextErrors.phone = phoneError
    if (emailError) nextErrors.email = emailError

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const closeFormModal = () => {
    setFormOpen(false)
    setEditingUser(null)
    setForm(emptyForm)
    setErrors({})
  }

  const openCreateModal = () => {
    setEditingUser(null)
    setForm(emptyForm)
    setErrors({})
    setFormOpen(true)
  }

  const openEditModal = (user: UserAdminRecord) => {
    setEditingUser(user)
    setForm({
      name: user.person?.name ?? '',
      first_lastname: user.person?.first_lastname ?? '',
      second_lastname: user.person?.second_lastname ?? '',
      phone: user.person?.phone ?? '',
      email: user.email,
      role: user.role,
    })
    setErrors({})
    setFormOpen(true)
  }

  const handleSubmit = async () => {
    if (!validateForm()) return
    try {
      setIsSubmitting(true)
      if (editingUser) {
        const payload = {
          name: form.name,
          first_lastname: form.first_lastname,
          second_lastname: form.second_lastname,
          phone: form.phone,
          role: form.role,
        }
        await usersAdminService.updateUser(editingUser.id_person, payload)
        showToast({ variant: 'success', title: 'Usuario actualizado', description: 'Los cambios se guardaron correctamente.' })
      } else {
        await usersAdminService.createUser({
          name: form.name,
          first_lastname: form.first_lastname,
          second_lastname: form.second_lastname,
          phone: form.phone,
          email: form.email,
        })
        showToast({ variant: 'success', title: 'Usuario creado', description: 'Se creó la cuenta y se enviará la activación por correo.' })
      }
      closeFormModal()
      await loadUsers()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo guardar', description: error instanceof Error ? error.message : 'Error desconocido' })
    } finally {
      setIsSubmitting(false)
    }
  }

  const confirmStatusChange = (user: UserAdminRecord) => {
    setPendingStatusUser(user)
    setConfirmOpen(true)
  }

  const toggleStatus = async () => {
    if (!pendingStatusUser) return

    const nextStatus = pendingStatusUser.status === 'ACTIVO' ? 'INACTIVO' : 'ACTIVO'
    try {
      await usersAdminService.updateUserStatus(pendingStatusUser.id_person, nextStatus)
      showToast({
        variant: 'success',
        title: 'Estado actualizado',
        description: nextStatus === 'ACTIVO' ? 'El usuario puede iniciar sesión nuevamente.' : 'El usuario quedará inactivo y no podrá iniciar sesión.',
      })
      setConfirmOpen(false)
      setPendingStatusUser(null)
      await loadUsers()
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo cambiar el estado', description: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  const viewUser = async (user: UserAdminRecord) => {
    const response = await usersAdminService.getUserById(user.id_person)
    setDetailUser(response)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-brand-navy">Usuarios</h1>
          <p className="mt-1 text-brand-ink/60">Gestión de usuarios del sistema</p>
        </div>
        <Button variant="primary" onClick={openCreateModal}>Agregar usuario</Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Total</p>
          <p className="mt-2 text-3xl font-bold text-brand-navy">{stats.total}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Activos</p>
          <p className="mt-2 text-3xl font-bold text-brand-green">{stats.active}</p>
        </div>
        <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-brand-navy/10">
          <p className="text-sm text-brand-ink/60">Inactivos</p>
          <p className="mt-2 text-3xl font-bold text-red-600">{stats.inactive}</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-brand-navy/10">
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Buscar por nombre o correo"
            aria-label="Buscar usuarios"
            className="max-w-md"
          />
          <Select value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} className="max-w-[180px]" aria-label="Filtrar por estado">
            <option value="all">Todos los estados</option>
            <option value="ACTIVO">Activo</option>
            <option value="INACTIVO">Inactivo</option>
          </Select>
          <Select value={roleFilter} onChange={(event) => setRoleFilter(event.target.value)} className="max-w-[180px]" aria-label="Filtrar por rol">
            <option value="all">Todos los roles</option>
            <option value="ADMIN">ADMIN</option>
            <option value="NEGOCIO">NEGOCIO</option>
          </Select>
        </div>
      </div>

      {detailUser && (
        <Modal
          size="lg"
          open={Boolean(detailUser)}
          onOpenChange={(open) => !open && setDetailUser(null)}
          title={detailUser.person ? `${detailUser.person.name ?? ''} ${detailUser.person.first_lastname ?? ''} ${detailUser.person.second_lastname ?? ''}`.replace(/\s+/g, ' ').trim() : detailUser.email}
          description="Detalle del usuario"
          footer={
            <div className="flex justify-start">
              <Button variant="outline" onClick={() => setDetailUser(null)}>Cerrar</Button>
            </div>
          }
        >
          <dl className="grid gap-x-8 gap-y-4 sm:grid-cols-2">
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Correo</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy break-all">{detailUser.email}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Teléfono</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{detailUser.person?.phone ?? 'Sin teléfono'}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Rol</dt>
              <dd className="mt-1">
                <Badge color={detailUser.role === 'ADMIN' ? 'navy' : 'teal'}>{detailUser.role}</Badge>
              </dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Estado</dt>
              <dd className="mt-1">
                <Badge color={detailUser.status === 'ACTIVO' ? 'green' : 'yellow'}>{detailUser.status}</Badge>
              </dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Fecha de creación</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{new Date(detailUser.created_at).toLocaleString('es-CR')}</dd>
            </div>
            <div className="rounded-xl bg-brand-paper p-4">
              <dt className="text-xs font-semibold uppercase tracking-wide text-brand-ink/50">Última actualización</dt>
              <dd className="mt-1 text-sm font-medium text-brand-navy">{new Date(detailUser.updated_at).toLocaleString('es-CR')}</dd>
            </div>
          </dl>
        </Modal>
      )}

      <Modal size="lg" open={formOpen} onOpenChange={(open) => !open && closeFormModal()} title={editingUser ? 'Editar usuario' : 'Agregar usuario'} description={editingUser ? 'Actualiza los datos del usuario' : 'Crea una nueva cuenta para el sistema'} footer={
        <div className="flex items-center justify-between gap-3">
          <Button variant="outline" onClick={closeFormModal}>Cancelar</Button>
          <Button variant="primary" onClick={handleSubmit} disabled={isSubmitting}>{isSubmitting ? 'Guardando...' : 'Guardar'}</Button>
        </div>
      }>
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-navy">Nombre</label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
            {errors.name && <p className="text-xs text-red-600">{errors.name}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-navy">Primer apellido</label>
            <Input value={form.first_lastname} onChange={(e) => setForm({ ...form, first_lastname: e.target.value })} />
            {errors.first_lastname && <p className="text-xs text-red-600">{errors.first_lastname}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-navy">Segundo apellido</label>
            <Input value={form.second_lastname} onChange={(e) => setForm({ ...form, second_lastname: e.target.value })} />
            {errors.second_lastname && <p className="text-xs text-red-600">{errors.second_lastname}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-navy">Teléfono</label>
            <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            {errors.phone && <p className="text-xs text-red-600">{errors.phone}</p>}
          </div>
          <div className="space-y-1 md:col-span-2">
            <label className="text-sm font-medium text-brand-navy">Correo</label>
            <Input value={form.email} disabled={Boolean(editingUser)} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            {errors.email && <p className="text-xs text-red-600">{errors.email}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium text-brand-navy">Rol</label>
            <Select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}>
              <option value="ADMIN">ADMIN</option>
              <option value="NEGOCIO">NEGOCIO</option>
            </Select>
          </div>
        </div>
      </Modal>

      {!isLoading && users.length === 0 && (
        <Alert variant="info" title="Sin usuarios">
          <span>Todavía no hay usuarios registrados en el sistema.</span>
        </Alert>
      )}
      <Modal
        open={confirmOpen}
        onOpenChange={(open) => {
          setConfirmOpen(open)
          if (!open) setPendingStatusUser(null)
        }}
        title={pendingStatusUser?.status === 'ACTIVO' ? 'Desactivar usuario' : 'Activar usuario'}
        description={pendingStatusUser?.status === 'ACTIVO'
          ? 'Al desactivar este usuario, no podrá iniciar sesión hasta que sea reactivado.'
          : 'Al activar este usuario, podrá volver a iniciar sesión normalmente.'}
        footer={
          <div className="flex items-center justify-between gap-3">
            <Button variant="outline" onClick={() => setConfirmOpen(false)}>Cancelar</Button>
            <Button variant="primary" onClick={toggleStatus}>Confirmar</Button>
          </div>
        }
      >
        <p className="text-sm text-brand-ink/70">
          {pendingStatusUser ? `¿Deseás continuar con ${pendingStatusUser.person?.name ?? pendingStatusUser.email}?` : 'Confirmación requerida.'}
        </p>
      </Modal>

      <UsersTable users={filteredUsers} isLoading={isLoading} onView={viewUser} onEdit={openEditModal} onToggleStatus={confirmStatusChange} />
    </div>
  )
}
