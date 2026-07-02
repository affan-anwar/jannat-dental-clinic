import { IsIn, IsString, MaxLength, MinLength } from 'class-validator';

export class ResendResetOtpDto {
  @IsString()
  @MinLength(3)
  @MaxLength(254)
  identifier!: string;

  @IsIn(['EMAIL', 'SMS'])
  channel!: 'EMAIL' | 'SMS';
}
