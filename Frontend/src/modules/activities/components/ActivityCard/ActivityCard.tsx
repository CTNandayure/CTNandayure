import { Link } from 'react-router-dom'
import { Badge, Card } from '../../../../components/ui'
import { ClockIcon, PinIcon } from '../../../../components/ui/icons'
import { DISTRICT_LABELS } from '../../../business/utils/constants'
import type { ActivityRecord } from '../../types/activity.types'
import { categoryLabel, describeSchedule, formatDuration } from '../../utils/activityLabels'
import { CalendarIcon } from '../ActivityIcons'

// The one activity card: used by the landing section and the /actividades page.
export function ActivityCard({ activity }: { activity: ActivityRecord }) {
  return (
    <Link
      to={`/actividades/${activity.slug}`}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
    >
      <Card className="h-full transition-shadow group-hover:shadow-lg">
        {activity.imageUrl ? (
          <img src={activity.imageUrl} alt="" loading="lazy" className="h-44 w-full object-cover" />
        ) : (
          <div className="flex h-44 items-center justify-center bg-brand-sand text-xs uppercase tracking-wide text-brand-ink/40">
            Sin foto
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-5">
          <Badge color="teal">{categoryLabel(activity)}</Badge>
          <h3 className="text-base font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-green">
            {activity.name}
          </h3>
          <p className="line-clamp-3 text-sm leading-relaxed text-brand-ink/70">{activity.description}</p>

          <div className="mt-auto flex flex-col gap-1.5 border-t border-brand-navy/10 pt-3 text-xs text-brand-ink/60">
            <span className="flex items-start gap-1.5">
              <CalendarIcon className="mt-px h-3.5 w-3.5 flex-none text-brand-green" />
              <span>{describeSchedule(activity, true)}</span>
            </span>
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-3.5 w-3.5 flex-none text-brand-green" />
              {formatDuration(activity.durationMinutes)}
            </span>
            <span className="flex items-start gap-1.5">
              <PinIcon className="mt-px h-3.5 w-3.5 flex-none text-brand-green" />
              <span>
                {activity.business.businessName} · {DISTRICT_LABELS[activity.business.district]}
              </span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}
