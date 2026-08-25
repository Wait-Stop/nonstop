import { Injectable, ServiceUnavailableException } from '@nestjs/common';

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

@Injectable()
export class AiChatService {
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
              parts: [{
                text: '당신은 충북 정착을 고민하는 청년을 돕는 충북올겨 상담 도우미입니다. 제공된 사용자 조건과 지역·정책 식별자 범위 안에서 주거비, 교통, 일자리, 정책 확인 순서를 한국어로 간결하게 안내하세요. 확인되지 않은 정책 자격이나 금액을 확정적으로 말하지 말고 반드시 공식 공고 확인이 필요하다고 안내하세요. 개인정보를 추가로 요구하지 마세요.',
              }],
            },
            contents: [{
              role: 'user',
              parts: [{
                text: `사용자 조건: ${JSON.stringify(condition)}\n관련 지역: ${JSON.stringify(context.regionIds || [])}\n관련 정책: ${JSON.stringify(context.policyIds || [])}\n질문: ${message}`,
              }],
            }],
            generationConfig: { temperature: 0.35, maxOutputTokens: 700 },
          }),
          signal: controller.signal,
        },
      );
      const data = (await response.json()) as GeminiResponse;
      if (!response.ok) throw new Error(data.error?.message || 'Gemini API 요청에 실패했습니다.');
      const answer = data.candidates?.[0]?.content?.parts?.map((part) => part.text || '').join('\n').trim();
      if (!answer) throw new Error('Gemini 응답 내용이 비어 있습니다.');

      return {
        answer,
        usedContext: { condition, regionIds: context.regionIds || [], policyIds: context.policyIds || [] },
        isMock: false,
        caution: 'AI 안내는 참고용입니다. 정책 자격과 금액은 신청 시점의 공식 공고를 확인해 주세요.',
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
