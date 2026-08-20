import { Controller, Get, Param } from '@nestjs/common';
import { RegionsService } from './regions.service';

@Controller('api/regions')
export class RegionsController {
  constructor(private readonly regionsService: RegionsService) {}

  @Get()
  findAll() {
    return this.regionsService.findAll();
  }

  @Get(':regionId')
  findOne(@Param('regionId') regionId: string) {
    return this.regionsService.findOne(regionId);
  }
}