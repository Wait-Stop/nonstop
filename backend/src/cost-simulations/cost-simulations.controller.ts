import { Body, Controller, Post } from '@nestjs/common';
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
}
