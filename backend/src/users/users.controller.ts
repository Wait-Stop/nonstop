import {
  Body,
  Controller,
  Get,
  Patch,
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
    updateMe(
        @Req() req: Request,
        @Body() updateUserDto: UpdateUserDto,
    ) {
        const user = req['user'] as { sub: string };

        return this.usersService.updateMe(
            user.sub,
            updateUserDto.name,
        );
    }
}