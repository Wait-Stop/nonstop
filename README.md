# 충북올겨

충북에서 취업·이직·정착을 준비하는 청년을 위한 지역 추천 및 생활 시뮬레이션 서비스입니다. 직업, 소득, 주거 예산, 이동수단과 선호 지역을 바탕으로 정착 후보지와 관련 정책을 추천하고 생활비·출퇴근 여건을 한곳에서 비교할 수 있습니다.

## 주요 기능

- 비회원 간편 지역 추천과 회원 맞춤 추천
- 충북 지역 목록·상세·비교 및 추천 근거 제공
- 생활비와 출퇴근 통합 시뮬레이션
- 정착 지원정책 목록·상세·저장
- 회원가입, 로그인, 프로필과 저장 목록 관리
- 게시글·댓글 기반 커뮤니티
- Gemini 기반 정착 상담과 지역·정책 데이터 RAG

## 구성

| 영역 | 기술 | 역할 |
|---|---|---|
| Frontend | React 18, TypeScript, Vite, Tailwind CSS | 화면, 라우팅, API 호출 |
| Backend | NestJS 11, Prisma, PostgreSQL, JWT, bcrypt | 인증, 사용자 데이터, 추천·정책·시뮬레이션·커뮤니티 API |
| AI 추천 | FastAPI, Python | 규칙 기반 정책 TOP 5·지역 TOP 3 추천 |
| AI 상담 | Gemini API | 백엔드 지역·정책 및 계산 결과를 근거로 한 정착 상담 |

프런트엔드는 NestJS API만 호출합니다. NestJS는 추천 요청을 FastAPI에 전달하며, AI 추천 서비스가 응답하지 않으면 자체 규칙 기반 추천으로 전환합니다. Gemini 키는 백엔드에서만 사용합니다.

```text
Browser (React)
       |
       v
NestJS API ----> PostgreSQL
   |   |
   |   +-------> Gemini API (정착 상담)
   +-----------> FastAPI (정책·지역 추천)
```

## 프로젝트 구조

```text
chungbuk-ollgyeo/
├─ frontend/              React 애플리케이션
├─ backend/               NestJS API, Prisma 스키마·마이그레이션
├─ ai/                    FastAPI 추천 서비스와 추천 데이터
├─ scripts/               통합 실행 및 검증 스크립트
├─ render.yaml            Render 배포 설정
└─ package.json           루트 실행 명령
```

## 로컬 실행

### 요구 환경

- Node.js 20 이상
- npm
- Python 3.10 이상
- PostgreSQL(영속 기능 사용 시)

### 1. 의존성 설치

```bash
npm install
npm --prefix backend install
python -m venv .venv
```

macOS/Linux:

```bash
.venv/bin/python -m pip install -r ai/requirements-dev.txt
```

Windows PowerShell:

```powershell
npm.cmd install
npm.cmd --prefix backend install
.venv\Scripts\python.exe -m pip install -r ai/requirements-dev.txt
```

### 2. 환경변수 설정

`frontend/.env.example`을 `frontend/.env.local`로, `backend/.env.example`을 `backend/.env`로 복사해 필요한 값을 입력합니다.

```env
# frontend/.env.local
VITE_API_BASE_URL=http://localhost:8080/api
```

```env
# backend/.env
DATABASE_URL=postgresql://USER:PASSWORD@HOST:5432/DATABASE
JWT_SECRET=충분히_긴_임의의_비밀값
AI_RECOMMENDATION_BASE_URL=http://127.0.0.1:8001
AI_RECOMMENDATION_TIMEOUT_MS=1200

# 선택: Gemini 정착 상담
GEMINI_API_KEY=Google_AI_Studio에서_발급한_키
GEMINI_MODEL=gemini-3.5-flash
```

공공데이터 연동을 사용할 경우 `DATA_GO_KR_SERVICE_KEY`, `MOLIT_SERVICE_KEY`, `KOSIS_API_KEY`도 설정할 수 있습니다. 비밀값은 저장소에 커밋하지 않습니다.

### 3. 데이터베이스 준비

```bash
npx --prefix backend prisma generate
npx --prefix backend prisma migrate deploy
```

### 4. 전체 서비스 실행

```bash
npm run dev
```

Windows에서 PowerShell 실행 정책으로 `npm.ps1`이 차단되면 `npm.cmd run dev`를 사용합니다.

| 서비스 | 기본 주소 |
|---|---|
| Frontend | `http://localhost:5173` |
| Backend | `http://localhost:8080` |
| Backend health | `http://localhost:8080/api/health` |
| AI 추천 API | `http://127.0.0.1:8001` |
| AI health | `http://127.0.0.1:8001/health` |

개별 실행은 `npm run dev:frontend`, `npm run dev:backend`, `npm run dev:ai`를 사용합니다.

## 검증

프런트 프로덕션 빌드, 백엔드 테스트, AI 테스트를 한 번에 실행합니다.

```bash
npm test
```

개별 명령:

```bash
npm run build
npm --prefix backend run build
npm --prefix backend test -- --runInBand
node scripts/test-ai.mjs
```

## 주요 화면

| 경로 | 설명 |
|---|---|
| `/` | 홈·비회원 간편 추천 |
| `/login`, `/signup` | 로그인·회원가입 |
| `/recommendations` | 추천 지역 결과 |
| `/regions`, `/regions/compare`, `/regions/:id` | 지역 목록·비교·상세 |
| `/simulation` | 생활비·출퇴근 통합 시뮬레이션 |
| `/policies`, `/policies/:id` | 정책 목록·상세 |
| `/mypage`, `/mypage/saved`, `/mypage/profile` | 내 정보·저장 목록·프로필 |
| `/community` | 커뮤니티 |

## API 연동 원칙

- FE–BE 경계는 `frontend/src/services/api.ts`에서 관리합니다.
- BE 계약은 [`backend/API_CONTRACT.md`](backend/API_CONTRACT.md), BE–AI 추천 계약은 [`ai/RECOMMENDATION_CONTRACT.md`](ai/RECOMMENDATION_CONTRACT.md)를 참고합니다.
- 간편 추천은 `persist: false`로 요청하며 회원 추천 이력에 저장하지 않습니다.
- 지역 추천·조회, 정책 조회, 생활비·출퇴근 계산은 로컬 UI 개발을 위한 Mock fallback이 있습니다.
- 인증, 프로필, 저장 목록, 커뮤니티, AI 상담은 백엔드 연결이 필요합니다.
- JWT는 현재 브라우저 `localStorage`에 저장됩니다. 운영 환경에서는 XSS 방어와 토큰 저장 정책을 별도로 검토해야 합니다.
- AI 결과와 공공데이터 기반 수치는 참고용이며, 정책 자격·금액·신청 기간은 공식 공고를 다시 확인해야 합니다.

## 배포

`render.yaml`은 `main` 브랜치를 기준으로 다음 리소스를 구성합니다.

- React 정적 파일을 함께 제공하는 NestJS 웹 서비스
- FastAPI 추천 웹 서비스
- PostgreSQL 데이터베이스

배포 환경에는 `DATABASE_URL`, `JWT_SECRET`, AI 서비스 주소가 필요하며 Gemini 상담 사용 시 `GEMINI_API_KEY`를 추가해야 합니다.

## 브랜치

- `main`: 검증된 배포본
- `develop`: 기능 통합
- `feature/*`: 기능 개발
- `docs/*`: 문서 작업

기능은 `develop`에서 통합·검증한 뒤 배포 가능한 상태만 `main`에 반영합니다.
