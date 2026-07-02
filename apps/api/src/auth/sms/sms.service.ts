import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import twilio from 'twilio';

@Injectable()
export class SmsService {
  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetOtp(phone: string): Promise<void> {
    const { client, serviceSid } = this.getClient();

    try {
      await client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: phone, channel: 'sms' });
    } catch {
      throw new ServiceUnavailableException('Unable to send SMS OTP');
    }
  }

  async verifyPasswordResetOtp(phone: string, otp: string): Promise<boolean> {
    const { client, serviceSid } = this.getClient();

    try {
      const result = await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: phone, code: otp });

      return result.status === 'approved';
    } catch {
      return false;
    }
  }

  private getClient() {
    const accountSid = this.configService.get<string>('TWILIO_ACCOUNT_SID');
    const authToken = this.configService.get<string>('TWILIO_AUTH_TOKEN');
    const serviceSid = this.configService.get<string>(
      'TWILIO_VERIFY_SERVICE_SID',
    );

    if (!accountSid || !authToken || !serviceSid) {
      throw new ServiceUnavailableException(
        'SMS OTP provider is not configured',
      );
    }

    return {
      client: twilio(accountSid, authToken),
      serviceSid,
    };
  }
}
