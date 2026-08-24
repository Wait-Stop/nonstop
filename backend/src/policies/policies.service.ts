import { Injectable, NotFoundException } from '@nestjs/common';
import type { RecommendationCondition } from '../recommendations/recommendations.service';
import { policies } from './policies.data';

interface AiPolicy {
  policy_id: string;
  policy_name?: string;
  category?: string;
  region?: string;
  match_score: number;
  match_level: '높음' | '중간' | '낮음';
  reason?: string;
  matched_factors?: string[];
  missing_info?: string[];
  support_summary?: string;
  caution?: string;
}

interface AiRecommendationResponse {
  detail?: unknown;
  policies?: AiPolicy[];
}

@Injectable()
export class PoliciesService {
  findAll() {
    return {
      policies: policies.map((policy) => ({
        id: policy.id,
        title: policy.title,
        category: policy.category,
        region: policy.region,
        benefit: policy.benefit,
        period: policy.period,
        eligibility: policy.eligibility,
        summary: policy.summary,
        sourceName: policy.sourceName,
        sourceUrl: policy.sourceUrl,
        lastChecked: policy.lastChecked,
        status: policy.status,
      })),
    };
  }

  findOne(policyId: string) {
    const policy = policies.find((item) => item.id === policyId);

    if (!policy) {
      throw new NotFoundException('해당 정책 정보를 찾을 수 없습니다.');
    }

    return policy;
  }

  private policyListItem(policy: (typeof policies)[number]) {
    return {
      id: policy.id,
      title: policy.title,
      category: policy.category,
      region: policy.region,
      benefit: policy.benefit,
      period: policy.period,
      eligibility: policy.eligibility,
      summary: policy.summary,
      status: policy.status,
      lastChecked: policy.lastChecked,
    };
  }

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

  private aiPolicyToRecommendation(item: AiPolicy) {
    const policy = policies.find(
      (candidate) => candidate.id === item.policy_id,
    );
    const base = policy
      ? this.policyListItem(policy)
      : {
          id: item.policy_id,
          title: item.policy_name || '정책명 확인 필요',
          category: item.category || '분류 확인 필요',
          region: item.region || '지역 확인 필요',
          benefit: item.support_summary || '지원 내용 확인 필요',
          period: '공고 확인 필요',
          eligibility: '세부 조건 확인 필요',
          summary: item.reason || '추천 사유 확인 필요',
          status: '확인 필요',
          lastChecked: null,
        };

    return {
      ...base,
      matchScore: item.match_score,
      matchLevel:
        item.match_level === '높음'
          ? '가능성 높음'
          : item.match_level === '중간'
            ? '추가 확인 필요'
            : '가능성 낮음',
      matchedConditions: item.matched_factors || [],
      missingFields: item.missing_info || [],
      recommendReason: item.reason || '입력 조건 기준으로 관련성이 있습니다.',
      caution: item.caution || '원문 공고 확인이 필요합니다.',
      source: 'ai',
    };
  }

  private recommendByMvpRules(condition: RecommendationCondition = {}) {
    return policies
      .map((policy) => {
        let score = 40;
        const matched: string[] = [];

        if (condition.age) {
          score += 15;
          matched.push('청년 연령대 입력');
        }

        if (
          (condition.preferredRegions || []).includes(policy.region) ||
          policy.region === '충북 전역'
        ) {
          score += 20;
          matched.push('희망 지역과 정책 지역 연결');
        }

        if (condition.rent && policy.category.includes('주거')) {
          score += 15;
          matched.push('월세/주거 조건 입력');
        }

        if (condition.job && policy.category.includes('일자리')) {
          score += 15;
          matched.push('직무/취업 조건 입력');
        }

        if (
          (condition.interestedCategories || []).some((item: string) =>
            policy.category.includes(item),
          )
        ) {
          score += 10;
          matched.push('관심 정책 분야 일치');
        }

        if (condition.startupInterest && policy.category.includes('창업')) {
          score += 15;
          matched.push('창업 관심 조건 입력');
        }

        const matchScore = Math.min(100, score);

        const matchLevel =
          matchScore >= 80
            ? '가능성 높음'
            : matchScore >= 60
              ? '추가 확인 필요'
              : '가능성 낮음';

        return {
          ...this.policyListItem(policy),
          matchScore,
          matchLevel,
          matchedConditions: matched,
          missingFields: policy.requiredInputs.filter(
            (field) => !JSON.stringify(condition).includes(field),
          ),
          recommendReason: `${policy.title}은 입력한 조건 기준으로 ${matchLevel} 정책입니다.`,
          caution:
            '정확한 신청 가능 여부는 신청 시점의 원문 공고와 담당 기관 확인이 필요합니다.',
        };
      })
      .filter((item) => item.matchScore >= 55)
      .sort((a, b) => b.matchScore - a.matchScore)
      .slice(0, 5);
  }

  async recommend(condition: RecommendationCondition = {}) {
    try {
      const aiResult = await this.requestAiRecommendations(condition);
      const items = (aiResult.policies || []).map((item) =>
        this.aiPolicyToRecommendation(item),
      );

      return items.length ? items : this.recommendByMvpRules(condition);
    } catch (error) {
      console.warn(
        'AI policy recommendation service unavailable. Falling back to backend MVP rules.',
        error instanceof Error ? error.message : error,
      );
      return this.recommendByMvpRules(condition);
    }
  }

  getChecklist(policyId: string) {
    const policy = policies.find((item) => item.id === policyId);

    if (!policy) {
      throw new NotFoundException('해당 정책 정보를 찾을 수 없습니다.');
    }

    const base = [
      {
        id: 'item_age',
        section: '자격 조건',
        label: '정책 대상 연령에 해당하는지 확인',
        description: policy.eligibility,
        required: true,
        defaultChecked: false,
      },
      {
        id: 'item_region',
        section: '자격 조건',
        label: `${policy.region} 거주 또는 전입 조건 확인`,
        description: '신청 기준일의 주민등록상 거주지 조건을 확인해야 합니다.',
        required: true,
        defaultChecked: false,
      },
    ];

    const documents = policy.requiredDocuments.map((doc, index) => ({
      id: `doc_${index + 1}`,
      section: '필요 서류',
      label: `${doc} 준비`,
      description: '원문 공고 기준으로 최신 양식과 발급일 조건을 확인하세요.',
      required: true,
      defaultChecked: false,
    }));

    return {
      policyId: policy.id,
      policyTitle: policy.title,
      checklist: [...base, ...documents],
      caution:
        '정확한 신청 가능 여부와 제출 서류는 신청 시점의 원문 공고와 담당 기관을 반드시 확인해 주세요.',
      sourceUrl: policy.sourceUrl,
      lastChecked: policy.lastChecked,
    };
  }
}
