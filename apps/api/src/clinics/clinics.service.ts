import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateClinicDto } from './dto/create-clinic.dto';
import { UpdateClinicDto } from './dto/update-clinic.dto';

@Injectable()
export class ClinicsService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createClinicDto: CreateClinicDto) {
    const slug = this.createSlug(createClinicDto.slug ?? createClinicDto.name);

    await this.checkSlugAvailability(slug);

    return this.prisma.clinic.create({
      data: {
        ...createClinicDto,
        name: createClinicDto.name.trim(),
        slug,
      },
    });
  }

  async findAll() {
    return this.prisma.clinic.findMany({
      orderBy: {
        createdAt: 'desc',
      },
    });
  }

  async findOne(id: string) {
    const clinic = await this.prisma.clinic.findUnique({
      where: {
        id,
      },
    });

    if (!clinic) {
      throw new NotFoundException('Clinic not found');
    }

    return clinic;
  }

  async updateAuthorized(
    actor: { sub: string; role: string },
    id: string,
    updateClinicDto: UpdateClinicDto,
  ) {
    if (actor.role !== 'SUPER_ADMIN') {
      const doctor = await this.prisma.doctor.findUnique({
        where: {
          userId: actor.sub,
        },
      });

      if (!doctor || doctor.clinicId !== id) {
        throw new NotFoundException('Clinic not found or access denied');
      }
    }

    const existingClinic = await this.findOne(id);

    let slug = existingClinic.slug;

    if (updateClinicDto.slug) {
      slug = this.createSlug(updateClinicDto.slug);

      if (slug !== existingClinic.slug) {
        await this.checkSlugAvailability(slug);
      }
    }

    return this.prisma.clinic.update({
      where: {
        id,
      },
      data: {
        ...updateClinicDto,
        name: updateClinicDto.name?.trim(),
        slug,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    await this.prisma.clinic.delete({
      where: {
        id,
      },
    });

    return {
      success: true,
      message: 'Clinic deleted successfully',
    };
  }

  private async checkSlugAvailability(slug: string): Promise<void> {
    const existingClinic = await this.prisma.clinic.findUnique({
      where: {
        slug,
      },
    });

    if (existingClinic) {
      throw new ConflictException('Clinic slug already exists');
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
      throw new BadRequestException('Unable to generate clinic slug');
    }

    return slug;
  }
}
