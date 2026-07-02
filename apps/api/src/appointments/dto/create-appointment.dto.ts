import {
  IsISO8601,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';

export class CreateAppointmentDto {
  @IsString()
  @MinLength(1)
  clinicId!: string;

  @IsOptional()
  @IsString()
  doctorId?: string;

  @IsString()
  @MinLength(2)
  @MaxLength(100)
  serviceName!: string;

  @IsISO8601()
  appointmentDate!: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  notes?: string;
}
