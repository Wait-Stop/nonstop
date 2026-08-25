# 충북올겨

충북에서 취업, 이직, 정착을 준비하는 청년을 위한 지역 추천 및 생활 시뮬레이션 서비스입니다.

사용자의 직업, 소득, 주거 예산, 이동수단과 선호 지역을 바탕으로 충북의 정착 후보지를 살펴보고 생활비, 출퇴근, 정책 정보를 한곳에서 확인하는 것을 목표로 합니다.

> 현재 저장소는 개발 중인 프로젝트입니다. 추천과 정책 화면은 백엔드 MVP API를 우선 사용하며, 백엔드가 꺼진 로컬 UI 개발 상황에서는 일부 Mock Data로 fallback합니다.

## 주요 기능

- 로그인 없이 이용할 수 있는 간편 지역 추천
- 회원가입 과정에서 정착 조건 입력
- 추천 지역 결과와 지역별 상세 정보
- 충북 전체 시·군 정보 및 지역 비교
- 출퇴근, 생활비, 하루 생활, 지출 시뮬레이션
- 정착 지원정책 목록 및 상세 정보
- 사용자 정보와 저장한 지역·정책 관리
- 정착 경험을 공유하는 커뮤니티

## 사용자 데이터 원칙

- 홈의 간편 추천은 로그인 여부와 관계없이 회원 DB에 저장하지 않습니다.
- 간편 추천 요청에는 `persist: false`를 전달합니다.
- 간편 추천 조건은 현재 브라우저 `localStorage`에만 임시 저장합니다.
- 비밀번호와 실제 인증 토큰은 `localStorage`에 저장하지 않습니다.
- 실제 인증과 데이터 저장 방식은 백엔드 API 확정 후 교체합니다.

## 기술 스택

### Frontend

- React 18
- TypeScript
- Vite
- React Router
- Tailwind CSS
- lucide-react

### Backend / AI

#### Backend

- Node.js 20
- NestJS 11
- TypeScript
- Prisma ORM
- PostgreSQL
- JWT · bcrypt 기반 인증
- class-validator 기반 요청 데이터 검증

#### AI

- Python
- FastAPI
- Uvicorn
- 사용자 조건 기반 정책·지역 추천 로직
- 추천 결과와 근거를 제공하는 설명 가능한 규칙 기반 점수 모델

프론트엔드는 NestJS 백엔드 API를 호출하고, 백엔드는 별도로 실행되는 FastAPI 추천 서비스와 연동합니다. AI 서비스가 응답하지 않으면 백엔드의 규칙 기반 추천 로직으로 자동 전환합니다.

## 프로젝트 구조

```text
chungbuk-ollgyeo/
├─ frontend/
│  ├─ src/
│  │  ├─ components/       공통 레이아웃과 내비게이션
│  │  ├─ context/          인증 및 공통 상태
│  │  ├─ data/             프론트엔드 Mock Data
│  │  ├─ pages/            라우트별 화면
│  │  ├─ services/         백엔드·AI API 교체 지점
│  │  ├─ App.tsx           애플리케이션 라우트
│  │  ├─ main.tsx          React 진입점
│  │  └─ types.ts          공통 TypeScript 타입
│  ├─ .env.example
│  └─ package.json
├─ backend/
│  ├─ API_CONTRACT.md      백엔드 API 계약 초안
│  └─ README.md
├─ ai/
│  ├─ RECOMMENDATION_CONTRACT.md
│  └─ README.md
├─ package.json
└─ README.md
```

## 실행 방법

### 요구 환경

- Node.js 20 이상
- npm

### 프로젝트 루트에서 실행

```bash
npm install
npm --prefix frontend install
python -m venv .venv
.venv/bin/python -m pip install -r ai/requirements.txt
npm run dev
```

`npm run dev`는 다음 서비스를 한 번에 실행합니다.

- 프론트엔드: `http://localhost:5173`
- 백엔드: `http://localhost:8080`
- AI 추천 API: `http://127.0.0.1:8001`

세 서비스를 함께 종료하려면 실행 중인 터미널에서 `Ctrl+C`를 누릅니다.

Windows PowerShell에서 실행 정책 또는 명령 인식 문제가 있으면 다음처럼 실행할 수 있습니다.

```powershell
npm.cmd install
npm.cmd run dev
```

개발 서버 주소는 기본적으로 다음과 같습니다.

```text
http://localhost:5173
```

### 프로덕션 빌드

```bash
npm run build
```

### 프론트엔드만 직접 실행

