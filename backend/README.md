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

## 생활비 공공데이터 연동

`POST /api/cost-simulations`는 공공 API 키가 있으면 실제 외부 데이터를 우선 사용하고, 키가 없거나 조회 결과가 없으면 백엔드 MVP 기준값으로 fallback합니다.

```bash
DATA_GO_KR_SERVICE_KEY=공공데이터포털_Encoding_또는_Decoding_인증키 npm --prefix backend start
```

- `DATA_GO_KR_SERVICE_KEY` 또는 `MOLIT_SERVICE_KEY`: 국토교통부 전월세 실거래가 OpenAPI 키입니다. 월세 평균 계산에 사용합니다. 공공데이터포털의 Encoding/Decoding 인증키 모두 사용할 수 있습니다.
- `KOSIS_LIVING_COSTS_URL`: KOSIS에서 URL 생성한 소비지출 통계 JSON 호출 URL입니다. `{KOSIS_API_KEY}` placeholder를 넣으면 실행 시 치환합니다.
- `KOSIS_API_KEY`: KOSIS OpenAPI 인증키입니다.

현재 바로 연결된 외부 데이터는 국토교통부 아파트/오피스텔/연립다세대/단독다가구 전월세 실거래가입니다. KOSIS 소비지출은 통계표마다 항목 코드가 달라서 KOSIS URL 생성 결과를 환경변수로 넣는 방식으로 연결합니다.

`GET /api/cost-simulations/apt-trades?regionId=cheongju&dealMonth=202607`는 국토교통부 아파트 매매 실거래가 API를 조회합니다. 호출 endpoint는 `https://apis.data.go.kr/1613000/RTMSDataSvcAptTrade/getRTMSDataSvcAptTrade`입니다. 이 데이터는 주택 매매가 참고용이며, 월세 계산에는 전월세 실거래가 API를 사용합니다.

## AI 추천 서비스 연동

`POST /api/recommendations`와 `POST /api/policies/recommendations`는 Python FastAPI 추천 서비스가 실행 중이면 실제 AI 추천 응답을 사용합니다.

```bash
python3 -m uvicorn ai.api:app --host 127.0.0.1 --port 8001
AI_RECOMMENDATION_BASE_URL=http://localhost:8001 npm --prefix backend start
```

`AI_RECOMMENDATION_BASE_URL`을 지정하지 않으면 기본값은 `http://localhost:8001`입니다. AI 서버가 꺼져 있거나 응답하지 않으면 백엔드 MVP 규칙 기반 추천으로 자동 fallback합니다.
