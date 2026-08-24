import { Injectable } from '@nestjs/common';

export interface AiChatRequest {
  message?: string;
  condition?: {
    transport?: string;
    [key: string]: unknown;
  };
  context?: {
    regionIds?: string[];
    policyIds?: string[];
    [key: string]: unknown;
  };
}

@Injectable()
export class AiChatService {
  chat(body: AiChatRequest) {
    const message = body.message || '';
    const condition = body.condition || {};
    const context = body.context || {};

    const regionIds = context.regionIds || [];
    const policyIds = context.policyIds || [];

    let answer =
      '입력한 조건을 기준으로 지역의 주거비, 교통, 일자리와 관련 정책을 함께 비교해보는 것이 좋습니다.';

    if (
      message.includes('차') ||
      message.includes('자가용') ||
      condition.transport === '버스'
    ) {
      answer =
        '차량이 없다면 대중교통 접근성과 생활 인프라가 모여 있는 지역을 우선 비교하는 것이 좋습니다. 청주와 충주처럼 중심 생활권이 형성된 지역은 상대적으로 대중교통 이용이 편리할 수 있습니다.';
    }

    if (message.includes('월세') || message.includes('주거')) {
      answer =
        '주거비를 중요하게 본다면 지역별 평균 월세뿐 아니라 관리비와 받을 수 있는 청년 주거지원 정책까지 함께 비교하는 것이 좋습니다.';
    }

    if (message.includes('취업') || message.includes('일자리')) {
      answer =
        '취업을 우선한다면 희망 직무와 지역의 주요 산업을 함께 비교하는 것이 좋습니다. 추천 결과와 일자리 지원 정책도 같이 확인해보세요.';
    }

    return {
      answer,
      usedContext: {
        condition,
        regionIds,
        policyIds,
      },
      isMock: true,
      caution:
        '현재 AI 상담은 MVP용 mock 응답이며 실제 AI 모델의 분석 결과가 아닙니다.',
    };
  }
}
