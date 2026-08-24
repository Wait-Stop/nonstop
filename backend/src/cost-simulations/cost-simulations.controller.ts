import { Body, Controller, Get, Post, Query } from '@nestjs/common';
import type { CostSimulationRequest } from './cost-simulations.service';
import { CostSimulationsService } from './cost-simulations.service';

@Controller('api/cost-simulations')
export class CostSimulationsController {
  constructor(
    private readonly costSimulationsService: CostSimulationsService,
  ) {}

  @Post()
  async calculate(@Body() body: CostSimulationRequest) {
    return this.costSimulationsService.calculate(body);
  }

  @Get('apt-trades')
  async getApartmentTrades(
    @Query('regionId') regionId = 'cheongju',
    @Query('dealMonth') dealMonth?: string,
  ) {
    return this.costSimulationsService.getApartmentTrades(regionId, dealMonth);
  }
}
