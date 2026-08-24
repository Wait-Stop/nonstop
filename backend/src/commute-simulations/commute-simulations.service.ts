import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class CommuteSimulationsService {
  private readonly regions = [
    {
      id: 'cheongju',
      name: '청주시 오창읍',
      averageCommute: 28,
      carNeed: '있으면 편리',
      infrastructure: [
        '오창과학산업단지',
        '청주공항',
        '충북대병원',
        '대형마트',
      ],
    },
    {
      id: 'chungju',
      name: '충주시 연수동',
      averageCommute: 22,
      carNeed: '선택',
      infrastructure: ['충주역', '충주기업도시', '건국대병원', '대형마트'],
    },
    {
      id: 'jincheon',
      name: '진천·음성 충북혁신도시',
      averageCommute: 24,
      carNeed: '권장',
      infrastructure: [
        '충북혁신도시',
        '진천산업단지',
        '공공도서관',
        '종합병원',
      ],
    },
    {
      id: 'okcheon',
      name: '옥천군 옥천읍',
      averageCommute: 30,
      carNeed: '권장',
      infrastructure: ['옥천역', '대청호 생활권', '옥천군청', '전통시장'],
    },
    {
      id: 'goesan',
      name: '괴산군 괴산읍',
      averageCommute: 35,
      carNeed: '필요',
      infrastructure: [
        '괴산읍 생활권',
        '청년 농촌보금자리',
        '산막이옛길',
        '로컬 커뮤니티',
      ],
    },
  ];

  private transportMonthlyCost(type: string, carNeed: string) {
    if (type === '자가용') return carNeed === '필요' ? 32 : 24;
    if (type === '기차') return 18;
    if (type === '도보' || type === '자전거') return 0;

    return carNeed === '필요' ? 18 : 12;
  }

  calculate(body: any) {
    const region = this.regions.find((item) => item.id === body.regionId);

    if (!region) {
      throw new NotFoundException('해당 지역 정보를 찾을 수 없습니다.');
    }

    const type = body.transport?.type || '버스';
    const max = Number(body.transport?.maxCommuteMinutes || 40);

    let oneWay = region.averageCommute;

    if (type === '자가용') {
      oneWay = Math.max(10, oneWay - 8);
    }

    if (type === '도보') {
      oneWay += 25;
    }

    if (type === '자전거') {
      oneWay += 10;
    }

    if (
      type === '버스' &&
      ['권장', '필요'].includes(region.carNeed)
    ) {
      oneWay += 10;
    }

    const possible = oneWay <= max;

    return {
      userId: body.userId || null,
      regionId: region.id,
      regionName: region.name,
      job: body.job || null,
      origin: body.origin || {
        name: region.name,
      },
      destination: body.destination || {
        name: region.infrastructure[0],
      },
      transportType: type,
      estimatedOneWayMinutes: oneWay,
      estimatedRoundTripMinutes: oneWay * 2,
      maxCommuteMinutes: max,
      isCommutePossible: possible,
      monthlyTransportationCost: this.transportMonthlyCost(
        type,
        region.carNeed,
      ),
      carNeed: possible
        ? region.carNeed
        : region.carNeed === '필요'
          ? '필요'
          : '권장',
      commuteLevel: possible
        ? '적합'
        : oneWay <= max + 15
          ? '주의'
          : '어려움',
      cautions: [
        '출퇴근 계산 결과는 대표 생활권과 교통 데이터를 기준으로 한 예상값입니다.',
        '실제 소요 시간은 근무지 위치, 시간대, 배차 간격에 따라 달라질 수 있습니다.',
      ],
    };
  }
}