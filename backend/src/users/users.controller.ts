import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { UsersService } from './users.service';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UpdateUserDto } from './dto/update-user.dto';

@Controller('api/users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  findAll() {
    return this.usersService.findAll();
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  getMe(@Req() req: Request) {
    const user = req['user'] as { sub: string };

    return this.usersService.findMe(user.sub);
  }

  @Patch('me')
  @UseGuards(JwtAuthGuard)
  updateMe(@Req() req: Request, @Body() updateUserDto: UpdateUserDto) {
    const user = req['user'] as { sub: string };

    return this.usersService.updateMe(user.sub, updateUserDto);
  }

  @Get('me/saved-regions')
  @UseGuards(JwtAuthGuard)
  getSavedRegions(@Req() req: Request) {
    const user = req['user'] as { sub: string };

    return this.usersService.getSavedRegions(user.sub);
  }

  @Post('me/saved-regions')
  @UseGuards(JwtAuthGuard)
  saveRegion(@Req() req: Request, @Body('regionId') regionId: string) {
    const user = req['user'] as { sub: string };

    return this.usersService.saveRegion(user.sub, regionId);
  }

  @Delete('me/saved-regions/:regionId')
  @UseGuards(JwtAuthGuard)
  deleteSavedRegion(@Req() req: Request, @Param('regionId') regionId: string) {
    const user = req['user'] as { sub: string };

    return this.usersService.deleteSavedRegion(user.sub, regionId);
  }
  @Get('me/saved-policies')
  @UseGuards(JwtAuthGuard)
  getSavedPolicies(@Req() req: Request) {
    const user = req['user'] as { sub: string };

    return this.usersService.getSavedPolicies(user.sub);
  }

  @Post('me/saved-policies')
  @UseGuards(JwtAuthGuard)
  savePolicy(@Req() req: Request, @Body('policyId') policyId: string) {
    const user = req['user'] as { sub: string };

    return this.usersService.savePolicy(user.sub, policyId);
  }

  @Delete('me/saved-policies/:policyId')
  @UseGuards(JwtAuthGuard)
  deleteSavedPolicy(@Req() req: Request, @Param('policyId') policyId: string) {
    const user = req['user'] as { sub: string };

    return this.usersService.deleteSavedPolicy(user.sub, policyId);
  }
  @Patch('me/policy-checklists/:policyId')
  @UseGuards(JwtAuthGuard)
  savePolicyChecklist(
    @Req() req: Request,
    @Param('policyId') policyId: string,
    @Body('checkedItems') checkedItems: string[],
  ) {
    const user = req['user'] as { sub: string };

    return this.usersService.savePolicyChecklist(
      user.sub,
      policyId,
      checkedItems,
    );
  }
}
