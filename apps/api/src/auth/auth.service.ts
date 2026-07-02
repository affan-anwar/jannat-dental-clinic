import {
  BadRequestException,
  ConflictException,
  HttpException,
  HttpStatus,
  Injectable,
  ServiceUnavailableException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { randomInt } from 'node:crypto';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from '../users/users.service';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { LoginDto } from './dto/login.dto';
import { ResendResetOtpDto } from './dto/resend-reset-otp.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { SignupDto } from './dto/signup.dto';
import { VerifyResetOtpDto } from './dto/verify-reset-otp.dto';
import { MailService } from './mail/mail.service';
import { SmsService } from './sms/sms.service';
import { JwtPayload } from './types/jwt-payload.type';
import { ResetTokenPayload } from './types/reset-token-payload.type';

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
    private readonly mailService: MailService,
    private readonly smsService: SmsService,
  ) {}

  async signup(signupDto: SignupDto) {
    const email = signupDto.email.trim().toLowerCase();
    const existingEmail = await this.usersService.findByEmail(email);

    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    if (signupDto.phone) {
      const existingPhone = await this.usersService.findByPhone(
        signupDto.phone.trim(),
      );

      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    const passwordHash = await bcrypt.hash(signupDto.password, 12);
    const user = await this.usersService.createPatient({
      firstName: signupDto.firstName,
      lastName: signupDto.lastName,
      email,
      phone: signupDto.phone,
      passwordHash,
    });

    return this.createAuthResponse(user);
  }

  async login(loginDto: LoginDto) {
    const email = loginDto.email.trim().toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) {
      throw new UnauthorizedException('Invalid email or password');
    }

    const passwordMatches = await bcrypt.compare(
      loginDto.password,
      user.passwordHash,
    );

    if (!passwordMatches) {
      throw new UnauthorizedException('Invalid email or password');
    }

    if (user.status !== 'ACTIVE') {
      throw new UnauthorizedException('Your account is not active');
    }

    return this.createAuthResponse(user);
  }

  getProfile(userId: string) {
    return this.usersService.findPublicById(userId);
  }

  async forgotPassword(dto: ForgotPasswordDto) {
    const user = await this.findUserByIdentifier(dto.identifier);

    // Always return a generic response so attackers cannot discover accounts.
    if (!user) {
      return this.genericOtpResponse(dto.channel);
    }

    if (dto.channel === 'EMAIL') {
      await this.sendEmailResetOtp(user);
    } else {
      if (!user.phone) {
        return this.genericOtpResponse(dto.channel);
      }

      await this.smsService.sendPasswordResetOtp(
        this.normalizePhoneForSms(user.phone),
      );
    }

    return this.genericOtpResponse(dto.channel);
  }

  resendResetOtp(dto: ResendResetOtpDto) {
    return this.forgotPassword(dto);
  }

  async verifyResetOtp(dto: VerifyResetOtpDto) {
    const user = await this.findUserByIdentifier(dto.identifier);

    if (!user) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    if (dto.channel === 'SMS') {
      if (!user.phone) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      const approved = await this.smsService.verifyPasswordResetOtp(
        this.normalizePhoneForSms(user.phone),
        dto.otp,
      );

      if (!approved) {
        throw new UnauthorizedException('Invalid or expired OTP');
      }

      const now = new Date();
      const expiresMinutes = this.getPositiveNumber(
        'RESET_OTP_EXPIRES_MINUTES',
        10,
      );
      const smsSession = await this.prisma.passwordResetOtp.create({
        data: {
          userId: user.id,
          channel: 'SMS',
          destination: this.normalizePhoneForSms(user.phone),
          otpHash: await bcrypt.hash(dto.otp, 12),
          expiresAt: new Date(now.getTime() + expiresMinutes * 60_000),
          verifiedAt: now,
          lastSentAt: now,
        },
      });

      return {
        success: true,
        resetToken: await this.createResetToken({
          sub: user.id,
          purpose: 'password-reset',
          channel: 'SMS',
          otpId: smsSession.id,
        }),
      };
    }

    const maxAttempts = this.getPositiveNumber('RESET_OTP_MAX_ATTEMPTS', 5);
    const otpRecord = await this.prisma.passwordResetOtp.findFirst({
      where: {
        userId: user.id,
        channel: 'EMAIL',
        usedAt: null,
      },
      orderBy: { createdAt: 'desc' },
    });

    if (
      !otpRecord ||
      otpRecord.expiresAt.getTime() <= Date.now() ||
      otpRecord.attempts >= maxAttempts
    ) {
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    const matches = await bcrypt.compare(dto.otp, otpRecord.otpHash);

    if (!matches) {
      await this.prisma.passwordResetOtp.update({
        where: { id: otpRecord.id },
        data: { attempts: { increment: 1 } },
      });
      throw new UnauthorizedException('Invalid or expired OTP');
    }

    await this.prisma.passwordResetOtp.update({
      where: { id: otpRecord.id },
      data: { verifiedAt: new Date() },
    });

    return {
      success: true,
      resetToken: await this.createResetToken({
        sub: user.id,
        purpose: 'password-reset',
        channel: 'EMAIL',
        otpId: otpRecord.id,
      }),
    };
  }

  async resetPassword(dto: ResetPasswordDto) {
    const payload = await this.verifyResetToken(dto.resetToken);
    const passwordHash = await bcrypt.hash(dto.newPassword, 12);
    const now = new Date();

    if (!payload.otpId) {
      throw new UnauthorizedException('Invalid reset session');
    }

    const otpRecord = await this.prisma.passwordResetOtp.findFirst({
      where: {
        id: payload.otpId,
        userId: payload.sub,
        channel: payload.channel,
        verifiedAt: { not: null },
        usedAt: null,
        expiresAt: { gt: now },
      },
    });

    if (!otpRecord) {
      throw new UnauthorizedException('Invalid or expired reset session');
    }

    await this.prisma.$transaction([
      this.prisma.user.update({
        where: { id: payload.sub },
        data: {
          passwordHash,
          ...(payload.channel === 'EMAIL' ? { emailVerified: true } : {}),
        },
      }),
      this.prisma.passwordResetOtp.updateMany({
        where: { userId: payload.sub, usedAt: null },
        data: { usedAt: now },
      }),
    ]);

    return {
      success: true,
      message: 'Password reset successfully. You can now log in.',
    };
  }

  private async sendEmailResetOtp(user: {
    id: string;
    email: string;
    firstName: string;
  }) {
    const cooldownSeconds = this.getPositiveNumber(
      'RESET_OTP_RESEND_SECONDS',
      60,
    );
    const latest = await this.prisma.passwordResetOtp.findFirst({
      where: { userId: user.id, channel: 'EMAIL', usedAt: null },
      orderBy: { createdAt: 'desc' },
    });

    if (
      latest &&
      Date.now() - latest.lastSentAt.getTime() < cooldownSeconds * 1000
    ) {
      throw new HttpException(
        `Please wait ${cooldownSeconds} seconds before requesting another OTP`,
        HttpStatus.TOO_MANY_REQUESTS,
      );
    }

    const otp = randomInt(100000, 1000000).toString();
    const otpHash = await bcrypt.hash(otp, 12);
    const expiresMinutes = this.getPositiveNumber(
      'RESET_OTP_EXPIRES_MINUTES',
      10,
    );
    const now = new Date();

    await this.prisma.passwordResetOtp.updateMany({
      where: { userId: user.id, channel: 'EMAIL', usedAt: null },
      data: { usedAt: now },
    });

    const record = await this.prisma.passwordResetOtp.create({
      data: {
        userId: user.id,
        channel: 'EMAIL',
        destination: user.email,
        otpHash,
        expiresAt: new Date(now.getTime() + expiresMinutes * 60_000),
        lastSentAt: now,
      },
    });

    try {
      await this.mailService.sendPasswordResetOtp({
        to: user.email,
        firstName: user.firstName,
        otp,
        expiresMinutes,
      });
    } catch (error) {
      await this.prisma.passwordResetOtp.delete({ where: { id: record.id } });

      if (error instanceof ServiceUnavailableException) {
        throw error;
      }
      throw new ServiceUnavailableException('Unable to send OTP');
    }
  }

  private async findUserByIdentifier(identifier: string) {
    const value = identifier.trim();

    if (value.includes('@')) {
      return this.prisma.user.findUnique({
        where: { email: value.toLowerCase() },
      });
    }

    const digits = value.replace(/\D/g, '');
    const withoutLeadingZero = digits.startsWith('0')
      ? digits.slice(1)
      : digits;
    const localTenDigits = withoutLeadingZero.startsWith('91')
      ? withoutLeadingZero.slice(2)
      : withoutLeadingZero;

    const candidates = Array.from(
      new Set([
        value,
        digits,
        `+${digits}`,
        withoutLeadingZero,
        `0${localTenDigits}`,
        localTenDigits,
        `91${localTenDigits}`,
        `+91${localTenDigits}`,
      ]),
    ).filter(Boolean);

    return this.prisma.user.findFirst({
      where: { phone: { in: candidates } },
    });
  }

  private normalizePhoneForSms(value: string): string {
    const digits = value.replace(/\D/g, '');

    if (value.trim().startsWith('+')) {
      return `+${digits}`;
    }

    if (digits.startsWith('91') && digits.length === 12) {
      return `+${digits}`;
    }

    if (digits.startsWith('0') && digits.length === 11) {
      return `+91${digits.slice(1)}`;
    }

    if (digits.length === 10) {
      return `+91${digits}`;
    }

    throw new BadRequestException(
      'Phone number must be a valid Indian mobile number',
    );
  }

  private genericOtpResponse(channel: 'EMAIL' | 'SMS') {
    return {
      success: true,
      message:
        channel === 'EMAIL'
          ? 'If the account exists, an OTP has been sent to the registered email.'
          : 'If the account exists, an OTP has been sent to the registered phone.',
    };
  }

  private createResetToken(payload: ResetTokenPayload) {
    return this.jwtService.signAsync(payload, {
      secret: this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
      expiresIn: this.getPositiveNumber('JWT_RESET_EXPIRES_SECONDS', 600),
    });
  }

  private async verifyResetToken(token: string): Promise<ResetTokenPayload> {
    try {
      const payload = await this.jwtService.verifyAsync<ResetTokenPayload>(
        token,
        {
          secret: this.configService.getOrThrow<string>('JWT_RESET_SECRET'),
        },
      );

      if (payload.purpose !== 'password-reset') {
        throw new UnauthorizedException('Invalid reset session');
      }

      return payload;
    } catch {
      throw new UnauthorizedException('Invalid or expired reset session');
    }
  }

  private getPositiveNumber(key: string, fallback: number): number {
    const value = Number(this.configService.get<string>(key));
    return Number.isFinite(value) && value > 0 ? value : fallback;
  }

  private async createAuthResponse(user: {
    id: string;
    firstName: string;
    lastName: string | null;
    email: string;
    phone: string | null;
    avatarUrl: string | null;
    role: string;
    status: string;
    emailVerified: boolean;
    createdAt: Date;
    updatedAt: Date;
  }) {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    const accessToken = await this.jwtService.signAsync(payload);

    return {
      success: true,
      accessToken,
      tokenType: 'Bearer',
      expiresIn: 900,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phone: user.phone,
        avatarUrl: user.avatarUrl,
        role: user.role,
        status: user.status,
        emailVerified: user.emailVerified,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      },
    };
  }
}
