
import {
  Body,
  Controller,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../auth/decorators/roles.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { AdminService } from './admin.service';
import { CreateDoctorAccountDto } from './dto/create-doctor-account.dto';
import { ReviewDoctorApplicationDto } from './dto/review-doctor-application.dto';
import { UpdateDoctorStatusDto } from './dto/update-doctor-status.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles('SUPER_ADMIN')
export class AdminController {
  constructor(private readonly adminService: AdminService) {}

  @Post('doctors')
  createDoctor(
    @Req() request: AuthenticatedRequest,
    @Body() dto: CreateDoctorAccountDto,
  ) {
    return this.adminService.createDoctorAccount(request.user.sub, dto);
  }

  @Get('doctors')
  listDoctors() {
    return this.adminService.listDoctors();
  }

  @Patch('doctors/:id/status')
  updateDoctorStatus(
    @Req() request: AuthenticatedRequest,
    @Param('id') doctorId: string,
    @Body() dto: UpdateDoctorStatusDto,
  ) {
    return this.adminService.updateDoctorStatus(
      doctorId,
      request.user.sub,
      dto,
    );
  }

  @Get('doctor-applications')
  listDoctorApplications(@Query('status') status?: string) {
    return this.adminService.listDoctorApplications(status);
  }

  @Patch('doctor-applications/:id/review')
  reviewDoctorApplication(
    @Req() request: AuthenticatedRequest,
    @Param('id') applicationId: string,
    @Body() dto: ReviewDoctorApplicationDto,
  ) {
    return this.adminService.reviewDoctorApplication(
      applicationId,
      request.user.sub,
      dto,
    );
  }
}
