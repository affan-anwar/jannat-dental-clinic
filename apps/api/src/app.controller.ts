import { Controller, Get } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  getApiStatus() {
    return {
      success: true,
      message: 'Jannat Dental Clinic API is running',
      version: '1.0.0',
    };
  }
}
