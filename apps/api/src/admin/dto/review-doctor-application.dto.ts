
import {
  IsIn,
  IsOptional,
  IsString,
  MaxLength,
} from 'class-validator';

export class ReviewDoctorApplicationDto {
  @IsIn(['UNDER_REVIEW', 'APPROVED', 'REJECTED', 'NEEDS_CHANGES'])
  status:
    | 'UNDER_REVIEW'
    | 'APPROVED'
    | 'REJECTED'
    | 'NEEDS_CHANGES';

  @IsOptional()
  @IsString()
  clinicId?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1500)
  reviewNote?: string;
}
