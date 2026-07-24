# 충북올겨

충북 정착 지역 추천 및 시뮬레이션 서비스입니다.

## 프로젝트 구조

```text
chungbuk-ollgyeo/
├─ frontend/   React + TypeScript + Vite 웹 애플리케이션
├─ backend/    API 및 인증 서버 구현 예정
└─ ai/         정착 지역 추천·분석 모델 구현 예정
```

## 프론트엔드 실행

프로젝트 루트에서:

```bash
npm run install:frontend
npm run dev
```

또는 `frontend` 폴더로 이동해 직접 실행할 수도 있습니다.

프로덕션 빌드는 `npm run build`로 확인할 수 있습니다.

백엔드와 AI 연결 규격 초안은 각각 `backend/API_CONTRACT.md`, `ai/RECOMMENDATION_CONTRACT.md`에 정리되어 있습니다.
