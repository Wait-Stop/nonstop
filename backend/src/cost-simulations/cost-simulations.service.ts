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

interface RegionCostBaseline {
  id: string;
  name: string;
  lawdCode: string;
  averageRent: number;
  averageDeposit: number;
  averageMaintenanceFee: number;
  carNeed: string;
}

interface ExternalHousingCost {
  rent?: number;
  deposit?: number;
  source: string;
  sampleCount: number;
}

interface ExternalLivingCosts {
  food?: number;
  telecom?: number;
  utilities?: number;
  otherLiving?: number;
  source: string;
}

interface ParsedRentDeal {
  monthlyRent: number;
  deposit?: number;
}

export interface ParsedAptTrade {
  apartmentName: string;
  dealAmount: number;
  exclusiveArea?: number;
  floor?: number;
  buildYear?: number;
  dealDate: string;
}

export interface ApartmentTradesResponse {
  regionId: string;
  regionName: string;
  lawdCode?: string;
  dealMonth: string;
  source: string;
  status: 'missing-key' | 'external' | 'empty';
  sampleCount: number;
  averageDealAmount: number;
  trades: ParsedAptTrade[];
  cautions: string[];
}

@Injectable()
export class CostSimulationsService {
  private readonly regions: RegionCostBaseline[] = [
    {
      id: 'cheongju',
      name: '청주시 오창읍',
      lawdCode: '43114',
      averageRent: 58,
      averageDeposit: 1000,
      averageMaintenanceFee: 8,
      carNeed: '있으면 편리',
    },
    {
      id: 'chungju',
      name: '충주시 연수동',
      lawdCode: '43130',
      averageRent: 45,
      averageDeposit: 800,
      averageMaintenanceFee: 7,
      carNeed: '선택',
    },
    {
      id: 'jincheon',
      name: '진천·음성 충북혁신도시',
      lawdCode: '43750',
      averageRent: 52,
      averageDeposit: 900,
      averageMaintenanceFee: 8,
      carNeed: '권장',
    },
    {
      id: 'okcheon',
      name: '옥천군 옥천읍',
      lawdCode: '43730',
      averageRent: 38,
      averageDeposit: 600,
      averageMaintenanceFee: 6,
      carNeed: '권장',
    },
    {
      id: 'goesan',
      name: '괴산군 괴산읍',
      lawdCode: '43760',
      averageRent: 32,
      averageDeposit: 500,
      averageMaintenanceFee: 5,
      carNeed: '필요',
    },
  ];

  private readonly molitRentEndpoints = [
    {
      name: '국토교통부 아파트 전월세 실거래가',
      url: 'https://apis.data.go.kr/1613000/RTMSDataSvcAptRent/getRTMSDataSvcAptRent',
    },
    {
      name: '국토교통부 오피스텔 전월세 실거래가',
      url: 'https://apis.data.go.kr/1613000/RTMSDataSvcOffiRent/getRTMSDataSvcOffiRent',
    },
    {
      name: '국토교통부 연립다세대 전월세 실거래가',
      url: 'https://apis.data.go.kr/1613000/RTMSDataSvcRHRent/getRTMSDataSvcRHRent',
    },
    {
      name: '국토교통부 단독다가구 전월세 실거래가',
      url: 'https://apis.data.go.kr/1613000/RTMSDataSvcSHRent/getRTMSDataSvcSHRent',
    },
  ];

  private readonly molitAptTradeEndpoint =
    'https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade';

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

  private getPublicDataServiceKey() {
    const serviceKey =
      process.env.DATA_GO_KR_SERVICE_KEY || process.env.MOLIT_SERVICE_KEY;

    if (!serviceKey) return undefined;

    try {
      return decodeURIComponent(serviceKey.trim());
    } catch {
      return serviceKey.trim();
    }
  }

  private latestDealMonths(count = 6) {
    const months: string[] = [];
    const date = new Date();
    date.setDate(1);

    for (let index = 0; index < count; index += 1) {
      months.push(
        `${date.getFullYear()}${String(date.getMonth() + 1).padStart(2, '0')}`,
      );
      date.setMonth(date.getMonth() - 1);
    }

    return months;
  }

  private toApiNumber(value: unknown) {
    if (typeof value === 'number') return value;
    if (typeof value !== 'string') return 0;

    return Number(value.replace(/[^\d.-]/g, '')) || 0;
  }

