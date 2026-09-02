import { useMemo, useState } from 'react'
import { Badge, Card, Container, SectionHeading } from '../../components/ui'
import { cn } from '../../lib/cn'
import { useActivities } from '../../content/activities'
import type { Activity } from '../../content/types'

const CATEGORIES: Array<Activity['category'] | 'Todas'> = ['Todas', 'Playa', 'Montaña', 'Cultura', 'Gastronomía']

export function ActivitiesSection() {
  const { data: activities } = useActivities()
  const [filter, setFilter] = useState<(typeof CATEGORIES)[number]>('Todas')

  const filtered = useMemo(
    () => (filter === 'Todas' ? activities : activities.filter((a) => a.category === filter)),
    [activities, filter],
  )

  return (
    <section id="actividades" className="bg-white py-16 md:py-24">
      <Container className="flex flex-col gap-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <SectionHeading eyebrow="Qué hacer" eyebrowColor="green" title="Actividades para todos los gustos" />
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setFilter(c)}
                className={cn(
                  'rounded-full px-4 py-2 text-sm font-semibold transition-colors',
                  filter === c ? 'bg-brand-navy text-white' : 'border border-brand-navy/15 text-brand-navy hover:border-brand-navy/40',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((a) => (
            <Card key={a.id}>
              {a.imageUrl ? (
                <img src={a.imageUrl} alt="" className="h-36 w-full object-cover" />
              ) : (
                <div className="flex h-36 items-center justify-center bg-brand-sand text-center text-xs uppercase tracking-wide text-brand-ink/40">
                  Foto — {a.title}
                </div>
              )}
              <div className="flex flex-col gap-2 p-5">
                <Badge color="teal">{a.category}</Badge>
                <h3 className="text-base font-bold text-brand-navy">{a.title}</h3>
                <p className="text-sm leading-relaxed text-brand-ink/70">{a.description}</p>
                <span className="text-xs font-medium text-brand-ink/50">{a.districts.join(', ')}</span>
              </div>
            </Card>
          ))}
        </div>
      </Container>
    </section>
  )
}
