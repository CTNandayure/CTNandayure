import { Link } from 'react-router-dom'
import { Badge, Card } from '../../../../components/ui'
import { ClockIcon, PhoneIcon, PinIcon } from '../../../../components/ui/icons'
import { CATEGORY_LABELS, DISTRICT_LABELS } from '../../utils/constants'
import type { BusinessCategory, DistrictKey, PublicBusiness } from '../../types/business.types'

export function BusinessCard({ business }: { business: PublicBusiness }) {
  const targetUrl = `/negocios/${business.slug || business.id}`

  return (
    <Link
      to={targetUrl}
      className="group block h-full rounded-2xl focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-teal"
    >
      <Card className="h-full transition-all duration-300 group-hover:-translate-y-1 group-hover:shadow-lg">
        {business.coverImageUrl ? (
          <div className="relative h-48 w-full overflow-hidden bg-brand-sand">
            <img
              src={business.coverImageUrl}
              alt={business.businessName}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </div>
        ) : (
          <div className="flex h-48 items-center justify-center bg-brand-sand text-xs font-semibold uppercase tracking-wider text-brand-ink/40">
            Sin foto de portada
          </div>
        )}

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="flex flex-wrap gap-1.5">
            {(business.categories || []).map((cat) => (
              <Badge key={cat} color="navy">
                {CATEGORY_LABELS[cat as BusinessCategory] ?? cat}
              </Badge>
            ))}
          </div>

          <h3 className="text-lg font-bold leading-snug text-brand-navy transition-colors group-hover:text-brand-green">
            {business.businessName}
          </h3>

          <p className="line-clamp-3 text-sm leading-relaxed text-brand-ink/70">
            {business.description}
          </p>

          <div className="mt-auto flex flex-col gap-2 border-t border-brand-navy/10 pt-3 text-xs text-brand-ink/60">
            {business.scheduleText && (
              <span className="flex items-start gap-1.5">
                <ClockIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-green" />
                <span className="line-clamp-1">{business.scheduleText}</span>
              </span>
            )}
            {business.phone && (
              <span className="flex items-center gap-1.5">
                <PhoneIcon className="h-3.5 w-3.5 flex-none text-brand-green" />
                <span>{business.phone}</span>
              </span>
            )}
            <span className="flex items-start gap-1.5">
              <PinIcon className="mt-0.5 h-3.5 w-3.5 flex-none text-brand-green" />
              <span>
                {DISTRICT_LABELS[business.district as DistrictKey] ?? business.district}, Nandayure
              </span>
            </span>
          </div>
        </div>
      </Card>
    </Link>
  )
}