  private toApiString(value: unknown) {
    if (typeof value === 'string') return value;
    if (typeof value === 'number') return String(value);

    return '';
  }

  private asArray<T>(value: T | T[] | undefined): T[] {
    if (!value) return [];
    return Array.isArray(value) ? value : [value];
  }

  private parseRentItemsFromJson(data: unknown): ParsedRentDeal[] {
    const root = data as {
      response?: {
        body?: {
          items?: {
            item?: Array<Record<string, unknown>> | Record<string, unknown>;
          };
        };
      };
    };

    const items = this.asArray(root.response?.body?.items?.item);

    return items
      .map((item) => ({
        monthlyRent: this.toApiNumber(
          item.monthlyRent ?? item['월세금액'] ?? item.rentFee,
        ),
        deposit: this.toApiNumber(item.deposit ?? item['보증금액']),
      }))
      .filter((item) => item.monthlyRent > 0);
  }

  private parseRentItemsFromXml(xml: string): ParsedRentDeal[] {
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return itemMatches
      .map((match) => {
        const itemXml = match[1];
        const monthlyRent =
          itemXml.match(/<monthlyRent>(.*?)<\/monthlyRent>/)?.[1] ||
          itemXml.match(/<월세금액>(.*?)<\/월세금액>/)?.[1] ||
          '';
        const deposit =
          itemXml.match(/<deposit>(.*?)<\/deposit>/)?.[1] ||
          itemXml.match(/<보증금액>(.*?)<\/보증금액>/)?.[1] ||
          '';

        return {
          monthlyRent: this.toApiNumber(monthlyRent),
          deposit: this.toApiNumber(deposit),
        };
      })
      .filter((item) => item.monthlyRent > 0);
  }

  private parseAptTradeItemsFromJson(data: unknown): ParsedAptTrade[] {
    const root = data as {
      response?: {
        body?: {
          items?: {
            item?: Array<Record<string, unknown>> | Record<string, unknown>;
          };
        };
      };
    };

    const items = this.asArray(root.response?.body?.items?.item);

    return items
      .map((item) => {
        const year = this.toApiString(item.dealYear ?? item['년']);
        const month = this.toApiString(item.dealMonth ?? item['월']).padStart(
          2,
          '0',
        );
        const day = this.toApiString(item.dealDay ?? item['일']).padStart(
          2,
          '0',
        );

        return {
          apartmentName: this.toApiString(item.aptNm ?? item['아파트']),
          dealAmount: this.toApiNumber(item.dealAmount ?? item['거래금액']),
          exclusiveArea: this.toApiNumber(item.excluUseAr ?? item['전용면적']),
          floor: this.toApiNumber(item.floor ?? item['층']),
          buildYear: this.toApiNumber(item.buildYear ?? item['건축년도']),
          dealDate:
            year && month && day ? `${year}-${month}-${day}` : '날짜 미상',
        };
      })
      .filter((item) => item.apartmentName && item.dealAmount > 0);
  }

