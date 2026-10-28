import { useEffect, useState } from 'react'
import { Controller, useForm } from 'react-hook-form'
import { useNavigate, useParams } from 'react-router-dom'
import { Alert, Button, FormActions, FormField, ImageUpload, Input, RichTextEditor, Textarea, useToast } from '../../../components/ui'
import { newsAdminService } from '../services/newsAdminService'

interface NewsFormValues {
  title: string
  excerpt: string
  content: string
  imageUrl: string | null
}

const emptyForm: NewsFormValues = { title: '', excerpt: '', content: '', imageUrl: null }

export default function NewsFormPage() {
  const { id } = useParams<{ id: string }>()
  const isEditing = Boolean(id)
  const navigate = useNavigate()
  const { showToast } = useToast()
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>(isEditing ? 'loading' : 'ready')

  const {
    control,
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<NewsFormValues>({ defaultValues: emptyForm })

  useEffect(() => {
    if (!id) return
    newsAdminService
      .getNewsById(id)
      .then((data) => {
        reset({ title: data.title, excerpt: data.excerpt, content: data.content, imageUrl: data.imageUrl })
        setStatus('ready')
      })
      .catch(() => setStatus('error'))
  }, [id, reset])

  async function onSubmit(values: NewsFormValues) {
    try {
      if (isEditing && id) {
        await newsAdminService.updateNews(id, values)
        showToast({ variant: 'success', title: 'Cambios guardados', description: 'La noticia se actualizó correctamente.' })
      } else {
        await newsAdminService.createNews(values)
        showToast({ variant: 'success', title: 'Noticia creada', description: 'Se guardó como borrador. Publicala desde el listado cuando esté lista.' })
      }
      navigate('/admin/noticias')
    } catch (error) {
      showToast({ variant: 'error', title: 'No se pudo guardar', description: error instanceof Error ? error.message : 'Error desconocido' })
    }
  }

  if (status === 'loading') {
    return <p className="text-brand-ink/60">Cargando…</p>
  }

  if (status === 'error') {
    return (
      <Alert variant="error" title="No se pudo cargar la noticia">
        Revisá que el backend esté corriendo e intentá recargar la página.
      </Alert>
    )
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-brand-navy">{isEditing ? 'Editar noticia' : 'Nueva noticia'}</h1>
      <p className="mt-1 text-brand-ink/60">
        {isEditing ? 'Los cambios se guardan sin afectar el estado de publicación.' : 'La noticia se crea como borrador. Podés publicarla desde el listado.'}
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5 rounded-2xl bg-white p-8 shadow-sm">
        <FormField label="Título" htmlFor="title" error={errors.title?.message}>
          <Input id="title" {...register('title', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <FormField label="Resumen" htmlFor="excerpt" error={errors.excerpt?.message}>
          <Textarea id="excerpt" rows={3} {...register('excerpt', { required: 'Este campo es obligatorio' })} />
        </FormField>

        <Controller
          name="content"
          control={control}
          rules={{ validate: (value) => value.replace(/<[^>]*>/g, '').trim().length > 0 || 'Este campo es obligatorio' }}
          render={({ field }) => (
            <div className="flex flex-col gap-1.5">
              <label className="text-sm font-medium text-brand-navy">Contenido</label>
              <RichTextEditor value={field.value} onChange={field.onChange} />
              {errors.content && <p className="text-xs text-red-600">{errors.content.message}</p>}
            </div>
          )}
        />

        <Controller
          name="imageUrl"
          control={control}
          render={({ field }) => <ImageUpload label="Foto de portada" value={field.value} onChange={field.onChange} />}
        />

        <FormActions>
          <Button type="submit" variant="primary" disabled={isSubmitting}>
            {isSubmitting ? 'Guardando…' : 'Guardar'}
          </Button>
          <Button type="button" variant="outline" onClick={() => navigate('/admin/noticias')}>
            Cancelar
          </Button>
        </FormActions>
      </form>
    </div>
  )
}
