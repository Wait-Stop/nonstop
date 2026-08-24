import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class RecommendationsService {
    constructor(private readonly prisma: PrismaService) {}

    private readonly regions = [
    {
      id: 'cheongju',
      name: '청주시 오창읍',
      area: '청주시',
      type: '산업단지 직장인형',
      description:
        '오창·오송 산업단지를 중심으로 IT, 반도체, 바이오 일자리 접근성이 높은 생활권입니다.',
      scoreBase: 88,
      averageRent: 58,
      averageCommute: 28,
      carNeed: '있으면 편리',
      infrastructure: [
        '오창과학산업단지',
        '청주공항',
        '충북대병원',
        '대형마트',
      ],
      jobKeywords: ['IT·개발', '제조·생산', '사무·행정', '바이오', '반도체'],
      relatedPolicyIds: ['CB_HOUSING_001', 'CB_JOB_001', 'CJ_JOB_001'],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Sangdangsangseong.jpg?width=1200',
      imageSource:
        'https://commons.wikimedia.org/wiki/File:Cheongju_Sangdangsangseong.jpg',
    },
    {
      id: 'chungju',
      name: '충주시 연수동',
      area: '충주시',
      type: '중심 생활권형',
      description:
        '주거비와 생활 인프라 균형이 좋고, 충주기업도시와 중심 상권을 함께 비교하기 좋은 지역입니다.',
      scoreBase: 84,
      averageRent: 45,
      averageCommute: 22,
      carNeed: '선택',
      infrastructure: ['충주역', '충주기업도시', '건국대병원', '대형마트'],
      jobKeywords: ['제조·생산', '사무·행정', '서비스', '창업'],
      relatedPolicyIds: [
        'CB_HOUSING_001',
        'CH_HOUSING_001',
        'CH_STARTUP_001',
      ],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1200',
      imageSource:
        'https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg',
    },
    {
      id: 'jincheon',
      name: '진천·음성 충북혁신도시',
      area: '진천군',
      type: '혁신도시 일자리형',
      description:
        '공공기관, 산업단지, 충북혁신도시 생활권을 중심으로 일자리 접근성이 좋은 지역입니다.',
      scoreBase: 86,
      averageRent: 52,
      averageCommute: 24,
      carNeed: '권장',
      infrastructure: [
        '충북혁신도시',
        '진천산업단지',
        '공공도서관',
        '종합병원',
      ],
      jobKeywords: ['제조·생산', '공공기관', '사무·행정', '서비스'],
      relatedPolicyIds: ['CB_JOB_001', 'CB_JOB_002', 'CB_HOUSING_001'],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon_Nongdari_Bridge_20200716_160025.jpg?width=1200',
      imageSource:
        'https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg',
    },
    {
      id: 'okcheon',
      name: '옥천군 옥천읍',
      area: '옥천군',
      type: '전입 청년 정착형',
      description:
        '전입 청년, 월세, 전세대출 이자지원 등 정착형 정책과 연결하기 좋은 남부권 생활 지역입니다.',
      scoreBase: 78,
      averageRent: 38,
      averageCommute: 30,
      carNeed: '권장',
      infrastructure: ['옥천역', '대청호 생활권', '옥천군청', '전통시장'],
      jobKeywords: ['서비스', '농업', '사무·행정', '로컬창업'],
      relatedPolicyIds: [
        'OK_HOUSING_001',
        'OK_HOUSING_002',
        'CB_HOUSING_001',
      ],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1200',
      imageSource:
        'https://commons.wikimedia.org/wiki/File:옥천성당.jpg',
    },
    {
      id: 'goesan',
      name: '괴산군 괴산읍',
      area: '괴산군',
      type: '농촌 정착·로컬창업형',
      description:
        '청년 농촌보금자리, 로컬 창업, 커뮤니티 정책과 연결하기 좋은 농촌 정착 후보지입니다.',
      scoreBase: 76,
      averageRent: 32,
      averageCommute: 35,
      carNeed: '필요',
      infrastructure: [
        '괴산읍 생활권',
        '청년 농촌보금자리',
        '산막이옛길',
        '로컬 커뮤니티',
      ],
      jobKeywords: ['농업', '로컬창업', '서비스', '관광'],
      relatedPolicyIds: [
        'GS_HOUSING_001',
        'GS_STARTUP_001',
        'CB_STARTUP_001',
      ],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Oeryong-ri,_Buljeong-myeon,_Goesan-gun,_Chungcheongbuk-do,_South_Korea_-_panoramio.jpg?width=1200',
      imageSource: 'https://commons.wikimedia.org/wiki/Category:Goesan',
    },
  ];

  private toNumberRangeAverage(value: unknown, fallback: number) {
    if (typeof value === 'number') return value;
    if (!value || typeof value !== 'string') return fallback;

    const matches = [...value.matchAll(/\d[\d,]*/g)].map((match) =>
      Number(match[0].replaceAll(',', '')),
    );

    if (!matches.length) return fallback;
    if (matches.length === 1) return matches[0];

    return Math.round((matches[0] + matches[1]) / 2);
  }

  private scoreRegion(region: (typeof this.regions)[number], condition: any) {
    let score = region.scoreBase;

    const job = condition.job || '';
    const preferredRegions = condition.preferredRegions || [];

    const rentBudget = this.toNumberRangeAverage(
      condition.rent,
      region.averageRent,
    );

    if (
      region.jobKeywords.some(
        (keyword) => job.includes(keyword) || keyword.includes(job),
      )
    ) {
      score += 8;
    }

    if (preferredRegions.includes(region.area)) {
      score += 10;
    }

    if (condition.recommendRegion === true) {
      score += 2;
    }

    if (rentBudget >= region.averageRent) {
      score += 6;
    }

    if (
      condition.transport &&
      condition.transport !== '자가용' &&
      ['권장', '필요'].includes(region.carNeed)
    ) {
      score -= 8;
    }

    if (
      condition.transport === '자가용' &&
      ['권장', '필요', '있으면 편리'].includes(region.carNeed)
    ) {
      score += 3;
    }

    return Math.max(0, Math.min(100, score));
  }

  recommend(condition: Record<string, any>) {
    const candidates = condition.recommendRegion
      ? this.regions
      : this.regions.filter((region) =>
          (condition.preferredRegions || []).includes(region.area),
        );

    const source = candidates.length ? candidates : this.regions;

    return source
      .map((region) => {
        const score = this.scoreRegion(region, condition);
        const policyCount = region.relatedPolicyIds.length;

        return {
          id: region.id,
          name: region.name,
          area: region.area,
          score,
          type: region.type,
          reasons: [
            `${condition.job || '희망 직무'} 조건과 연결되는 지역 키워드가 있습니다.`,
            `예상 월세는 약 ${region.averageRent}만원입니다.`,
            `확인 가능한 정책 후보가 ${policyCount}개 있습니다.`,
          ],
          rent: region.averageRent,
          commute: region.averageCommute,
          carNeed: region.carNeed,
          infrastructure: region.infrastructure,
          policyCount,
          image: region.image,
          imageSource: region.imageSource,
        };
      })
      .sort((a, b) => b.score - a.score)
      .slice(0, 3);
  }

    async saveRecommendation(
    userId: string,
    condition: Record<string, any>,
    results: any[],
  ) {
    return this.prisma.simulation.create({
      data: {
        user_id: userId,
        condition,
        results,
      },
    });
  }

  async findMyRecommendations(userId: string) {
    return this.prisma.simulation.findMany({
      where: {
        user_id: userId,
      },
      orderBy: {
        created_at: 'desc',
      },
    });
  }

  async findOneRecommendation(
    recommendationId: string,
    userId: string,
  ) {
    const recommendation = await this.prisma.simulation.findFirst({
      where: {
        id: recommendationId,
        user_id: userId,
      },
    });

    if (!recommendation) {
      throw new NotFoundException('추천 이력을 찾을 수 없습니다.');
    }

    return recommendation;
  }
}