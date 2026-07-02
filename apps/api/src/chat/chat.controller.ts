import { Body, Controller, Post, Req, UseGuards } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import type { JwtPayload } from '../auth/types/jwt-payload.type';
import { ChatService } from './chat.service';
import { ChatDto } from './dto/chat.dto';

interface AuthenticatedRequest extends Request {
  user: JwtPayload;
}

@Controller('chat')
@UseGuards(JwtAuthGuard)
export class ChatController {
  constructor(private readonly chatService: ChatService) {}

  @Post()
  @Throttle({ default: { limit: 20, ttl: 60_000 } })
  answer(@Req() request: AuthenticatedRequest, @Body() dto: ChatDto) {
    return this.chatService.answer(request.user.sub, dto);
  }
}
