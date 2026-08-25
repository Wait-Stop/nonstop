import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { RecommendationsController } from './recommendations.controller';
import { RecommendationsService } from './recommendations.service';
import { PrismaModule } from '../prisma/prisma.module';
import { UserRecommendationsController } from './user-recommendations.controller';

@Module({
  imports: [
    PrismaModule,
    JwtModule.register({
      secret: process.env.JWT_SECRET,
      signOptions: {
        expiresIn: '7d',
      },
    }),
  ],
  controllers: [RecommendationsController, UserRecommendationsController],
  providers: [RecommendationsService],
})
export class RecommendationsModule {}
