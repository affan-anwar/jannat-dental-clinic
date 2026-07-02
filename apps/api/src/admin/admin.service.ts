
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorAccountDto } from './dto/create-doctor-account.dto';
import { ReviewDoctorApplicationDto } from './dto/review-doctor-application.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';

@Injectable()
export class AdminService {
  constructor(private readonly prisma: PrismaService) {}

  async createDoctorAccount(
    superAdminId: string,
    dto: CreateDoctorAccountDto,
  ) {
    const email = dto.email.trim().toLowerCase();
    const phone = dto.phone?.trim() || null;

    const [existingEmail, clinic] = await Promise.all([
      this.prisma.user.findUnique({ where: { email } }),
      this.prisma.clinic.findUnique({ where: { id: dto.clinicId } }),
    ]);

    if (existingEmail) {
      throw new ConflictException('An account with this email already exists');
    }

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    if (phone) {
      const existingPhone = await this.prisma.user.findUnique({
        where: { phone },
      });

      if (existingPhone) {
        throw new ConflictException(
          'An account with this phone number already exists',
        );
      }
    }

    if (dto.registrationNumber?.trim()) {
      const existingRegistration = await this.prisma.doctor.findUnique({
        where: { registrationNumber: dto.registrationNumber.trim() },
      });

      if (existingRegistration) {
        throw new ConflictException(
          'Doctor registration number already exists',
        );
      }
    }

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const result = await this.prisma.$transaction(async (transaction) => {
      const user = await transaction.user.create({
        data: {
          firstName: dto.firstName.trim(),
          lastName: dto.lastName?.trim() || null,
          email,
          phone,
          passwordHash,
          role: 'DOCTOR',
          status: 'ACTIVE',
        },
      });

      const doctor = await transaction.doctor.create({
        data: {
          userId: user.id,
          clinicId: dto.clinicId,
          fullName: dto.fullName.trim(),
          designation: dto.designation?.trim() || null,
          qualification: dto.qualification?.trim() || null,
          specialization: dto.specialization?.trim() || null,
          experienceYears: dto.experienceYears,
          registrationNumber: dto.registrationNumber?.trim() || null,
          bio: dto.bio?.trim() || null,
          photoUrl: dto.photoUrl?.trim() || null,
          consultationFee: dto.consultationFee,
          degrees: this.cleanList(dto.degrees),
          education: this.cleanList(dto.education),
          languages: this.cleanList(dto.languages),
          isVerified: true,
          isPublic: true,
          isActive: true,
          verifiedAt: new Date(),
          verifiedById: superAdminId,
          profileCompletedAt: new Date(),
        },
        include: {
          clinic: true,
        },
      });

      return {
        user: {
          id: user.id,
          firstName: user.firstName,
          lastName: user.lastName,
          email: user.email,
          phone: user.phone,
          role: user.role,
          status: user.status,
        },
        doctor,
      };
    });

    return {
      success: true,
      message: 'Doctor account created and verified successfully',
      ...result,
    };
  }

