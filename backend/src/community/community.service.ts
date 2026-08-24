import { ForbiddenException, Injectable, NotFoundException } from '@nestjs/common';
import type { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { CommunityQueryDto } from './dto/community-query.dto';
import { CreateCommunityCommentDto } from './dto/create-community-comment.dto';
import { CreateCommunityPostDto } from './dto/create-community-post.dto';

const CATEGORY_ALIASES: Record<string, string[]> = {
  전체글: [],
  '정착 후기': ['정착후기'],
  '지역 질문': ['질문'],
  '지역 정보': ['지역정보'],
  '정책 정보': ['정책정보'],
  '모임·동행': ['모임'],
  자유게시판: ['자유게시판', '일상'],
};

type CommunityPostWithCounts = Prisma.CommunityPostGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    _count: { select: { comments: true; reactions: true } };
  };
}>;

type CommunityPostDetail = Prisma.CommunityPostGetPayload<{
  include: {
    user: { select: { id: true; name: true } };
    comments: {
      include: { user: { select: { id: true; name: true } } };
      orderBy: { created_at: 'asc' };
    };
    _count: { select: { comments: true; reactions: true } };
  };
}>;

@Injectable()
export class CommunityService {
  constructor(private readonly prisma: PrismaService) {}

  async findPosts(query: CommunityQueryDto) {
    const page = this.toPositiveNumber(query.page, 1);
    const pageSize = Math.min(this.toPositiveNumber(query.pageSize, 10), 30);
    const where = this.buildWhere(query);
    const orderBy =
      query.tab === 'popular'
        ? [{ view_count: 'desc' as const }, { created_at: 'desc' as const }]
        : [{ created_at: 'desc' as const }];

    const [total, posts] = await this.prisma.$transaction([
      this.prisma.communityPost.count({ where }),
      this.prisma.communityPost.findMany({
        where,
        include: {
          user: { select: { id: true, name: true } },
          _count: { select: { comments: true, reactions: true } },
        },
        orderBy,
        skip: (page - 1) * pageSize,
        take: pageSize,
      }),
    ]);

    return {
      posts: posts.map((post) => this.toListItem(post)),
      meta: {
        page,
        pageSize,
        total,
        totalPages: Math.max(1, Math.ceil(total / pageSize)),
      },
    };
  }

  async findPost(postId: string) {
    await this.ensurePostExists(postId);

    const post = await this.prisma.communityPost.update({
      where: { id: postId },
      data: { view_count: { increment: 1 } },
      include: {
        user: { select: { id: true, name: true } },
        comments: {
          include: { user: { select: { id: true, name: true } } },
          orderBy: { created_at: 'asc' },
        },
        _count: { select: { comments: true, reactions: true } },
      },
    });

    return this.toDetail(post);
  }

  async createPost(userId: string, body: CreateCommunityPostDto) {
    const post = await this.prisma.communityPost.create({
      data: {
        user_id: userId,
        category: body.category.trim(),
        title: body.title.trim(),
        content: body.content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
        _count: { select: { comments: true, reactions: true } },
      },
    });

    return this.toListItem(post);
  }

  async createComment(
    userId: string,
    postId: string,
    body: CreateCommunityCommentDto,
  ) {
    await this.ensurePostExists(postId);

    const comment = await this.prisma.communityComment.create({
      data: {
        post_id: postId,
        user_id: userId,
        content: body.content.trim(),
      },
      include: {
        user: { select: { id: true, name: true } },
      },
    });

    return {
      id: comment.id,
      postId: comment.post_id,
      content: comment.content,
      author: {
        id: comment.user.id,
        name: comment.user.name || '이름 없는 사용자',
      },
      authorName: comment.user.name || '이름 없는 사용자',
      createdAt: comment.created_at,
      updatedAt: comment.updated_at,
    };
  }

  async toggleReaction(userId: string, postId: string) {
    await this.ensurePostExists(postId);

    const existing = await this.prisma.communityReaction.findUnique({
      where: {
        post_id_user_id: {
          post_id: postId,
          user_id: userId,
        },
      },
    });

    if (existing) {
      await this.prisma.communityReaction.delete({
        where: { id: existing.id },
      });
    } else {
      await this.prisma.communityReaction.create({
        data: {
          post_id: postId,
          user_id: userId,
        },
      });
    }

    const likeCount = await this.prisma.communityReaction.count({
      where: { post_id: postId },
    });

    return {
      postId,
      liked: !existing,
      likeCount,
    };
  }

  async deletePost(userId: string, postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true, user_id: true },
    });
    if (!post) throw new NotFoundException('게시글을 찾을 수 없습니다.');
    if (post.user_id !== userId) throw new ForbiddenException('본인이 작성한 게시글만 삭제할 수 있습니다.');
    await this.prisma.communityPost.delete({ where: { id: postId } });
    return { deleted: true, postId };
  }

  async deleteComment(userId: string, postId: string, commentId: string) {
    const comment = await this.prisma.communityComment.findFirst({
      where: { id: commentId, post_id: postId },
      select: { id: true, user_id: true },
    });
    if (!comment) throw new NotFoundException('댓글을 찾을 수 없습니다.');
    if (comment.user_id !== userId) throw new ForbiddenException('본인이 작성한 댓글만 삭제할 수 있습니다.');
    await this.prisma.communityComment.delete({ where: { id: commentId } });
    return { deleted: true, commentId };
  }

  private async ensurePostExists(postId: string) {
    const post = await this.prisma.communityPost.findUnique({
      where: { id: postId },
      select: { id: true },
    });

    if (!post) {
      throw new NotFoundException('게시글을 찾을 수 없습니다.');
    }
  }

  private buildWhere(query: CommunityQueryDto): Prisma.CommunityPostWhereInput {
    const where: Prisma.CommunityPostWhereInput = {};
    const category = query.category?.trim();
    const categories = category ? CATEGORY_ALIASES[category] || [category] : [];

    if (category && category !== '전체글' && categories.length > 0) {
      where.category = { in: categories };
    }

    const keyword = query.q?.trim();
    if (keyword) {
      where.OR = [
        { title: { contains: keyword, mode: 'insensitive' } },
        { content: { contains: keyword, mode: 'insensitive' } },
        { user: { name: { contains: keyword, mode: 'insensitive' } } },
      ];
    }

    return where;
  }

  private toPositiveNumber(value: string | undefined, fallback: number) {
    const number = Number(value);
    return Number.isInteger(number) && number > 0 ? number : fallback;
  }

  private toListItem(post: CommunityPostWithCounts) {
    return {
      id: post.id,
      category: post.category,
      title: post.title,
      excerpt:
        post.content.length > 120
          ? `${post.content.slice(0, 120).trim()}...`
          : post.content,
      author: {
        id: post.user.id,
        name: post.user.name || '이름 없는 사용자',
      },
      authorName: post.user.name || '이름 없는 사용자',
      viewCount: post.view_count,
      commentCount: post._count.comments,
      likeCount: post._count.reactions,
      createdAt: post.created_at,
      updatedAt: post.updated_at,
    };
  }

  private toDetail(post: CommunityPostDetail) {
    return {
      ...this.toListItem(post),
      content: post.content,
      comments: post.comments.map((comment) => ({
        id: comment.id,
        postId: comment.post_id,
        content: comment.content,
        author: {
          id: comment.user.id,
          name: comment.user.name || '이름 없는 사용자',
        },
        authorName: comment.user.name || '이름 없는 사용자',
        createdAt: comment.created_at,
        updatedAt: comment.updated_at,
      })),
    };
  }
}
