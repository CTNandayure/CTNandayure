import {
  IsString,
  IsNotEmpty,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  MaxLength,
  MinLength,
  IsOptional,
  IsNumber,
  IsEmail,
  IsUrl,
  IsIn,
} from 'class-validator';

export class CreateBusinessRequestDto {
  @IsString()
  @IsNotEmpty({ message: 'El nombre del negocio es requerido' })
  @MinLength(3, { message: 'El nombre debe tener al menos 3 caracteres' })
  @MaxLength(150, { message: 'El nombre no puede exceder 150 caracteres' })
  businessName!: string;

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe seleccionar al menos una categoría' })
  @IsIn(['LODGING', 'FOOD', 'TRANSPORT', 'CRAFTS', 'TOURS', 'AGROTOURISM', 'COMMERCE'], {
    each: true,
    message: 'Categoría inválida',
  })
  categories!: string[];

  @IsIn(['CARMONA', 'SANTA_RITA', 'ZAPOTAL', 'SAN_PABLO', 'PORVENIR', 'BEJUCO'], {
    message: 'Distrito inválido',
  })
  @IsNotEmpty({ message: 'El distrito es requerido' })
  district!: string;

  @IsString()
  @IsNotEmpty({ message: 'La descripción es requerida' })
  @MinLength(20, { message: 'La descripción debe tener al menos 20 caracteres' })
  @MaxLength(2000, { message: 'La descripción no puede exceder 2000 caracteres' })
  description!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono es requerido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  phone!: string;

  @IsEmail({}, { message: 'El correo electrónico no es válido' })
  @IsNotEmpty({ message: 'El correo electrónico es requerido' })
  @MaxLength(100, { message: 'El correo electrónico no puede exceder 100 caracteres' })
  email!: string;

  @IsString()
  @IsNotEmpty({ message: 'La dirección es requerida' })
  @MinLength(10, { message: 'La dirección debe tener al menos 10 caracteres' })
  @MaxLength(500, { message: 'La dirección no puede exceder 500 caracteres' })
  address!: string;

  @IsOptional()
  @IsNumber()
  latitude?: number;

  @IsOptional()
  @IsNumber()
  longitude?: number;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'La URL de Facebook no es válida' })
  @MaxLength(255)
  facebookUrl?: string;

  @IsOptional()
  @IsString()
  @IsUrl({}, { message: 'La URL de Instagram no es válida' })
  @MaxLength(255)
  instagramUrl?: string;

  @IsString()
  @IsNotEmpty({ message: 'El horario es requerido' })
  @MinLength(5, { message: 'El horario debe tener al menos 5 caracteres' })
  @MaxLength(500, { message: 'El horario no puede exceder 500 caracteres' })
  scheduleText!: string;

  @IsString()
  @IsNotEmpty({ message: 'La imagen de portada es requerida' })
  coverImageUrl!: string;

  @IsArray()
  @ArrayMinSize(3, { message: 'Debe proporcionar al menos 3 imágenes de galería' })
  @ArrayMaxSize(5, { message: 'No puede subir más de 5 imágenes de galería' })
  @IsString({ each: true })
  galleryUrls!: string[];

  @IsArray()
  @ArrayMinSize(1, { message: 'Debe proporcionar al menos 1 documento' })
  @ArrayMaxSize(5, { message: 'No puede subir más de 5 documentos' })
  @IsString({ each: true })
  documentUrls!: string[];

  @IsString()
  @IsNotEmpty({ message: 'El nombre del solicitante es requerido' })
  @MinLength(2, { message: 'El nombre debe tener al menos 2 caracteres' })
  @MaxLength(50, { message: 'El nombre no puede exceder 50 caracteres' })
  applicantName!: string;

  @IsString()
  @IsNotEmpty({ message: 'El primer apellido es requerido' })
  @MinLength(2, { message: 'El primer apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El primer apellido no puede exceder 100 caracteres' })
  applicantFirstLastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El segundo apellido es requerido' })
  @MinLength(2, { message: 'El segundo apellido debe tener al menos 2 caracteres' })
  @MaxLength(100, { message: 'El segundo apellido no puede exceder 100 caracteres' })
  applicantSecondLastname!: string;

  @IsString()
  @IsNotEmpty({ message: 'El teléfono del solicitante es requerido' })
  @MaxLength(20, { message: 'El teléfono no puede exceder 20 caracteres' })
  applicantPhone!: string;
}
