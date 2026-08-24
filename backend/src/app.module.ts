import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { PrismaModule } from './prisma/prisma.module';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { RegionsModule } from './regions/regions.module';
import { PoliciesModule } from './policies/policies.module';
import { RecommendationsModule } from './recommendations/recommendations.module';
import { CostSimulationsModule } from './cost-simulations/cost-simulations.module';
import { CommuteSimulationsModule } from './commute-simulations/commute-simulations.module';
import { AiChatModule } from './ai-chat/ai-chat.module';

@Module({
  imports: [
    PrismaModule,
    UsersModule,
    AuthModule,
    RegionsModule,
    PoliciesModule,
    RecommendationsModule,
    CostSimulationsModule,
    CommuteSimulationsModule,
    AiChatModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
