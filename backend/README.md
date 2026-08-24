# Backend

인증, 사용자 정보 저장, 정책 및 지역 데이터 API를 구현할 서버 영역입니다.

프론트엔드와 독립적으로 기술 스택과 실행 환경을 추가할 수 있도록 분리했습니다.

## 실행

```bash
npm --prefix backend start
```

기본 주소는 `http://localhost:8080`입니다.

`DATABASE_URL`이 없으면 인증, 회원정보, 저장한 지역/정책처럼 DB가 필요한 API는 사용할 수 없습니다.
다만 정책/지역 조회, 간편 추천, 생활비/출퇴근 시뮬레이션, AI 상담 mock 응답 같은 공개 API는 로컬 발표·데모 환경에서도 확인할 수 있도록 서버가 부팅됩니다.

## AI 추천 서비스 연동

`POST /api/recommendations`와 `POST /api/policies/recommendations`는 Python FastAPI 추천 서비스가 실행 중이면 실제 AI 추천 응답을 사용합니다.

```bash
python3 -m uvicorn ai.api:app --host 127.0.0.1 --port 8001
AI_RECOMMENDATION_BASE_URL=http://localhost:8001 npm --prefix backend start
```

`AI_RECOMMENDATION_BASE_URL`을 지정하지 않으면 기본값은 `http://localhost:8001`입니다. AI 서버가 꺼져 있거나 응답하지 않으면 백엔드 MVP 규칙 기반 추천으로 자동 fallback합니다.
