
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
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { CreateDoctorApplicationDto } from './dto/create-doctor-application.dto';
import { UpdateDoctorProfileDto } from './dto/update-doctor-profile.dto';
import { DoctorsService } from './doctors.service';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('doctors')
export class DoctorsController {
  constructor(private readonly doctorsService: DoctorsService) {}

  @Get()
  findPublic() {
    return this.doctorsService.findPublic();
  }

  @Post('application')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT', 'DOCTOR_ADMIN', 'DOCTOR')
  submitApplication(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateDoctorApplicationDto,
  ) {
    return this.doctorsService.submitApplication(request.user.sub, dto);
  }

  @Get('application/me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('PATIENT', 'DOCTOR_ADMIN', 'DOCTOR')
  findMyApplication(@Req() request: AuthenticatedRequest) {
    return this.doctorsService.findMyApplication(request.user.sub);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR_ADMIN', 'DOCTOR')
  findMine(@Req() request: AuthenticatedRequest) {
    return this.doctorsService.findMine(request.user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('DOCTOR_ADMIN', 'DOCTOR')
  updateMine(
    @Req() request: AuthenticatedRequest,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateMine(request.user.sub, dto);
  }

  @Get(':id')
  findPublicById(@Param('id') id: string) {
    return this.doctorsService.findPublicById(id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles('SUPER_ADMIN')
  updateByAdmin(
    @Param('id') id: string,
    @Body() dto: UpdateDoctorProfileDto,
  ) {
    return this.doctorsService.updateByAdmin(id, dto);
  }
}
