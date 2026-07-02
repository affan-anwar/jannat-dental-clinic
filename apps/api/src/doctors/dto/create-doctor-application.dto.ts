
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsOptional,
  IsString,
  IsUrl,
  Max,
  MaxLength,
  Min,
  ValidateIf,
} from 'class-validator';

export class CreateDoctorApplicationDto {
  @IsOptional()
  @IsIn(['DOCTOR_ADMIN', 'DOCTOR'])
  requestedRole?: 'DOCTOR_ADMIN' | 'DOCTOR';

  @IsOptional()
  @IsString()
  requestedClinicId?: string;

  @IsString()
  @MaxLength(160)
  clinicName: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  clinicPhone?: string;

  @IsOptional()
  @IsString()
  @MaxLength(160)
  clinicEmail?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  clinicAddressLine1?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  clinicAddressLine2?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clinicCity?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  clinicState?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  clinicPostalCode?: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  clinicCountry?: string;

  @IsOptional()
  @IsString()
  @MaxLength(250)
  qualification?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  specialization?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  registrationNumber?: string;

  @IsOptional()
  @IsString()
  @MaxLength(150)
  registrationCouncil?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  @Max(80)
  experienceYears?: number;

  @IsOptional()
  @IsString()
  @MaxLength(3000)
  biography?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  profilePhotoUrl?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  registrationDocUrl?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  degreeDocUrl?: string;

  @IsOptional()
  @ValidateIf((_object, value) => value !== '')
  @IsUrl()
  @MaxLength(1000)
  identityDocUrl?: string;
}
