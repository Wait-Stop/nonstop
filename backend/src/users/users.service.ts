import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateUserDto } from './dto/update-user.dto';

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
        age: true,
        gender: true,
        current_region: true,
        major: true,
        job: true,
        salary: true,
        rent: true,
        deposit: true,
        transport: true,
        preferred_regions: true,
        recommend_region: true,
      },
    });
  }

  async updateMe(userId: string, updateUserDto: UpdateUserDto) {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        name: updateUserDto.name,
        age: updateUserDto.age,
        gender: updateUserDto.gender,
        current_region: updateUserDto.currentRegion,
        major: updateUserDto.major,
        job: updateUserDto.job,
        salary: updateUserDto.salary,
        rent: updateUserDto.rent,
        deposit: updateUserDto.deposit,
        transport: updateUserDto.transport,
        preferred_regions: updateUserDto.preferredRegions,
        recommend_region: updateUserDto.recommendRegion,
      },
      select: {
        id: true,
        email: true,
        name: true,
        age: true,
        gender: true,
        current_region: true,
        major: true,
        job: true,
        salary: true,
        rent: true,
        deposit: true,
        transport: true,
        preferred_regions: true,
        recommend_region: true,
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
  async savePolicyChecklist(
    userId: string,
    policyCode: string,
    checkedItems: string[],
  ) {
    const policy = await this.prisma.policy.findUnique({
      where: {
        code: policyCode,
      },
    });

    if (!policy) {
      throw new NotFoundException('해당 정책을 찾을 수 없습니다.');
    }

    return this.prisma.policyChecklist.upsert({
      where: {
        user_id_policy_id: {
          user_id: userId,
          policy_id: policy.id,
        },
      },
      update: {
        checked_items: checkedItems,
      },
      create: {
        user_id: userId,
        policy_id: policy.id,
        checked_items: checkedItems,
      },
    });
  }
}