  listDoctors() {
    return this.prisma.doctor.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        clinic: true,
        availability: true,
        services: {
          include: {
            service: true,
          },
        },
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
      },
    });
  }

  async updateDoctorStatus(
    doctorId: string,
    superAdminId: string,
    dto: UpdateDoctorStatusDto,
  ) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        userId: true,
        isVerified: true,
      },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    const updated = await this.prisma.$transaction(async (transaction) => {
      const profile = await transaction.doctor.update({
        where: { id: doctorId },
        data: {
          ...(dto.isVerified !== undefined
            ? {
                isVerified: dto.isVerified,
                verifiedAt: dto.isVerified ? new Date() : null,
                verifiedById: dto.isVerified ? superAdminId : null,
                ...(!dto.isVerified ? { isPublic: false } : {}),
              }
            : {}),
          ...(dto.isPublic !== undefined
            ? { isPublic: dto.isPublic }
            : {}),
          ...(dto.isActive !== undefined
            ? { isActive: dto.isActive }
            : {}),
          ...(dto.availableForBooking !== undefined
            ? { availableForBooking: dto.availableForBooking }
            : {}),
        },
        include: {
          clinic: true,
          availability: true,
          user: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              role: true,
              status: true,
            },
          },
        },
      });

      if (dto.accountStatus) {
        await transaction.user.update({
          where: { id: doctor.userId },
          data: { status: dto.accountStatus },
        });
      }

      return profile;
    });

    return {
      success: true,
      message: 'Doctor status updated successfully',
      doctor: updated,
    };
  }

  listDoctorApplications(status?: string) {
    const allowedStatuses = [
      'PENDING',
      'UNDER_REVIEW',
      'APPROVED',
      'REJECTED',
      'NEEDS_CHANGES',
    ];

    if (status && !allowedStatuses.includes(status)) {
      throw new BadRequestException('Invalid application status');
    }

    return this.prisma.doctorApplication.findMany({
      where: status
        ? {
            status: status as
              | 'PENDING'
              | 'UNDER_REVIEW'
              | 'APPROVED'
              | 'REJECTED'
              | 'NEEDS_CHANGES',
          }
        : undefined,
      orderBy: { createdAt: 'desc' },
      include: {
        applicant: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phone: true,
            role: true,
            status: true,
          },
        },
        requestedClinic: true,
        reviewedBy: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        doctor: {
          include: {
            clinic: true,
          },
        },
      },
    });
  }

  async reviewDoctorApplication(
    applicationId: string,
    superAdminId: string,
    dto: ReviewDoctorApplicationDto,
  ) {
    const application = await this.prisma.doctorApplication.findUnique({
      where: { id: applicationId },
      include: {
        applicant: true,
        requestedClinic: true,
      },
    });

    if (!application) {
      throw new NotFoundException('Doctor application not found');
    }

    if (dto.status !== 'APPROVED') {
      const updated = await this.prisma.doctorApplication.update({
        where: { id: applicationId },
        data: {
          status: dto.status,
          reviewNote: dto.reviewNote?.trim() || null,
          reviewedById: superAdminId,
          reviewedAt: new Date(),
        },
        include: {
          applicant: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          requestedClinic: true,
        },
      });

      return {
        success: true,
        message: `Doctor application marked as ${dto.status}`,
        application: updated,
      };
    }

    const registrationNumber = application.registrationNumber?.trim() || null;

    if (registrationNumber) {
      const duplicate = await this.prisma.doctor.findFirst({
        where: {
          registrationNumber,
          NOT: {
            userId: application.userId,
          },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException(
          'Doctor registration number already exists',
        );
      }
    }

    const result = await this.prisma.$transaction(async (transaction) => {
      let clinicId =
        dto.clinicId?.trim() ||
        application.requestedClinicId ||
        application.requestedClinic?.id ||
        null;

      if (clinicId) {
        const clinic = await transaction.clinic.findUnique({
          where: { id: clinicId },
          select: { id: true },
        });

        if (!clinic) {
          throw new NotFoundException('Clinic not found');
        }
      }

      if (!clinicId && application.requestedRole === 'DOCTOR_ADMIN') {
        const clinic = await transaction.clinic.create({
          data: {
            adminDoctorId: application.userId,
            name: application.clinicName,
            slug: await this.createUniqueClinicSlug(
              application.clinicName,
              transaction,
            ),
            phone: application.clinicPhone,
            email: application.clinicEmail,
            addressLine1: application.clinicAddressLine1,
            addressLine2: application.clinicAddressLine2,
            city: application.clinicCity,
            state: application.clinicState,
            postalCode: application.clinicPostalCode,
            country: application.clinicCountry,
            isActive: true,
          },
        });

        clinicId = clinic.id;
      }

      if (!clinicId) {
        throw new BadRequestException(
          'Select an existing clinic before approving this doctor',
        );
      }

      const fullName = [
        application.applicant.firstName,
        application.applicant.lastName,
      ]
        .filter(Boolean)
        .join(' ');

      const doctor = await transaction.doctor.upsert({
        where: { userId: application.userId },
        create: {
          userId: application.userId,
          clinicId,
          applicationId: application.id,
          fullName,
          qualification: application.qualification,
          specialization: application.specialization,
          experienceYears: application.experienceYears,
          registrationNumber,
          registrationCouncil: application.registrationCouncil,
          bio: application.biography,
          photoUrl: application.profilePhotoUrl,
          isVerified: true,
          isPublic: true,
          isActive: true,
          availableForBooking: true,
          verifiedAt: new Date(),
          verifiedById: superAdminId,
          profileCompletedAt: new Date(),
        },
        update: {
          clinicId,
          applicationId: application.id,
          fullName,
          qualification: application.qualification,
          specialization: application.specialization,
          experienceYears: application.experienceYears,
          registrationNumber,
          registrationCouncil: application.registrationCouncil,
          bio: application.biography,
          photoUrl: application.profilePhotoUrl,
          isVerified: true,
          isPublic: true,
          isActive: true,
          verifiedAt: new Date(),
          verifiedById: superAdminId,
          profileCompletedAt: new Date(),
        },
        include: {
          clinic: true,
        },
      });

      await transaction.user.update({
        where: { id: application.userId },
        data: {
          role:
            application.requestedRole === 'DOCTOR_ADMIN'
              ? 'DOCTOR_ADMIN'
              : 'DOCTOR',
          status: 'ACTIVE',
        },
      });

      if (application.requestedRole === 'DOCTOR_ADMIN') {
        await transaction.clinic.update({
          where: { id: clinicId },
          data: {
            adminDoctorId: application.userId,
          },
        });
      }

      const reviewedApplication =
        await transaction.doctorApplication.update({
          where: { id: application.id },
          data: {
            status: 'APPROVED',
            reviewNote: dto.reviewNote?.trim() || null,
            reviewedById: superAdminId,
            reviewedAt: new Date(),
          },
        });

      return {
        doctor,
        application: reviewedApplication,
      };
    });

    return {
      success: true,
      message: 'Doctor application approved successfully',
      ...result,
    };
  }

  private async createUniqueClinicSlug(
    name: string,
    transaction: any,
  ): Promise<string> {
    const base =
      name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '') || 'clinic';

    let slug = base;
    let counter = 1;

    while (await transaction.clinic.findUnique({ where: { slug } })) {
      slug = `${base}-${counter}`;
      counter += 1;
    }

    return slug;
  }

  private cleanList(values?: string[]): string[] {
    return (values ?? []).map((value) => value.trim()).filter(Boolean);
  }
}
