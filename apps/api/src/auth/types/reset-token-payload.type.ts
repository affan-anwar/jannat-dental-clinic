export interface ResetTokenPayload {
  sub: string;
  purpose: 'password-reset';
  channel: 'EMAIL' | 'SMS';
  otpId?: string;
}
