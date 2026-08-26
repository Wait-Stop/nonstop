import { Injectable, ServiceUnavailableException } from '@nestjs/common';
import { policies } from '../policies/policies.data';
import { RegionsService } from '../regions/regions.service';

export interface AiChatRequest {
  message?: string;
  condition?: Record<string, unknown>;
  context?: {
    regionIds?: string[];
    policyIds?: string[];
    [key: string]: unknown;
  };
}

interface GeminiResponse {
  candidates?: Array<{ content?: { parts?: Array<{ text?: string }> } }>;
  error?: { message?: string };
}

const regionNames: Record<string, string> = {
  cheongju: '청주시',
  chungju: '충주시',
  jincheon: '진천군',
  okcheon: '옥천군',
  goesan: '괴산군',
};

function classifyTopic(message: string) {
  if (/정책|지원|혜택|신청|자격/.test(message)) return '정책';
  if (/자전거|버스|기차|차량|자가용|교통|출퇴근|이동/.test(message))
    return '교통';
  if (/월세|전세|주거|집|보증금/.test(message)) return '주거';
  if (/취업|직장|일자리|창업|직무/.test(message)) return '일자리';
  if (/생활비|지출|비용|저축|소득/.test(message)) return '생활비';
  return '일반 정착';
}

function searchTerms(text: string) {
  return [
    ...new Set(
      text
        .toLowerCase()
        .replace(/[^0-9a-z가-힣·]/g, ' ')
        .split(/\s+/)
        .filter((term) => term.length >= 2),
    ),
  ];
}

function relevanceScore(document: unknown, terms: string[]) {
  const haystack = JSON.stringify(document).toLowerCase();
  return terms.reduce(
    (score, term) =>
      score + (haystack.includes(term) ? (term.length >= 4 ? 3 : 1) : 0),
    0,
  );
}

@Injectable()
export class AiChatService {
  constructor(private readonly regionsService: RegionsService) {}

  async chat(body: AiChatRequest) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new ServiceUnavailableException(
        'AI 상담 설정이 완료되지 않았습니다. 관리자에게 GEMINI_API_KEY 설정을 요청해 주세요.',
      );
    }

    const message = body.message?.trim();
    if (!message) {
      throw new ServiceUnavailableException('상담 질문을 입력해 주세요.');
    }

    const model = process.env.GEMINI_MODEL || 'gemini-3.5-flash';
    const context = body.context || {};
    const condition = body.condition || {};
    const topic = classifyTopic(message);
    const regions = (context.regionIds || []).map(
      (id) => regionNames[id] || id,
    );
    const selectedRegionIds = new Set(context.regionIds || []);
    const terms = searchTerms(`${message} ${topic} ${regions.join(' ')}`);
    const regionKnowledge = this.regionsService
      .getKnowledgeDocuments()
      .map((region) => ({
        region,
        score:
          relevanceScore(region, terms) +
          (selectedRegionIds.has(region.id) ? 20 : 0),
      }))
      .filter((item) => item.score > 0)
      .sort((a, b) => b.score - a.score)
      .slice(0, 2)
      .map((item) => item.region);

    const requestedPolicyIds = new Set(context.policyIds || []);
    const policyKnowledge =
      topic === '정책'
        ? policies
            .map((policy) => ({
              policy,
              score:
                relevanceScore(policy, terms) +
                (requestedPolicyIds.has(policy.id) ? 30 : 0) +
                (regions.includes(policy.region) ||
                policy.region === '충북 전역'
                  ? 4
                  : 0),
            }))
            .filter((item) => item.score > 0)
            .sort((a, b) => b.score - a.score)
            .slice(0, 4)
            .map(({ policy }) => ({
              id: policy.id,
              title: policy.title,
              category: policy.category,
              region: policy.region,
              benefit: policy.benefit,
              period: policy.period,
              eligibility: policy.eligibility,
              summary: policy.summary,
              agency: policy.agency,
              sourceName: policy.sourceName,
              sourceUrl: policy.sourceUrl,
              lastChecked: policy.lastChecked,
              status: policy.status,
            }))
        : [];
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 15000);

    try {
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-goog-api-key': apiKey,
          },
          body: JSON.stringify({
            systemInstruction: {
              parts: [
                {
                  text: '당신은 충북 정착을 고민하는 청년을 돕는 충북올겨 상담 도우미입니다. 반드시 사용자가 질문한 주제에만 직접 답하세요. 아래에 제공되는 검색 자료와 계산 결과만 사실 근거로 사용하고, 사전 지식으로 구체적인 수치나 시설·정책 조건을 보충하지 마세요. 교통 질문에 주거·정책·취업 내용을 덧붙이지 말고, 정책·지원·혜택을 명시적으로 물었을 때만 정책을 언급하세요. 검색 자료에 자전거 도로, 경사도, 배차 간격 등이 없으면 확인할 수 없다고 분명히 말하세요. 정책 답변에는 자료의 기준일과 공식 출처 확인 필요성을 포함하세요. 답변은 결론부터 시작하고 3~5개의 짧은 항목으로 작성하세요. 개인정보를 요구하지 마세요.',
                },
              ],
            },
            contents: [
              {
                role: 'user',
                parts: [
                  {
                    text: `질문 주제: ${topic}\n사용자 조건: ${JSON.stringify(condition)}\n관련 지역: ${JSON.stringify(regions)}\n검색된 지역 자료: ${JSON.stringify(regionKnowledge)}\n검색된 정책 자료: ${JSON.stringify(policyKnowledge)}\n계산된 출퇴근 정보: ${JSON.stringify(context.commute || null)}\n계산된 생활비 정보: ${JSON.stringify(context.cost || null)}\n질문: ${message}`,
                  },
                ],
              },
            ],
            generationConfig: { temperature: 0.15, maxOutputTokens: 500 },
          }),
          signal: controller.signal,
        },
      );
      const data = (await response.json()) as GeminiResponse;
      if (!response.ok)
        throw new Error(
          data.error?.message || 'Gemini API 요청에 실패했습니다.',
        );
      const answer = data.candidates?.[0]?.content?.parts
        ?.map((part) => part.text || '')
        .join('\n')
        .trim();
      if (!answer) throw new Error('Gemini 응답 내용이 비어 있습니다.');

      return {
        answer,
        usedContext: {
          condition,
          regionIds: regionKnowledge.map((region) => region.id),
          policyIds: policyKnowledge.map((policy) => policy.id),
        },
        isMock: false,
        caution:
          topic === '정책'
            ? 'AI 안내는 참고용입니다. 정책 자격과 금액은 신청 시점의 공식 공고를 확인해 주세요.'
            : 'AI 안내는 참고용입니다. 실제 이동 환경과 생활 조건은 현장 및 최신 정보로 다시 확인해 주세요.',
      };
    } catch (error) {
      throw new ServiceUnavailableException(
        error instanceof Error && error.name !== 'AbortError'
          ? `AI 상담을 불러오지 못했습니다: ${error.message}`
          : 'AI 상담 응답 시간이 초과되었습니다. 잠시 후 다시 시도해 주세요.',
      );
    } finally {
      clearTimeout(timeout);
    }
  }
}
