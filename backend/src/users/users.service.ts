import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    return this.prisma.user.findMany();
  }

  async findMe(userId: string) {
    return this.prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async updateMe(userId: string, name: string) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name,
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });
  }

  async saveRegion(userId: string, regionCode: string) {
    const region = await this.prisma.region.findUnique({
      where: {
        code: regionCode,
      },
    });

    if (!region) {
      throw new NotFoundException('해당 지역을 찾을 수 없습니다.');
    }

    return this.prisma.savedRegion.upsert({
      where: {
        user_id_region_id: {
          user_id: userId,
          region_id: region.id,
        },
      },
      update: {},
      create: {
        user_id: userId,
        region_id: region.id,
      },
      include: {
        region: true,
      },
    });
  }

  async getSavedRegions(userId: string) {
    return this.prisma.savedRegion.findMany({
      where: {
        user_id: userId,
      },
      include: {
        region: true,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async deleteSavedRegion(userId: string, regionCode: string) {
    const region = await this.prisma.region.findUnique({
      where: {
        code: regionCode,
      },
    });

    if (!region) {
      throw new NotFoundException('해당 지역을 찾을 수 없습니다.');
    }

    await this.prisma.savedRegion.deleteMany({
      where: {
        user_id: userId,
        region_id: region.id,
      },
    });

    return {
      message: '저장한 지역에서 삭제되었습니다.',
    };
  }
  async savePolicy(userId: string, policyCode: string) {
  const policy = await this.prisma.policy.findUnique({
    where: {
      code: policyCode,
    },
  });

  if (!policy) {
    throw new NotFoundException('해당 정책을 찾을 수 없습니다.');
  }

  return this.prisma.savedPolicy.upsert({
    where: {
      user_id_policy_id: {
        user_id: userId,
        policy_id: policy.id,
      },
    },
    update: {},
    create: {
      user_id: userId,
      policy_id: policy.id,
    },
    include: {
      policy: true,
    },
  });
}

async getSavedPolicies(userId: string) {
  return this.prisma.savedPolicy.findMany({
    where: {
      user_id: userId,
    },
    include: {
      policy: true,
    },
    orderBy: {
      created_at: 'desc',
    },
  });
}

async deleteSavedPolicy(userId: string, policyCode: string) {
  const policy = await this.prisma.policy.findUnique({
    where: {
      code: policyCode,
    },
  });

  if (!policy) {
    throw new NotFoundException('해당 정책을 찾을 수 없습니다.');
  }

  await this.prisma.savedPolicy.deleteMany({
    where: {
      user_id: userId,
      policy_id: policy.id,
    },
  });

  return {
    message: '저장한 정책에서 삭제되었습니다.',
  };
}
}