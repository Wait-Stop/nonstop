import { Module } from '@nestjs/common';
import { CostSimulationsController } from './cost-simulations.controller';
import { CostSimulationsService } from './cost-simulations.service';

@Module({
  controllers: [CostSimulationsController],
  providers: [CostSimulationsService],
})
export class CostSimulationsModule {}