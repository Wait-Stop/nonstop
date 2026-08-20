import { Body, Controller, Post } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';

@Controller('api/ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  chat(@Body() body: any) {
    return this.aiChatService.chat(body);
  }
}