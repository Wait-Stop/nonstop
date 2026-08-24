import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Param,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { RecommendationsService } from './recommendations.service';
import type { RecommendationCondition } from './recommendations.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';

interface JwtPayload {
  sub: string;
  email: string;
}

interface RecommendationRequest {
  persist?: boolean;
  condition?: RecommendationCondition;
}

type AuthenticatedRequest = Request & { user?: JwtPayload };

@Controller('api/recommendations')
export class RecommendationsController {
  constructor(
    private readonly recommendationsService: RecommendationsService,
  ) {}

  @Post()
  async recommend(
    @Body() body: RecommendationRequest,
    @Req() request: AuthenticatedRequest,
  ) {
    if (!body.condition) {
      throw new BadRequestException('추천 조건이 올바르지 않습니다.');
    }

    const results = await this.recommendationsService.recommend(body.condition);

    if (body.persist === true && request.user) {
      const user = request.user;

      const saved = await this.recommendationsService.saveRecommendation(
        user.sub,
        body.condition,
        results,
      );

      return {
        recommendationId: saved.id,
        results,
      };
    }

    return {
      results,
    };
  }
  @Get(':recommendationId')
  @UseGuards(JwtAuthGuard)
  async findOne(
    @Param('recommendationId') recommendationId: string,
    @Req() request: AuthenticatedRequest,
  ) {
    const user = request.user as JwtPayload;

    return this.recommendationsService.findOneRecommendation(
      recommendationId,
      user.sub,
    );
  }
}
