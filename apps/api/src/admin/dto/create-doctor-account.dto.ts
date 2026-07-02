import { Type } from 'class-transformer';
import {
  IsArray,
  IsEmail,
  IsInt,
  IsNumber,
  IsOptional,
  IsString,
  IsUrl,
  ValidateIf,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class CreateDoctorAccountDto {
  @IsString()
  clinicId!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(80)
  firstName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(80)
  lastName?: string;

  @IsEmail()
  email!: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;

  @IsString()
  @MinLength(8)
  @MaxLength(72)
  password!: string;

  @IsString()
  @MinLength(2)
  @MaxLength(120)
  fullName!: string;

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
}
