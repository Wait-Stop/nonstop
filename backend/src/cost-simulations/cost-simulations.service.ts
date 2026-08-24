import { Injectable, NotFoundException } from '@nestjs/common';

export interface CostSimulationRequest {
  userId?: string | null;
  regionId?: string;
  income?: {
    monthlyIncome?: number;
    salary?: string | number;
  };
  housing?: {
    rent?: string | number;
    deposit?: string | number;
    maintenanceFee?: number;
  };
  transport?: {
    type?: string;
  };
  policy?: {
    includeSupport?: boolean;
    monthlySupportAmount?: string | number;
  };
}

@Injectable()
export class CostSimulationsService {
  private readonly regions = [
    {
      id: 'cheongju',
      name: '청주시 오창읍',
      averageRent: 58,
      averageMaintenanceFee: 8,
      carNeed: '있으면 편리',
    },
    {
      id: 'chungju',
      name: '충주시 연수동',
      averageRent: 45,
      averageMaintenanceFee: 7,
      carNeed: '선택',
    },
    {
      id: 'jincheon',
      name: '진천·음성 충북혁신도시',
      averageRent: 52,
      averageMaintenanceFee: 8,
      carNeed: '권장',
    },
    {
      id: 'okcheon',
      name: '옥천군 옥천읍',
      averageRent: 38,
      averageMaintenanceFee: 6,
      carNeed: '권장',
    },
    {
      id: 'goesan',
      name: '괴산군 괴산읍',
      averageRent: 32,
      averageMaintenanceFee: 5,
      carNeed: '필요',
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

  private rentToMonthlyRent(rentValue: unknown, fallback: number) {
    return this.toNumberRangeAverage(rentValue, fallback);
  }

  private transportMonthlyCost(type: string, carNeed: string) {
    if (type === '자가용') {
      return carNeed === '필요' ? 32 : 24;
    }

    if (type === '기차') return 18;

    if (type === '도보' || type === '자전거') {
      return 0;
    }

    return carNeed === '필요' ? 18 : 12;
  }

  calculate(body: CostSimulationRequest) {
    const region = this.regions.find((item) => item.id === body.regionId);

    if (!region) {
      throw new NotFoundException('해당 지역 정보를 찾을 수 없습니다.');
    }

    const monthlyNet =
      body.income?.monthlyIncome ||
      this.salaryToMonthlyNet(body.income?.salary);

    const rent = this.rentToMonthlyRent(body.housing?.rent, region.averageRent);

    const maintenanceFee =
      body.housing?.maintenanceFee ?? region.averageMaintenanceFee;

    const transportCost = this.transportMonthlyCost(
      body.transport?.type || '버스',
      region.carNeed,
    );

    const costs = {
      rent,
      maintenanceFee,
      food: 48,
      transportation: transportCost,
      telecom: 7,
      utilities: 10,
      otherLiving: 36,
    };

    const totalMonthlyCost = Object.values(costs).reduce(
      (sum, value) => sum + value,
      0,
    );

    const support = body.policy?.includeSupport
      ? Number(body.policy?.monthlySupportAmount || 0)
      : 0;

    const monthlyBalance = monthlyNet + support - totalMonthlyCost;

    const savingPossibleAmount = Math.max(0, Math.round(monthlyBalance * 0.7));

    const initialRequiredAmount =
      Number(body.housing?.deposit || 500) + 50 + rent + maintenanceFee + 80;

    return {
      userId: body.userId || null,
      regionId: region.id,
      regionName: region.name,
      income: {
        monthlyGrossIncome:
          body.income?.monthlyIncome ||
          Math.round(this.toNumberRangeAverage(body.income?.salary, 3000) / 12),
        estimatedMonthlyNetIncome: monthlyNet,
      },
      costs: {
        ...costs,
        totalMonthlyCost,
      },
      policySupport: {
        included: Boolean(body.policy?.includeSupport),
        monthlyAmount: support,
      },
      result: {
        monthlyBalance,
        savingPossibleAmount,
        initialRequiredAmount,
        rentBurdenRate: Number(((rent / monthlyNet) * 100).toFixed(1)),
        stabilityLevel:
          monthlyBalance >= 80
            ? '안정'
            : monthlyBalance >= 30
              ? '보통'
              : monthlyBalance >= 0
                ? '주의'
                : '위험',
      },
      cautions: [
        '생활비 계산 결과는 입력값과 지역 평균 데이터를 바탕으로 한 예상값입니다.',
        '정책지원금은 실제 선정 여부에 따라 달라질 수 있습니다.',
      ],
    };
  }
}
