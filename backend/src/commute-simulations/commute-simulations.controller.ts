import { Body, Controller, Post } from '@nestjs/common';
import type { CommuteSimulationRequest } from './commute-simulations.service';
import { CommuteSimulationsService } from './commute-simulations.service';

@Controller('api/commute-simulations')
export class CommuteSimulationsController {
  constructor(
    private readonly commuteSimulationsService: CommuteSimulationsService,
  ) {}

  @Post()
  calculate(@Body() body: CommuteSimulationRequest) {
    return this.commuteSimulationsService.calculate(body);
  }
}
