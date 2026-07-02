import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

@Injectable()
export class AppointmentsService {
  constructor(private readonly prisma: PrismaService) {}

  create(patientId: string, dto: CreateAppointmentDto) {
    const appointmentDate = new Date(dto.appointmentDate);

    if (Number.isNaN(appointmentDate.getTime())) {
      throw new BadRequestException('Invalid appointment date');
    }

    if (appointmentDate.getTime() <= Date.now()) {
      throw new BadRequestException('Appointment must be in the future');
    }

    return this.prisma.appointment.create({
      data: {
        patientId,
        clinicId: dto.clinicId,
        doctorId: dto.doctorId || null,
        serviceName: dto.serviceName.trim(),
        appointmentDate,
        notes: dto.notes?.trim() || null,
      },
      include: {
        clinic: {
          select: { id: true, name: true, city: true, state: true },
        },
        doctor: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  findMine(patientId: string) {
    return this.prisma.appointment.findMany({
      where: { patientId },
      orderBy: { appointmentDate: 'desc' },
      include: {
        clinic: {
          select: { id: true, name: true, city: true, state: true },
        },
        doctor: {
          select: { id: true, fullName: true },
        },
      },
    });
  }

  async cancel(patientId: string, id: string) {
    const appointment = await this.prisma.appointment.findFirst({
      where: { id, patientId },
    });

    if (!appointment) {
      throw new NotFoundException('Appointment not found');
    }

    if (appointment.status === 'COMPLETED') {
      throw new BadRequestException(
        'Completed appointment cannot be cancelled',
      );
    }

    if (appointment.status === 'CANCELLED') {
      return appointment;
    }

    return this.prisma.appointment.update({
      where: { id },
      data: { status: 'CANCELLED' },
    });
  }
}
