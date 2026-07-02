import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AppointmentsService } from './appointments.service';
import { CreateAppointmentDto } from './dto/create-appointment.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('appointments')
@UseGuards(JwtAuthGuard)
export class AppointmentsController {
  constructor(private readonly appointmentsService: AppointmentsService) {}

  @Post()
  create(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateAppointmentDto,
  ) {
    return this.appointmentsService.create(request.user.sub, dto);
  }

  @Get()
  findMine(@Req() request: AuthenticatedRequest) {
    return this.appointmentsService.findMine(request.user.sub);
  }

  @Patch(':id/cancel')
  cancel(@Req() request: AuthenticatedRequest, @Param('id') id: string) {
    return this.appointmentsService.cancel(request.user.sub, id);
  }
}
