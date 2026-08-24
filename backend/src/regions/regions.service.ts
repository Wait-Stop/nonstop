import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class RegionsService {
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
      averageMaintenanceFee: 8,
      averageCommute: 28,
      transportScore: 85,
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
      averageMaintenanceFee: 7,
      averageCommute: 22,
      transportScore: 70,
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
      averageMaintenanceFee: 8,
      averageCommute: 24,
      transportScore: 55,
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
      averageMaintenanceFee: 6,
      averageCommute: 30,
      transportScore: 50,
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
      averageMaintenanceFee: 5,
      averageCommute: 35,
      transportScore: 35,
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

  findAll() {
    return {
      regions: this.regions.map((region) => ({
        id: region.id,
        name: region.area,
        type: region.type,
        description: region.description,
        highlights: region.infrastructure.slice(0, 4),
        image: region.image,
        imageSource: region.imageSource,
      })),
    };
  }

  findOne(regionId: string) {
    const region = this.regions.find(
      (item) => item.id === regionId || item.area === regionId,
    );

    if (!region) {
      throw new NotFoundException('해당 지역 정보를 찾을 수 없습니다.');
    }

    return {
      id: region.id,
      name: region.name,
      area: region.area,
      score: region.scoreBase,
      type: region.type,
      reasons: [
        region.description,
        `${region.infrastructure.slice(0, 2).join(', ')} 중심으로 생활권을 확인할 수 있습니다.`,
        '정책 신청 가능 여부는 신청 시점의 원문 공고 확인이 필요합니다.',
      ],
      rent: region.averageRent,
      commute: region.averageCommute,
      carNeed: region.carNeed,
      transportScore: region.transportScore,
      commuteBasis: {
        origin: region.name,
        destination: region.infrastructure[0],
        method: '백엔드 지역별 대표 생활권 기준 편도 예상시간',
        caution:
          '실시간 길찾기 결과가 아니며 실제 근무지, 시간대, 교통수단에 따라 달라질 수 있습니다.',
      },
      infrastructure: region.infrastructure,
      policyCount: region.relatedPolicyIds.length,
      relatedPolicyIds: region.relatedPolicyIds,
      image: region.image,
      imageSource: region.imageSource,
    };
  }
}
