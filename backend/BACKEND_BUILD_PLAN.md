# 충북올겨 백엔드 구축 범위

## 목표

지금까지 작성한 API 명세서를 기준으로 프론트엔드와 바로 연결 가능한 MVP 백엔드를 구축한다.

외부 패키지 설치 없이 실행할 수 있도록 Node.js 내장 `http` 모듈로 서버를 구성한다. 데이터베이스는 MVP 검증을 위해 메모리 seed 데이터로 대체하며, 추후 DB와 AI 모듈로 교체하기 쉽도록 기능을 함수 단위로 분리한다.

## 우선 구현 API

### 1. 상태 확인

- `GET /api/health`

서버 구동 여부를 확인한다.

### 2. 추천 지역

- `POST /api/recommendations`
- `GET /api/users/me/recommendations`
- `GET /api/recommendations/{recommendationId}`

사용자 조건 기반 추천 지역 TOP 3를 반환한다. `persist: true`이고 인증 토큰이 있으면 추천 이력에 저장한다.

### 3. 지역 데이터

- `GET /api/regions`
- `GET /api/regions/{regionId}`

MVP 대상 지역 5곳의 목록과 상세 정보를 반환한다.

### 4. 정책 데이터

- `GET /api/policies`
- `GET /api/policies/{policyId}`
- `POST /api/policies/recommendations`

정책 목록/상세를 조회하고, 맞춤 정책 추천은 AI 담당 모듈을 대신하는 mock 함수로 점수와 추천 이유를 생성한다.

### 5. 생활비 계산

- `POST /api/cost-simulations`

소득, 지역, 주거비, 이동수단, 정책지원금 포함 여부를 기준으로 월 생활비와 잔여금을 계산한다.

### 6. 출퇴근 계산

- `POST /api/commute-simulations`

선택 지역, 직무, 이동수단, 허용 출퇴근 시간을 기준으로 통근 가능 여부와 월 교통비를 계산한다.

### 7. AI 상담

- `POST /api/ai/chat`

실제 AI 연결 전 단계이므로 mock 상담 응답을 반환한다. 백엔드는 사용자 조건과 관련 지역/정책/생활비 컨텍스트를 모아 AI 모듈에 전달하는 역할을 가정한다.

### 8. 저장 기능

- `GET /api/users/me/saved-regions`
- `POST /api/users/me/saved-regions`
- `DELETE /api/users/me/saved-regions/{regionId}`
- `GET /api/users/me/saved-policies`
- `POST /api/users/me/saved-policies`
- `DELETE /api/users/me/saved-policies/{policyId}`

로그인 사용자 기준 저장한 지역/정책을 관리한다. MVP에서는 `Bearer demo-token`을 테스트 토큰으로 사용한다.

### 9. 정책 신청 체크리스트

- `GET /api/policies/{policyId}/checklist`
- `PATCH /api/users/me/policy-checklists/{policyId}`

정책별 신청 준비 체크리스트를 조회하고, 사용자별 체크 상태를 저장한다.

## MVP 대상 지역

- 청주시
- 충주시
- 진천군
- 옥천군
- 괴산군

## 인증 정책

MVP 테스트용 인증:

```http
Authorization: Bearer demo-token
```

토큰이 필요한 API에서 토큰이 없거나 다르면 `401`을 반환한다.

## 실행 방법

```bash
npm start
```

기본 포트:

```text
http://localhost:8080
```

포트 변경:

```bash
PORT=8090 npm start
```

## 검증 기준

서버 실행 후 아래 API가 정상 응답해야 한다.

- `GET /api/health`
- `GET /api/regions`
- `POST /api/recommendations`
- `GET /api/policies`
- `POST /api/cost-simulations`
- `POST /api/commute-simulations`
- `POST /api/ai/chat`