```bash
npm run dev:frontend
```

백엔드와 AI만 각각 실행하려면 `npm run dev:backend`, `npm run dev:ai`를 사용합니다.

## 환경변수

`frontend/.env.example`을 참고해 `frontend/.env.local`을 생성합니다.

```env
VITE_API_BASE_URL=http://localhost:8080/api
```

AI 정착 상담에 Gemini를 사용하려면 백엔드 또는 Render 서비스에 다음 환경변수를 설정합니다. API 키는 프론트엔드 환경변수나 저장소에 커밋하지 않습니다.

```env
GEMINI_API_KEY=Google_AI_Studio에서_발급한_키
GEMINI_MODEL=gemini-3.5-flash
```

프론트엔드는 백엔드 API만 직접 호출합니다. AI 추천 서비스 주소는 백엔드 실행 환경에서 `AI_RECOMMENDATION_BASE_URL`로 설정합니다.

## 주요 라우트

| 경로 | 설명 |
|---|---|
| `/` | 홈 및 비회원 간편 추천 |
| `/login` | 로그인 |
| `/signup` | 회원가입 및 정착 조건 입력 |
| `/recommendations` | 추천 지역 결과 |
| `/regions` | 충북 전체 지역 |
| `/regions/compare` | 지역 비교 |
| `/regions/:id` | 지역 상세 |
| `/simulation` | 전체 시뮬레이션 |
| `/simulation/:type` | 개별 시뮬레이션 |
| `/policies` | 정책 목록 |
| `/policies/:id` | 정책 상세 |
| `/mypage` | 내 정보 |
| `/mypage/saved` | 저장한 지역 및 정책 |
| `/mypage/profile` | 회원정보 수정 |
| `/community` | 커뮤니티 |

## 백엔드 및 AI 연동

프론트엔드의 데이터 요청은 다음 파일을 연결 경계로 사용합니다.

```text
frontend/src/services/api.ts
```

현재는 이 파일이 백엔드 MVP API를 호출하고, 백엔드가 꺼져 있는 로컬 UI 개발 상황에서는 Mock Data로 fallback합니다. 실제 서버 URL이 바뀌면 페이지 컴포넌트보다 `api.ts`의 요청 기준 또는 환경변수부터 조정합니다.

연동 규격 초안:

- [백엔드 API 계약](backend/API_CONTRACT.md)
- [AI 추천 API 계약](ai/RECOMMENDATION_CONTRACT.md)

API URL, 요청 형식과 응답 형식은 백엔드·AI 담당자와 합의 후 확정합니다.

## 브랜치 전략

```text
main
└─ develop
   ├─ feature/home-navigation
   ├─ feature/onboarding-flow
   ├─ feature/results-dashboard
   ├─ feature/region-detail
   ├─ feature/cost-simulator
   ├─ feature/policy-helper
   ├─ feature/mypage
   └─ feature/community
```

- `main`: 배포 가능한 상태만 유지합니다.
- `develop`: 기능을 통합하고 테스트합니다.
- `feature/*`: 기능 단위로 개발합니다.
- `docs/*`: 문서 변경에 사용합니다.

기능 브랜치는 `develop`을 기준으로 생성하고 `develop`을 대상으로 Pull Request를 만듭니다. 배포 준비가 끝난 경우에만 `develop`에서 `main`으로 Pull Request를 생성합니다.

## 커밋 메시지

커밋 메시지는 작업 내용을 알 수 있도록 한국어로 작성합니다.

```text
feat: 추천 지역 결과 화면 구현
fix: 희망 지역 복수 선택 오류 수정
docs: 프로젝트 실행 방법 정리
refactor: 추천 API 호출 로직 분리
```

권장 접두사:

- `feat`: 기능 추가
- `fix`: 오류 수정
- `docs`: 문서 수정
- `refactor`: 코드 구조 개선
- `style`: UI 또는 스타일 수정
- `chore`: 설정 및 기타 작업

## 협업 시 주의사항

- `main`에 직접 Push하지 않습니다.
- 작업 전 최신 `develop`을 현재 브랜치에 반영합니다.
- 기능과 관계없는 파일을 같은 커밋에 포함하지 않습니다.
- `node_modules`, `dist`, `.env.local`은 커밋하지 않습니다.
- Mock fallback 데이터가 실제 API 응답과 혼동되지 않도록 화면과 코드에 구분을 표시합니다.
- PR 전 `npm run build`로 TypeScript와 프로덕션 빌드를 확인합니다.
