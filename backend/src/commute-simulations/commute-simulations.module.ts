import { Module } from '@nestjs/common';
import { CommuteSimulationsController } from './commute-simulations.controller';
import { CommuteSimulationsService } from './commute-simulations.service';

@Module({
  controllers: [CommuteSimulationsController],
  providers: [CommuteSimulationsService],
})
export class CommuteSimulationsModule {}
