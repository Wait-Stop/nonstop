import { Body, Controller, Post } from '@nestjs/common';
import { CommuteSimulationsService } from './commute-simulations.service';

@Controller('api/commute-simulations')
export class CommuteSimulationsController {
  constructor(
    private readonly commuteSimulationsService: CommuteSimulationsService,
  ) {}

  @Post()
  calculate(@Body() body: any) {
    return this.commuteSimulationsService.calculate(body);
  }
}