
import {
  IsBoolean,
  IsIn,
  IsOptional,
} from 'class-validator';

export class UpdateDoctorStatusDto {
  @IsOptional()
  @IsBoolean()
  isVerified?: boolean;

  @IsOptional()
  @IsBoolean()
  isPublic?: boolean;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  availableForBooking?: boolean;

  @IsOptional()
  @IsIn(['ACTIVE', 'INACTIVE', 'SUSPENDED'])
  accountStatus?: 'ACTIVE' | 'INACTIVE' | 'SUSPENDED';
}
