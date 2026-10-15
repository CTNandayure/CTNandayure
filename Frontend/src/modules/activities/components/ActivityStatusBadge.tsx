import { Badge } from '../../../components/ui'
import type { ActivityRecord } from '../types/activity.types'
import { STATUS_BADGE_COLORS, STATUS_LABELS } from '../utils/activityLabels'

// Status of an activity in owner/admin lists. A published activity whose date
// already passed is also flagged «Vencida» (the public site hides it by itself).
export function ActivityStatusBadge({ activity }: { activity: Pick<ActivityRecord, 'status' | 'expired'> }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <Badge color={STATUS_BADGE_COLORS[activity.status]}>{STATUS_LABELS[activity.status]}</Badge>
      {activity.expired && <Badge color="navy">Vencida</Badge>}
    </div>
  )
}