  private parseAptTradeItemsFromXml(xml: string): ParsedAptTrade[] {
    const itemMatches = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)];

    return itemMatches
      .map((match) => {
        const itemXml = match[1];
        const read = (...names: string[]) => {
          for (const name of names) {
            const value = itemXml.match(new RegExp(`<${name}>(.*?)</${name}>`));
            if (value?.[1]) return value[1];
          }
          return '';
        };
        const year = read('dealYear', '년');
        const month = read('dealMonth', '월').padStart(2, '0');
        const day = read('dealDay', '일').padStart(2, '0');

        return {
          apartmentName: read('aptNm', '아파트'),
          dealAmount: this.toApiNumber(read('dealAmount', '거래금액')),
          exclusiveArea: this.toApiNumber(read('excluUseAr', '전용면적')),
          floor: this.toApiNumber(read('floor', '층')),
          buildYear: this.toApiNumber(read('buildYear', '건축년도')),
          dealDate:
            year && month && day ? `${year}-${month}-${day}` : '날짜 미상',
        };
      })
      .filter((item) => item.apartmentName && item.dealAmount > 0);
  }

  private async fetchRentEndpoint(
    endpoint: { name: string; url: string },
    region: RegionCostBaseline,
    dealMonth: string,
    serviceKey: string,
  ) {
    const url = new URL(endpoint.url);
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('LAWD_CD', region.lawdCode);
    url.searchParams.set('DEAL_YMD', dealMonth);
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('_type', 'json');

    const response = await fetch(url);
    if (!response.ok) return [];

    const text = await response.text();

    try {
      return this.parseRentItemsFromJson(JSON.parse(text) as unknown);
    } catch {
      return this.parseRentItemsFromXml(text);
    }
  }

  private async fetchAptTrades(
    region: RegionCostBaseline,
    dealMonth: string,
    serviceKey: string,
  ): Promise<ParsedAptTrade[]> {
    const url = new URL(this.molitAptTradeEndpoint);
    url.searchParams.set('serviceKey', serviceKey);
    url.searchParams.set('LAWD_CD', region.lawdCode);
    url.searchParams.set('DEAL_YMD', dealMonth);
    url.searchParams.set('numOfRows', '100');
    url.searchParams.set('pageNo', '1');
    url.searchParams.set('_type', 'json');

    const response = await fetch(url);
    if (!response.ok) return [];

    const text = await response.text();

    try {
      return this.parseAptTradeItemsFromJson(JSON.parse(text) as unknown);
    } catch {
      return this.parseAptTradeItemsFromXml(text);
    }
  }

  private async fetchExternalHousingCost(region: RegionCostBaseline) {
    const serviceKey = this.getPublicDataServiceKey();
    if (!serviceKey) return null;

    const deals: ParsedRentDeal[] = [];

    for (const dealMonth of this.latestDealMonths()) {
      const monthlyResults = await Promise.all(
        this.molitRentEndpoints.map((endpoint) =>
          this.fetchRentEndpoint(endpoint, region, dealMonth, serviceKey).catch(
            () => [],
          ),
        ),
      );
      deals.push(...monthlyResults.flat());

      if (deals.length >= 10) break;
    }

    if (!deals.length) return null;

    const averageRent = Math.round(
      deals.reduce((sum, item) => sum + item.monthlyRent, 0) / deals.length,
    );
    const deposits = deals
      .map((item) => item.deposit || 0)
      .filter((value) => value > 0);
    const averageDeposit = deposits.length
      ? Math.round(
          deposits.reduce((sum, value) => sum + value, 0) / deposits.length,
        )
      : undefined;

    return {
      rent: averageRent,
      deposit: averageDeposit,
      source: '국토교통부 전월세 실거래가 OpenAPI',
      sampleCount: deals.length,
    } satisfies ExternalHousingCost;
  }

  private parseKosisLivingCosts(rows: Array<Record<string, unknown>>) {
    const result: Partial<ExternalLivingCosts> = {};

    for (const row of rows) {
      const rawItemName = row.ITM_NM || row.C1_NM || row.C2_NM;
      const itemName = typeof rawItemName === 'string' ? rawItemName : '';
      const value = this.toApiNumber(row.DT);
      if (!value) continue;

      const monthlyManwon = value > 1000 ? Math.round(value / 10000) : value;

      if (itemName.includes('식료') || itemName.includes('식비')) {
        result.food = Math.round(monthlyManwon);
      }
      if (itemName.includes('통신')) {
        result.telecom = Math.round(monthlyManwon);
      }
      if (
        itemName.includes('주거') ||
        itemName.includes('수도') ||
        itemName.includes('광열')
      ) {
        result.utilities = Math.round(monthlyManwon);
      }
      if (itemName.includes('기타') || itemName.includes('개인')) {
        result.otherLiving = Math.round(monthlyManwon);
      }
    }

    if (
      result.food === undefined &&
      result.telecom === undefined &&
      result.utilities === undefined &&
      result.otherLiving === undefined
    ) {
      return null;
    }

    return {
      ...result,
      source: 'KOSIS 소비지출 OpenAPI',
    } satisfies ExternalLivingCosts;
  }

  private async fetchExternalLivingCosts() {
    const directUrl = process.env.KOSIS_LIVING_COSTS_URL;
    if (!directUrl) return null;

    const apiKey = process.env.KOSIS_API_KEY || '';
    const url = directUrl.replace('{KOSIS_API_KEY}', apiKey);
    const response = await fetch(url);
    if (!response.ok) return null;

    const rows = (await response.json()) as Array<Record<string, unknown>>;
    if (!Array.isArray(rows)) return null;

    return this.parseKosisLivingCosts(rows);
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

  async calculate(body: CostSimulationRequest) {
    const region = this.regions.find((item) => item.id === body.regionId);

    if (!region) {
      throw new NotFoundException('해당 지역 정보를 찾을 수 없습니다.');
    }

    const monthlyNet =
      body.income?.monthlyIncome ||
      this.salaryToMonthlyNet(body.income?.salary);

    const externalHousing = await this.fetchExternalHousingCost(region);
    const externalLiving = await this.fetchExternalLivingCosts().catch(
      () => null,
    );

    const rent = this.rentToMonthlyRent(
      body.housing?.rent,
      externalHousing?.rent ?? region.averageRent,
    );

    const maintenanceFee =
      body.housing?.maintenanceFee ?? region.averageMaintenanceFee;

    const transportCost = this.transportMonthlyCost(
      body.transport?.type || '버스',
      region.carNeed,
    );

    const costs = {
      rent,
      maintenanceFee,
      food: externalLiving?.food ?? 48,
      transportation: transportCost,
      telecom: externalLiving?.telecom ?? 7,
      utilities: externalLiving?.utilities ?? 10,
      otherLiving: externalLiving?.otherLiving ?? 36,
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

    const deposit = this.toNumberRangeAverage(
      body.housing?.deposit,
      externalHousing?.deposit ?? region.averageDeposit,
    );

    const initialRequiredAmount = deposit + 50 + rent + maintenanceFee + 80;

    const dataSources = {
      housing: externalHousing
        ? {
            source: externalHousing.source,
            sampleCount: externalHousing.sampleCount,
            status: 'external',
          }
        : {
            source: '백엔드 지역별 기준값',
            sampleCount: 0,
            status: 'fallback',
          },
      livingCosts: externalLiving
        ? {
            source: externalLiving.source,
            status: 'external',
          }
        : {
            source: '백엔드 MVP 생활비 기준값',
            status: 'fallback',
          },
    };

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
        dataSources.housing.status === 'external'
          ? '월세는 국토교통부 전월세 실거래가 OpenAPI 조회 결과를 반영했습니다.'
          : '공공데이터 API 키가 없거나 조회 결과가 없어 백엔드 기준값을 사용했습니다.',
      ],
      dataSources,
    };
  }

  async getApartmentTrades(
    regionId: string,
    dealMonth?: string,
  ): Promise<ApartmentTradesResponse> {
    const region = this.regions.find((item) => item.id === regionId);

    if (!region) {
      throw new NotFoundException('해당 지역 정보를 찾을 수 없습니다.');
    }

    const serviceKey = this.getPublicDataServiceKey();
    if (!serviceKey) {
      return {
        regionId: region.id,
        regionName: region.name,
        dealMonth: dealMonth || this.latestDealMonths(1)[0],
        source: '국토교통부 아파트 매매 실거래가 OpenAPI',
        status: 'missing-key',
        sampleCount: 0,
        averageDealAmount: 0,
        trades: [],
        cautions: [
          'DATA_GO_KR_SERVICE_KEY 또는 MOLIT_SERVICE_KEY가 없어서 실거래가를 조회하지 않았습니다.',
        ],
      };
    }

    const targetDealMonth = dealMonth || this.latestDealMonths(1)[0];
    const trades = await this.fetchAptTrades(
      region,
      targetDealMonth,
      serviceKey,
    ).catch((): ParsedAptTrade[] => []);

    const averageDealAmount = trades.length
      ? Math.round(
          trades.reduce((sum, item) => sum + item.dealAmount, 0) /
            trades.length,
        )
      : 0;

    return {
      regionId: region.id,
      regionName: region.name,
      lawdCode: region.lawdCode,
      dealMonth: targetDealMonth,
      source: '국토교통부 아파트 매매 실거래가 OpenAPI',
      status: trades.length ? 'external' : 'empty',
      sampleCount: trades.length,
      averageDealAmount,
      trades: trades.slice(0, 20),
      cautions: [
        '아파트 매매 실거래가는 월세 계산값이 아니라 주택 매매가 참고 데이터입니다.',
      ],
    };
  }
}
