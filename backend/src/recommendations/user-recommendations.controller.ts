import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RecommendationsService } from './recommendations.service';

interface JwtPayload {
  sub: string;
  email: string;
}

@Controller('api/users/me/recommendations')
@UseGuards(JwtAuthGuard)
export class UserRecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Get()
  async findMine(@Req() request: Request) {
    const user = request['user'] as JwtPayload;

    return this.recommendationsService.findMyRecommendations(user.sub);
  }
}
