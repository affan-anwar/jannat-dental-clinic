import { IsIn, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class VerifyResetOtpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;

  @IsIn(['EMAIL', 'SMS'])
  channel!: 'EMAIL' | 'SMS';

  @IsString()
  @Length(6, 6)
  otp!: string;
}
