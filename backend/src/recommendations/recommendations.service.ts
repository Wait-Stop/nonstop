import type { Prisma } from '@prisma/client';
import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

export interface RecommendationCondition {
  age?: string | number;
  major?: string;
  job?: string;
  salary?: string | number;
  rent?: string | number;
  deposit?: string | number;
  transport?: string;
  preferredRegions?: string[];
  recommendRegion?: boolean;
  interestedCategories?: string[];
  startupInterest?: boolean;
}

interface AiRegion {
  region: string;
  match_score: number;
  region_type?: string;
  reasons?: string[];
  recommended_policy_names?: string[];
}

interface AiRecommendationResponse {
  detail?: unknown;
  regions?: AiRegion[];
}

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
      relatedPolicyIds: ['CB_HOUSING_001', 'CH_HOUSING_001', 'CH_STARTUP_001'],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1200',
      imageSource: 'https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg',
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
      relatedPolicyIds: ['OK_HOUSING_001', 'OK_HOUSING_002', 'CB_HOUSING_001'],
      image:
        'https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1200',
      imageSource: 'https://commons.wikimedia.org/wiki/File:옥천성당.jpg',
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
      relatedPolicyIds: ['GS_HOUSING_001', 'GS_STARTUP_001', 'CB_STARTUP_001'],
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

  private salaryToMonthlyNet(salaryValue: unknown) {
    const annual = this.toNumberRangeAverage(salaryValue, 3000);
    if (annual <= 100) return annual;
    return Math.round((annual / 12) * 0.85);
  }

  private parseAge(value: unknown) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return null;
    const match = value.match(/\d+/);
    return match ? Number(match[0]) : null;
  }

  private includesText(value: string | number | undefined, keyword: string) {
    return typeof value === 'string' && value.includes(keyword);
  }

  private toAiHousingType(condition: RecommendationCondition) {
    const value = `${condition.rent || ''} ${condition.deposit || ''}`;
    if (value.includes('전세')) return '전세';
    if (value.includes('자가') || value.includes('매매')) return '자가';
    if (condition.rent && !String(condition.rent).includes('정하지')) {
      return '월세';
    }
    return '기타';
  }

  private toAiEmploymentStatus(job = '') {
    if (['무직', '대학생'].some((keyword) => job.includes(keyword))) {
      return '미취업';
    }
    if (job.includes('창업')) return '창업준비중';
    if (job) return '재직중';
    return '기타';
  }

  private toAiTransportation(transport = '') {
    if (transport === '자가용') return '자가용';
    if (['버스', '기차', '도보', '자전거'].includes(transport)) {
      return '대중교통';
    }
    return '기타';
  }

  private toAiInterests(condition: RecommendationCondition) {
    const interests = new Set(['주거']);
    const job = condition.job || '';
    if (job && !['무직', '대학생'].includes(job)) interests.add('취업');
    if (job.includes('창업')) interests.add('창업');
    if (job.includes('농업')) interests.add('농촌');
    if (`${condition.rent || ''} ${condition.deposit || ''}`.includes('전세')) {
      interests.add('금융');
    }
    return [...interests];
  }

  private toAiRecommendationRequest(condition: RecommendationCondition) {
    return {
      age: this.parseAge(condition.age),
      preferred_region: condition.recommendRegion
        ? null
        : condition.preferredRegions?.[0] || null,
      housing_type: this.toAiHousingType(condition),
      monthly_income: this.salaryToMonthlyNet(condition.salary) * 10000,
      is_house_owner: condition.rent === '전세·매매 희망' ? null : false,
      employment_status: this.toAiEmploymentStatus(condition.job),
      startup_interest: condition.job?.includes('창업') || false,
      rural_interest: condition.job?.includes('농업') || false,
      newlywed: null,
      has_loan: null,
      needs_housing_loan: this.includesText(
        condition.deposit,
        '5,000만원 이상',
      ),
      transportation: this.toAiTransportation(condition.transport),
      interests: this.toAiInterests(condition),
    };
  }

  private async requestAiRecommendations(
    condition: RecommendationCondition,
  ): Promise<AiRecommendationResponse> {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      Number(process.env.AI_RECOMMENDATION_TIMEOUT_MS || 1200),
    );

    try {
      const configuredBaseUrl =
        process.env.AI_RECOMMENDATION_BASE_URL ||
        process.env.AI_API_BASE_URL ||
        'http://localhost:8001';
      const baseUrl = /^https?:\/\//.test(configuredBaseUrl)
        ? configuredBaseUrl
        : `http://${configuredBaseUrl}`;
      const response: Response = await fetch(`${baseUrl}/recommend`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(this.toAiRecommendationRequest(condition)),
        signal: controller.signal,
      });
      const data =
        (await response.json()) as unknown as AiRecommendationResponse;

      if (!response.ok) {
        throw new Error(
          data?.detail
            ? JSON.stringify(data.detail)
            : 'AI recommendation request failed',
        );
      }

      return data;
    } finally {
      clearTimeout(timeout);
    }
  }

  private aiRegionToRecommendation(
    item: AiRegion,
    condition: RecommendationCondition,
  ) {
    const region = this.regions.find(
      (candidate) =>
        candidate.area === item.region || candidate.id === item.region,
    );
    if (!region) return null;

    return {
      id: region.id,
      name: region.name,
      area: region.area,
      score: item.match_score,
      type: item.region_type || region.type,
      reasons: item.reasons?.length
        ? item.reasons
        : [
            `${condition.job || '입력 조건'} 기준으로 생활권을 비교했습니다.`,
            '추천 정책과 함께 검토할 수 있는 지역입니다.',
          ],
      rent: region.averageRent,
      commute: region.averageCommute,
      carNeed: region.carNeed,
      infrastructure: region.infrastructure,
      policyCount:
        item.recommended_policy_names?.length || region.relatedPolicyIds.length,
      image: region.image,
      imageSource: region.imageSource,
      source: 'ai',
    };
  }

  private scoreRegion(
    region: (typeof this.regions)[number],
    condition: RecommendationCondition,
  ) {
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

  private recommendByMvpRules(condition: RecommendationCondition) {
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

  async recommend(condition: RecommendationCondition) {
    try {
      const aiResult = await this.requestAiRecommendations(condition);
      const items = (aiResult.regions || [])
        .map((item) => this.aiRegionToRecommendation(item, condition))
        .filter(Boolean);

      return items.length ? items : this.recommendByMvpRules(condition);
    } catch (error) {
      console.warn(
        'AI recommendation service unavailable. Falling back to backend MVP rules.',
        error instanceof Error ? error.message : error,
      );
      return this.recommendByMvpRules(condition);
    }
  }

  async saveRecommendation(
    userId: string,
    condition: RecommendationCondition,
    results: any[],
  ) {
    return this.prisma.simulation.create({
      data: {
        user_id: userId,
        condition: condition as unknown as Prisma.InputJsonValue,
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

  async findOneRecommendation(recommendationId: string, userId: string) {
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
