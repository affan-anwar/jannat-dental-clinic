
import { Type } from 'class-transformer';
import {
  IsArray,
  IsBoolean,
  IsEmail,
  IsIn,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  Matches,
  Max,
  MaxLength,
  Min,
  ValidateIf,
  ValidateNested,
} from 'class-validator';

const DAYS = [
  'MONDAY',
  'TUESDAY',
  'WEDNESDAY',
  'THURSDAY',
  'FRIDAY',
  'SATURDAY',
  'SUNDAY',
] as const;

export class DoctorAvailabilityDto {
  @IsIn([...DAYS])
  dayOfWeek:
    | 'MONDAY'
    | 'TUESDAY'
    | 'WEDNESDAY'
    | 'THURSDAY'
    | 'FRIDAY'
    | 'SATURDAY'
    | 'SUNDAY';

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  startTime: string;

  @IsString()
  @Matches(/^([01]\d|2[0-3]):[0-5]\d$/)
  endTime: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(10)
  @Max(240)
  slotDurationMinutes?: number;

  @IsOptional()
  @IsBoolean()
  isAvailable?: boolean;
}

export class UpdateDoctorProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(120)
  fullName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  designation?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  qualification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  specialization?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(80)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  registrationCouncil?: string;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  bio?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  photoUrl?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  consultationFee?: number;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsEmail()
  @MaxLength(160)
  publicEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  publicPhone?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  degrees?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  education?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  languages?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  memberships?: string[];

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  awards?: string[];

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  websiteUrl?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  instagramUrl?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  signatureUrl?: string;

  @IsOptional()
  @IsBoolean()
  availableForBooking?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  serviceIds?: string[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => DoctorAvailabilityDto)
  availability?: DoctorAvailabilityDto[];
}
