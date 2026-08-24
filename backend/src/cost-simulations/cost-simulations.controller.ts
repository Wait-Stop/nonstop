import { Body, Controller, Post } from '@nestjs/common';
import { CostSimulationsService } from './cost-simulations.service';

@Controller('api/cost-simulations')
export class CostSimulationsController {
  constructor(
    private readonly costSimulationsService: CostSimulationsService,
  ) {}

  @Post()
  calculate(@Body() body: any) {
    return this.costSimulationsService.calculate(body);
  }
}