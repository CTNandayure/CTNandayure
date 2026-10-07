export class BusinessRequestEntity {
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
  applicantName!: string;
  applicantFirstLastname!: string;
  applicantSecondLastname!: string;
  applicantPhone!: string;
  requestStatus!: string;
  rejectionReason!: string | null;
  createdAt!: Date;
  updatedAt!: Date;

  constructor(partial: Partial<BusinessRequestEntity>) {
    Object.assign(this, partial);
  }
}
