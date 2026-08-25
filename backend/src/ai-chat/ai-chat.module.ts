import { Module } from '@nestjs/common';
import { AiChatController } from './ai-chat.controller';
import { AiChatService } from './ai-chat.service';
import { RegionsModule } from '../regions/regions.module';

@Module({
  imports: [RegionsModule],
  controllers: [AiChatController],
  providers: [AiChatService],
})
export class AiChatModule {}
