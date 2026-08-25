import { Body, Controller, Post } from '@nestjs/common';
import { AiChatService } from './ai-chat.service';
import type { AiChatRequest } from './ai-chat.service';

@Controller('api/ai')
export class AiChatController {
  constructor(private readonly aiChatService: AiChatService) {}

  @Post('chat')
  async chat(@Body() body: AiChatRequest) {
    return this.aiChatService.chat(body);
  }
}
