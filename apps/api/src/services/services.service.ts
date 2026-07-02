import {
  BadRequestException,
  ConflictException,
  ForbiddenException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateServiceDto } from './dto/create-service.dto';
import { UpdateServiceDto } from './dto/update-service.dto';

interface Actor {
  sub: string;
  role: string;
}

@Injectable()
export class ServicesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.service.findMany({
      orderBy: [
        {
          clinic: {
            name: 'asc',
          },
        },
        {
          name: 'asc',
        },
      ],
      include: {
        clinic: {
          select: {
            id: true,
            name: true,
            city: true,
            state: true,
          },
        },
      },
    });
  }

  async create(actor: Actor, dto: CreateServiceDto) {
    await this.assertCanManageClinic(actor, dto.clinicId);

    const slug = this.createSlug(dto.slug ?? dto.name);
    await this.assertSlugAvailable(dto.clinicId, slug);

    return this.prisma.service.create({
      data: {
        clinicId: dto.clinicId,
        name: dto.name.trim(),
        slug,
        description: dto.description?.trim() || null,
        durationMinutes: dto.durationMinutes ?? 30,
        price: dto.price,
        icon: dto.icon?.trim() || null,
        imageUrl: dto.imageUrl?.trim() || null,
        isActive: dto.isActive ?? true,
      },
      include: {
        clinic: true,
      },
    });
  }

  async update(actor: Actor, id: string, dto: UpdateServiceDto) {
    const existing = await this.findOne(id);
    const targetClinicId = dto.clinicId ?? existing.clinicId;

    await this.assertCanManageClinic(actor, targetClinicId);

    if (actor.role === 'DOCTOR' && targetClinicId !== existing.clinicId) {
      throw new ForbiddenException(
        'Doctors cannot move services between clinics',
      );
    }

    let slug = existing.slug;

    if (dto.slug || dto.name) {
      slug = this.createSlug(dto.slug ?? dto.name ?? slug);

      if (slug !== existing.slug || targetClinicId !== existing.clinicId) {
        await this.assertSlugAvailable(targetClinicId, slug, id);
      }
    }

    return this.prisma.service.update({
      where: {
        id,
      },
      data: {
        ...(dto.clinicId !== undefined ? { clinicId: dto.clinicId } : {}),
        ...(dto.name !== undefined ? { name: dto.name.trim() } : {}),
        slug,
        ...(dto.description !== undefined
          ? {
              description: dto.description.trim() || null,
            }
          : {}),
        ...(dto.durationMinutes !== undefined
          ? { durationMinutes: dto.durationMinutes }
          : {}),
        ...(dto.price !== undefined ? { price: dto.price } : {}),
        ...(dto.icon !== undefined ? { icon: dto.icon.trim() || null } : {}),
        ...(dto.imageUrl !== undefined
          ? { imageUrl: dto.imageUrl.trim() || null }
          : {}),
        ...(dto.isActive !== undefined ? { isActive: dto.isActive } : {}),
      },
      include: {
        clinic: true,
      },
    });
  }

  async remove(actor: Actor, id: string) {
    const existing = await this.findOne(id);
    await this.assertCanManageClinic(actor, existing.clinicId);

    await this.prisma.service.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Service deleted successfully',
    };
  }

  private async findOne(id: string) {
    const service = await this.prisma.service.findUnique({
      where: {
        id,
      },
    });

    if (!service) {
      throw new NotFoundException('Service not found');
    }

    return service;
  }

  private async assertCanManageClinic(actor: Actor, clinicId: string) {
    if (actor.role === 'SUPER_ADMIN') {
      const clinic = await this.prisma.clinic.findUnique({
        where: {
          id: clinicId,
        },
      });

      if (!clinic) {
        throw new NotFoundException('Clinic not found');
      }

      return;
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: {
        userId: actor.sub,
      },
    });

    if (!doctor || doctor.clinicId !== clinicId) {
      throw new ForbiddenException(
        'You can manage services only for your clinic',
      );
    }
  }

  private async assertSlugAvailable(
    clinicId: string,
    slug: string,
    excludeId?: string,
  ) {
    const existing = await this.prisma.service.findFirst({
      where: {
        clinicId,
        slug,
        ...(excludeId
          ? {
              id: {
                not: excludeId,
              },
            }
          : {}),
      },
    });

    if (existing) {
      throw new ConflictException(
        'A service with this slug already exists for the clinic',
      );
    }
  }

  private createSlug(value: string): string {
    const slug = value
      .trim()
      .toLowerCase()
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');

    if (!slug) {
      throw new BadRequestException('Unable to generate service slug');
    }

    return slug;
  }
}
