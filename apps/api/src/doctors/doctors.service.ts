
import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorApplicationDto } from './dto/create-doctor-application.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';

@Injectable()
export class DoctorsService {
  constructor(private readonly prisma: PrismaService) {}

  findPublic() {
    return this.prisma.doctor.findMany({
      where: {
        isActive: true,
        isVerified: true,
        isPublic: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
      select: this.publicDoctorSelect(),
    });
  }

  async findPublicById(idOrSlug: string) {
    const doctor = await this.prisma.doctor.findFirst({
      where: {
        OR: [{ id: idOrSlug }, { slug: idOrSlug }],
        isActive: true,
        isVerified: true,
        isPublic: true,
      },
      select: this.publicDoctorSelect(),
    });

    if (!doctor) {
      throw new NotFoundException('Doctor profile not found');
    }

    return doctor;
  }

  async submitApplication(userId: string, dto: CreateDoctorApplicationDto) {
    if (dto.requestedClinicId) {
      const clinic = await this.prisma.clinic.findUnique({
        where: { id: dto.requestedClinicId },
        select: { id: true },
      });

      if (!clinic) {
        throw new NotFoundException('Requested clinic not found');
      }
    }

    const application = await this.prisma.doctorApplication.upsert({
      where: { userId },
      create: {
        userId,
        requestedRole: dto.requestedRole ?? 'DOCTOR',
        requestedClinicId: dto.requestedClinicId?.trim() || null,
        clinicName: dto.clinicName.trim(),
        clinicPhone: dto.clinicPhone?.trim() || null,
        clinicEmail: dto.clinicEmail?.trim().toLowerCase() || null,
        clinicAddressLine1: dto.clinicAddressLine1?.trim() || null,
        clinicAddressLine2: dto.clinicAddressLine2?.trim() || null,
        clinicCity: dto.clinicCity?.trim() || null,
        clinicState: dto.clinicState?.trim() || null,
        clinicPostalCode: dto.clinicPostalCode?.trim() || null,
        clinicCountry: dto.clinicCountry?.trim() || 'India',
        qualification: dto.qualification?.trim() || null,
        specialization: dto.specialization?.trim() || null,
        registrationNumber: dto.registrationNumber?.trim() || null,
        registrationCouncil: dto.registrationCouncil?.trim() || null,
        experienceYears: dto.experienceYears,
        biography: dto.biography?.trim() || null,
        profilePhotoUrl: dto.profilePhotoUrl?.trim() || null,
        registrationDocUrl: dto.registrationDocUrl?.trim() || null,
        degreeDocUrl: dto.degreeDocUrl?.trim() || null,
        identityDocUrl: dto.identityDocUrl?.trim() || null,
        status: 'PENDING',
        submittedAt: new Date(),
      },
      update: {
        requestedRole: dto.requestedRole ?? 'DOCTOR',
        requestedClinicId: dto.requestedClinicId?.trim() || null,
        clinicName: dto.clinicName.trim(),
        clinicPhone: dto.clinicPhone?.trim() || null,
        clinicEmail: dto.clinicEmail?.trim().toLowerCase() || null,
        clinicAddressLine1: dto.clinicAddressLine1?.trim() || null,
        clinicAddressLine2: dto.clinicAddressLine2?.trim() || null,
        clinicCity: dto.clinicCity?.trim() || null,
        clinicState: dto.clinicState?.trim() || null,
        clinicPostalCode: dto.clinicPostalCode?.trim() || null,
        clinicCountry: dto.clinicCountry?.trim() || 'India',
        qualification: dto.qualification?.trim() || null,
        specialization: dto.specialization?.trim() || null,
        registrationNumber: dto.registrationNumber?.trim() || null,
        registrationCouncil: dto.registrationCouncil?.trim() || null,
        experienceYears: dto.experienceYears,
        biography: dto.biography?.trim() || null,
        profilePhotoUrl: dto.profilePhotoUrl?.trim() || null,
        registrationDocUrl: dto.registrationDocUrl?.trim() || null,
        degreeDocUrl: dto.degreeDocUrl?.trim() || null,
        identityDocUrl: dto.identityDocUrl?.trim() || null,
        status: 'PENDING',
        reviewNote: null,
        reviewedById: null,
        reviewedAt: null,
        submittedAt: new Date(),
      },
      include: {
        requestedClinic: true,
      },
    });

    return {
      success: true,
      message: 'Doctor application submitted for review',
      application,
    };
  }

  async findMyApplication(userId: string) {
    const application = await this.prisma.doctorApplication.findUnique({
      where: { userId },
      include: {
        requestedClinic: true,
        doctor: {
          include: {
            clinic: true,
          },
        },
      },
    });

    if (!application) {
      throw new NotFoundException('Doctor application not found');
    }

    return application;
  }

  async findMine(userId: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      include: this.privateDoctorInclude(),
    });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile is not linked to this account',
      );
    }

    return doctor;
  }

  async updateMine(userId: string, dto: UpdateDoctorProfileDto) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { userId },
      select: { id: true },
    });

    if (!doctor) {
      throw new NotFoundException(
        'Doctor profile is not linked to this account',
      );
    }

    return this.updateDoctorProfile(doctor.id, dto);
  }

  async updateByAdmin(doctorId: string, dto: UpdateDoctorProfileDto) {
    return this.updateDoctorProfile(doctorId, dto);
  }

  private async updateDoctorProfile(
    doctorId: string,
    dto: UpdateDoctorProfileDto,
  ) {
    const existing = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
      select: {
        id: true,
        clinicId: true,
      },
    });

    if (!existing) {
      throw new NotFoundException('Doctor profile not found');
    }

    if (dto.registrationNumber?.trim()) {
      const duplicate = await this.prisma.doctor.findFirst({
        where: {
          registrationNumber: dto.registrationNumber.trim(),
          NOT: { id: doctorId },
        },
        select: { id: true },
      });

      if (duplicate) {
        throw new ConflictException(
          'Doctor registration number already exists',
        );
      }
    }

    const serviceIds = this.uniqueList(dto.serviceIds ?? []);

    if (dto.serviceIds !== undefined && serviceIds.length > 0) {
      const validServices = await this.prisma.service.count({
        where: {
          id: { in: serviceIds },
          clinicId: existing.clinicId,
        },
      });

      if (validServices !== serviceIds.length) {
        throw new BadRequestException(
          'One or more selected services do not belong to this clinic',
        );
      }
    }

    await this.prisma.doctor.update({
      where: { id: doctorId },
      data: {
        ...this.toUpdateData(dto),
        profileCompletedAt: new Date(),
        ...(dto.availability !== undefined
          ? {
              availability: {
                deleteMany: {},
                create: dto.availability.map((slot) => ({
                  dayOfWeek: slot.dayOfWeek,
                  startTime: slot.startTime,
                  endTime: slot.endTime,
                  slotDurationMinutes: slot.slotDurationMinutes ?? 30,
                  isAvailable: slot.isAvailable ?? true,
                })),
              },
            }
          : {}),
        ...(dto.serviceIds !== undefined
          ? {
              services: {
                deleteMany: {},
                create: serviceIds.map((serviceId) => ({
                  service: {
                    connect: { id: serviceId },
                  },
                })),
              },
            }
          : {}),
      },
    });

    return this.prisma.doctor.findUnique({
      where: { id: doctorId },
      include: this.privateDoctorInclude(),
    });
  }

  private toUpdateData(dto: UpdateDoctorProfileDto) {
    return {
      ...(dto.fullName !== undefined
        ? { fullName: dto.fullName.trim() }
        : {}),
      ...(dto.designation !== undefined
        ? { designation: dto.designation.trim() || null }
        : {}),
      ...(dto.qualification !== undefined
        ? { qualification: dto.qualification.trim() || null }
        : {}),
      ...(dto.specialization !== undefined
        ? { specialization: dto.specialization.trim() || null }
        : {}),
      ...(dto.experienceYears !== undefined
        ? { experienceYears: dto.experienceYears }
        : {}),
      ...(dto.registrationNumber !== undefined
        ? { registrationNumber: dto.registrationNumber.trim() || null }
        : {}),
      ...(dto.registrationCouncil !== undefined
        ? { registrationCouncil: dto.registrationCouncil.trim() || null }
        : {}),
      ...(dto.bio !== undefined ? { bio: dto.bio.trim() || null } : {}),
      ...(dto.photoUrl !== undefined
        ? { photoUrl: dto.photoUrl.trim() || null }
        : {}),
      ...(dto.consultationFee !== undefined
        ? { consultationFee: dto.consultationFee }
        : {}),
      ...(dto.publicEmail !== undefined
        ? { publicEmail: dto.publicEmail.trim().toLowerCase() || null }
        : {}),
      ...(dto.publicPhone !== undefined
        ? { publicPhone: dto.publicPhone.trim() || null }
        : {}),
      ...(dto.degrees !== undefined
        ? { degrees: this.cleanList(dto.degrees) }
        : {}),
      ...(dto.education !== undefined
        ? { education: this.cleanList(dto.education) }
        : {}),
      ...(dto.languages !== undefined
        ? { languages: this.cleanList(dto.languages) }
        : {}),
      ...(dto.memberships !== undefined
        ? { memberships: this.cleanList(dto.memberships) }
        : {}),
      ...(dto.awards !== undefined
        ? { awards: this.cleanList(dto.awards) }
        : {}),
      ...(dto.websiteUrl !== undefined
        ? { websiteUrl: dto.websiteUrl.trim() || null }
        : {}),
      ...(dto.instagramUrl !== undefined
        ? { instagramUrl: dto.instagramUrl.trim() || null }
        : {}),
      ...(dto.signatureUrl !== undefined
        ? { signatureUrl: dto.signatureUrl.trim() || null }
        : {}),
      ...(dto.availableForBooking !== undefined
        ? { availableForBooking: dto.availableForBooking }
        : {}),
    };
  }

  private publicDoctorSelect() {
    return {
      id: true,
      slug: true,
      fullName: true,
      designation: true,
      qualification: true,
      specialization: true,
      experienceYears: true,
      registrationNumber: true,
      registrationCouncil: true,
      bio: true,
      photoUrl: true,
      consultationFee: true,
      publicEmail: true,
      publicPhone: true,
      degrees: true,
      education: true,
      languages: true,
      memberships: true,
      awards: true,
      websiteUrl: true,
      instagramUrl: true,
      availableForBooking: true,
      availability: {
        where: { isAvailable: true },
        orderBy: [{ dayOfWeek: 'asc' as const }, { startTime: 'asc' as const }],
      },
      services: {
        select: {
          service: {
            select: {
              id: true,
              name: true,
              slug: true,
              description: true,
              durationMinutes: true,
              price: true,
            },
          },
        },
      },
      clinic: {
        select: {
          id: true,
          name: true,
          phone: true,
          email: true,
          addressLine1: true,
          addressLine2: true,
          city: true,
          state: true,
          postalCode: true,
          country: true,
        },
      },
    };
  }

  private privateDoctorInclude() {
    return {
      clinic: true,
      application: true,
      availability: {
        orderBy: [{ dayOfWeek: 'asc' as const }, { startTime: 'asc' as const }],
      },
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
    };
  }

  private cleanList(values: string[]): string[] {
    return values.map((value) => value.trim()).filter(Boolean);
  }

  private uniqueList(values: string[]): string[] {
    return [...new Set(this.cleanList(values))];
  }
}
