import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { CommunityQueryDto } from './dto/community-query.dto';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';
import { CommunityService } from './community.service';

@Controller('api/community')
export class CommunityController {
  constructor(private readonly communityService: CommunityService) {}

  @Get('posts')
  findPosts(@Query() query: CommunityQueryDto) {
    return this.communityService.findPosts(query);
  }

  @Get('posts/:postId')
  findPost(@Param('postId') postId: string) {
    return this.communityService.findPost(postId);
  }

  @Post('posts')
  @UseGuards(JwtAuthGuard)
  createPost(@Req() req: Request, @Body() body: CreateCommunityPostDto) {
    const user = req['user'] as { sub: string };

    return this.communityService.createPost(user.sub, body);
  }

  @Post('posts/:postId/comments')
  @UseGuards(JwtAuthGuard)
  createComment(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Body() body: CreateCommunityCommentDto,
  ) {
    const user = req['user'] as { sub: string };

    return this.communityService.createComment(user.sub, postId, body);
  }

  @Post('posts/:postId/reactions')
  @UseGuards(JwtAuthGuard)
  toggleReaction(@Req() req: Request, @Param('postId') postId: string) {
    const user = req['user'] as { sub: string };

    return this.communityService.toggleReaction(user.sub, postId);
  }

  @Delete('posts/:postId')
  @UseGuards(JwtAuthGuard)
  deletePost(@Req() req: Request, @Param('postId') postId: string) {
    const user = req['user'] as { sub: string };
    return this.communityService.deletePost(user.sub, postId);
  }

  @Delete('posts/:postId/comments/:commentId')
  @UseGuards(JwtAuthGuard)
  deleteComment(
    @Req() req: Request,
    @Param('postId') postId: string,
    @Param('commentId') commentId: string,
  ) {
    const user = req['user'] as { sub: string };
    return this.communityService.deleteComment(user.sub, postId, commentId);
  }
}
