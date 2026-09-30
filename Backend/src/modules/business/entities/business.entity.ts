import { UserEntity } from '@/modules/user/entities/user.entity';
import { BusinessRequestEntity } from './business-request.entity';

export class BusinessEntity {
  id!: string;
  businessName!: string;
  categories!: string[];
  district!: string;
  description!: string;
  phone!: string;
  email!: string;
  address!: string;
  latitude!: number | null;
  longitude!: number | null;
  facebookUrl!: string | null;
  instagramUrl!: string | null;
  scheduleText!: string;
  coverImageUrl!: string;
  galleryUrls!: string[];
  documentUrls!: string[];
  businessStatus!: string;
  requestId!: string | null;
  userId!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  request?: BusinessRequestEntity;
  user?: UserEntity;

  constructor(partial: Partial<BusinessEntity>) {
    Object.assign(this, partial);
  }
}
