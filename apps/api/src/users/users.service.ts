import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

interface CreatePatientData {
  firstName: string;
  lastName?: string;
  email: string;
  phone?: string;
  passwordHash: string;
}

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({
      where: {
        email: email.trim().toLowerCase(),
      },
    });
  }

  findByPhone(phone: string) {
    return this.prisma.user.findUnique({
      where: {
        phone,
      },
    });
  }

  createPatient(data: CreatePatientData) {
    return this.prisma.user.create({
      data: {
        firstName: data.firstName.trim(),
        lastName: data.lastName?.trim() || null,
        email: data.email.trim().toLowerCase(),
        phone: data.phone?.trim() || null,
        passwordHash: data.passwordHash,
      },
    });
  }

  async findPublicById(id: string) {
    const user = await this.prisma.user.findUnique({
      where: {
        id,
      },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        phone: true,
        avatarUrl: true,
        role: true,
        status: true,
        emailVerified: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }
}
