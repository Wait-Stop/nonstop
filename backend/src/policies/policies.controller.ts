import { Body, Controller, Get, Param, Post } from '@nestjs/common';
import { PoliciesService } from './policies.service';

@Controller('api/policies')
export class PoliciesController {
  constructor(private readonly policiesService: PoliciesService) {}

  @Get()
  findAll() {
    return this.policiesService.findAll();
  }

  @Get(':policyId/checklist')
  getChecklist(@Param('policyId') policyId: string) {
    return this.policiesService.getChecklist(policyId);
  }

  @Get(':policyId')
  findOne(@Param('policyId') policyId: string) {
    return this.policiesService.findOne(policyId);
  }

  @Post('recommendations')
  recommend(@Body('condition') condition: Record<string, any>) {
    return {
      recommendedPolicies: this.policiesService.recommend(condition),
    };
  }
}