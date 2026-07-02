import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { Resend } from 'resend';

@Injectable()
export class MailService {
  constructor(private readonly configService: ConfigService) {}

  async sendPasswordResetOtp(input: {
    to: string;
    firstName: string;
    otp: string;
    expiresMinutes: number;
  }): Promise<void> {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    const from = this.configService.get<string>('RESET_EMAIL_FROM');

    if (!apiKey || !from) {
      throw new ServiceUnavailableException(
        'Email OTP provider is not configured',
      );
    }

    const resend = new Resend(apiKey);
    const safeName = this.escapeHtml(input.firstName || 'Patient');
    const { error } = await resend.emails.send({
      from,
      to: [input.to],
      subject: 'Jannat Dental Clinic password reset OTP',
      html: `
        <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;padding:24px;color:#0f172a">
          <h2 style="color:#047857">Jannat Dental Clinic</h2>
          <p>Hello ${safeName},</p>
          <p>Use this one-time code to reset your password:</p>
          <div style="font-size:34px;font-weight:700;letter-spacing:10px;background:#ecfdf5;padding:18px;text-align:center;border-radius:12px;color:#065f46">
            ${input.otp}
          </div>
          <p>This code expires in ${input.expiresMinutes} minutes.</p>
          <p>If you did not request this, ignore this email. Never share this OTP with anyone.</p>
        </div>
      `,
    });

    if (error) {
      throw new ServiceUnavailableException(
        'Unable to send password reset email',
      );
    }
  }

  private escapeHtml(value: string): string {
    return value
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }
}
