import type {
  ActivityCategory,
  ActivityScheduleType,
  ActivityStatus,
  BusinessCategory,
  BusinessStatus,
  District,
} from '@/generated/prisma/enums';

// Business data shown next to an activity (all of it is already public through
// GET /businesses/public, except businessStatus which the owner/admin lists use).
export interface ActivityBusinessSummary {
  id: string;
  businessName: string;
  district: District;
  categories: BusinessCategory[];
  phone: string;
  email: string;
  coverImageUrl: string;
  facebookUrl: string | null;
  instagramUrl: string | null;
  businessStatus: BusinessStatus;
}

export interface ActivityResponse {
  id: string;
  slug: string;
  name: string;
  description: string;
  category: ActivityCategory;
  customCategory: string | null;
  durationMinutes: number;
  requirements: string | null;
  scheduleType: ActivityScheduleType;
  /** 'YYYY-MM-DD'. SPECIFIC_DATE: the day. RECURRING: start of the validity window. */
  startDate: string | null;
  /** 'YYYY-MM-DD'. RECURRING only: end of the validity window. */
  endDate: string | null;
  /** ISO weekdays, 1 = Monday ... 7 = Sunday. */
  daysOfWeek: number[];
  /** 'HH:mm' */
  startTime: string;
  meetingPoint: string;
  meetingLatitude: number | null;
  meetingLongitude: number | null;
  imageUrl: string | null;
  status: ActivityStatus;
  publishedAt: Date | null;
  createdAt: Date;
  updatedAt: Date;
  /** Next day the activity takes place (Costa Rica date), null once it ended. */
  nextOccurrence: string | null;
  /** True once the activity ended ("vencida"); public listings hide these. */
  expired: boolean;
  business: ActivityBusinessSummary;
}
