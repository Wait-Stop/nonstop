import { Injectable, NotFoundException } from '@nestjs/common';
import { policies } from './policies.data';

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

recommend(condition: Record<string, any> = {}) {
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
}