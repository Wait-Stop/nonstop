import http from "node:http";
import { randomUUID } from "node:crypto";

const PORT = Number(process.env.PORT || 8080);
const AI_BASE_URL = process.env.AI_RECOMMENDATION_BASE_URL || process.env.AI_API_BASE_URL || "http://localhost:8001";
const MVP_REGION_NAMES = ["청주시", "충주시", "진천군", "옥천군", "괴산군"];
const DEMO_TOKEN = "demo-token";

const regions = [
  {
    id: "cheongju",
    name: "청주시 오창읍",
    area: "청주시",
    type: "산업단지 직장인형",
    description: "오창·오송 산업단지를 중심으로 IT, 반도체, 바이오 일자리 접근성이 높은 생활권입니다.",
    scoreBase: 88,
    averageRent: 58,
    averageMaintenanceFee: 8,
    averageCommute: 28,
    transportScore: 85,
    carNeed: "있으면 편리",
    infrastructure: ["오창과학산업단지", "청주공항", "충북대병원", "대형마트"],
    jobKeywords: ["IT·개발", "제조·생산", "사무·행정", "바이오", "반도체"],
    relatedPolicyIds: ["CB_HOUSING_001", "CB_JOB_001", "CJ_JOB_001"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Sangdangsangseong.jpg?width=1200",
    imageSource: "https://commons.wikimedia.org/wiki/File:Cheongju_Sangdangsangseong.jpg",
  },
  {
    id: "chungju",
    name: "충주시 연수동",
    area: "충주시",
    type: "중심 생활권형",
    description: "주거비와 생활 인프라 균형이 좋고, 충주기업도시와 중심 상권을 함께 비교하기 좋은 지역입니다.",
    scoreBase: 84,
    averageRent: 45,
    averageMaintenanceFee: 7,
    averageCommute: 22,
    transportScore: 70,
    carNeed: "선택",
    infrastructure: ["충주역", "충주기업도시", "건국대병원", "대형마트"],
    jobKeywords: ["제조·생산", "사무·행정", "서비스", "창업"],
    relatedPolicyIds: ["CB_HOUSING_001", "CH_HOUSING_001", "CH_STARTUP_001"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1200",
    imageSource: "https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg",
  },
  {
    id: "jincheon",
    name: "진천·음성 충북혁신도시",
    area: "진천군",
    type: "혁신도시 일자리형",
    description: "공공기관, 산업단지, 충북혁신도시 생활권을 중심으로 일자리 접근성이 좋은 지역입니다.",
    scoreBase: 86,
    averageRent: 52,
    averageMaintenanceFee: 8,
    averageCommute: 24,
    transportScore: 55,
    carNeed: "권장",
    infrastructure: ["충북혁신도시", "진천산업단지", "공공도서관", "종합병원"],
    jobKeywords: ["제조·생산", "공공기관", "사무·행정", "서비스"],
    relatedPolicyIds: ["CB_JOB_001", "CB_JOB_002", "CB_HOUSING_001"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon_Nongdari_Bridge_20200716_160025.jpg?width=1200",
    imageSource: "https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg",
  },
  {
    id: "okcheon",
    name: "옥천군 옥천읍",
    area: "옥천군",
    type: "전입 청년 정착형",
    description: "전입 청년, 월세, 전세대출 이자지원 등 정착형 정책과 연결하기 좋은 남부권 생활 지역입니다.",
    scoreBase: 78,
    averageRent: 38,
    averageMaintenanceFee: 6,
    averageCommute: 30,
    transportScore: 50,
    carNeed: "권장",
    infrastructure: ["옥천역", "대청호 생활권", "옥천군청", "전통시장"],
    jobKeywords: ["서비스", "농업", "사무·행정", "로컬창업"],
    relatedPolicyIds: ["OK_HOUSING_001", "OK_HOUSING_002", "CB_HOUSING_001"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1200",
    imageSource: "https://commons.wikimedia.org/wiki/File:옥천성당.jpg",
  },
  {
    id: "goesan",
    name: "괴산군 괴산읍",
    area: "괴산군",
    type: "농촌 정착·로컬창업형",
    description: "청년 농촌보금자리, 로컬 창업, 커뮤니티 정책과 연결하기 좋은 농촌 정착 후보지입니다.",
    scoreBase: 76,
    averageRent: 32,
    averageMaintenanceFee: 5,
    averageCommute: 35,
    transportScore: 35,
    carNeed: "필요",
    infrastructure: ["괴산읍 생활권", "청년 농촌보금자리", "산막이옛길", "로컬 커뮤니티"],
    jobKeywords: ["농업", "로컬창업", "서비스", "관광"],
    relatedPolicyIds: ["GS_HOUSING_001", "GS_STARTUP_001", "CB_STARTUP_001"],
    image: "https://commons.wikimedia.org/wiki/Special:FilePath/Oeryong-ri,_Buljeong-myeon,_Goesan-gun,_Chungcheongbuk-do,_South_Korea_-_panoramio.jpg?width=1200",
    imageSource: "https://commons.wikimedia.org/wiki/Category:Goesan",
  },
];

const policies = [
  {
    id: "CB_HOUSING_001",
    title: "충북 청년 월세 지원",
    category: "주거 지원",
    region: "충북 전역",
    benefit: "월 최대 20만원",
    period: "상시 확인",
    eligibility: "만 19~39세 무주택 청년",
    summary: "청년의 주거비 부담을 낮추기 위해 월세 일부를 지원합니다.",
    detail: "월세 거주 청년에게 실제 납부 임대료 일부를 지원하는 정책입니다.",
    requiredDocuments: ["신청서", "주민등록등본", "임대차계약서", "월세 납부 증빙", "소득 증빙 서류"],
    agency: "충청북도 또는 관할 시군",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "housingType", "monthlyRent", "isHouseOwner", "income"],
  },
  {
    id: "CB_JOB_001",
    title: "청년도전 지원사업",
    category: "일자리 지원",
    region: "충북 전역",
    benefit: "취업역량 강화 프로그램 및 참여수당",
    period: "사업별 상이",
    eligibility: "구직단념 청년 또는 취업 준비 청년",
    summary: "취업 준비 상태의 청년에게 상담, 교육, 프로그램 참여 기회를 제공합니다.",
    detail: "취업 준비 또는 구직 상담이 필요한 청년을 위한 일자리 지원 정책입니다.",
    requiredDocuments: ["신청서", "신분증", "구직 상태 확인 서류"],
    agency: "충청북도 일자리지원센터",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "employmentStatus", "job"],
  },
  {
    id: "CB_JOB_002",
    title: "충청북도 일자리지원센터 운영",
    category: "일자리 지원",
    region: "충북 전역",
    benefit: "취업 상담 및 구인구직 매칭",
    period: "상시 확인",
    eligibility: "충북 내 취업을 희망하는 구직자",
    summary: "충북 내 일자리 상담, 구인구직 매칭, 입사지원 컨설팅을 제공합니다.",
    detail: "희망 직무와 추천 지역을 기준으로 일자리센터 상담을 연결할 수 있습니다.",
    requiredDocuments: ["상담 신청서", "이력서"],
    agency: "충청북도 일자리지원센터",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["job", "region", "employmentStatus"],
  },
  {
    id: "CJ_JOB_001",
    title: "청주형 내일공감 일자리사업",
    category: "일자리 지원",
    region: "청주시",
    benefit: "청년 근속 인센티브 및 기업 인건비 지원",
    period: "공고 확인 필요",
    eligibility: "청주시 거주 미취업 청년",
    summary: "청주시 관내 기업 취업과 근속을 지원하는 일자리 사업입니다.",
    detail: "청주 취업 희망자와 관내 기업을 연결하는 청년 일자리 지원 정책입니다.",
    requiredDocuments: ["신청서", "주민등록등본", "미취업 확인 자료"],
    agency: "청주시",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "employmentStatus"],
  },
  {
    id: "CH_HOUSING_001",
    title: "충주시 청년 신혼부부 월세 지원",
    category: "주거 지원",
    region: "충주시",
    benefit: "월세 일부 지원",
    period: "공고 확인 필요",
    eligibility: "충주시 거주 무주택 청년 신혼부부",
    summary: "청년 신혼부부의 주거비 부담 완화와 지역 정착을 돕습니다.",
    detail: "혼인 기간, 무주택 여부, 월세 거주 여부 등 세부 조건 확인이 필요합니다.",
    requiredDocuments: ["신청서", "혼인관계증명서", "주민등록등본", "임대차계약서"],
    agency: "충주시",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "householdType", "housingType", "isHouseOwner"],
  },
  {
    id: "CH_STARTUP_001",
    title: "청년 소상공인 창업점포 임차료 지원",
    category: "창업 지원",
    region: "충주시",
    benefit: "점포 임차료 일부 지원",
    period: "공고 확인 필요",
    eligibility: "충주시 소재 청년 소상공인",
    summary: "초기 청년 창업자의 점포 임차료 부담을 줄이는 정책입니다.",
    detail: "사업장 지역, 사업자등록 기간, 점포 임차 여부 확인이 필요합니다.",
    requiredDocuments: ["신청서", "사업자등록증", "임대차계약서", "임차료 납부 증빙"],
    agency: "충주시",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "startupInterest"],
  },
  {
    id: "OK_HOUSING_001",
    title: "옥천군 청년 전세대출금 이자 지원",
    category: "주거 지원",
    region: "옥천군",
    benefit: "전세대출금 잔액의 3%, 연 최대 200만원",
    period: "공고 확인 필요",
    eligibility: "옥천군 거주 또는 전입 희망 만 19~39세 청년",
    summary: "옥천군 청년의 전세대출 이자 부담을 줄이는 정착 지원 정책입니다.",
    detail: "전세대출 여부, 대출 잔액, 자녀 여부 등 세부 조건 확인이 필요합니다.",
    requiredDocuments: ["신청서", "주민등록등본", "전세계약서", "대출잔액증명서"],
    agency: "옥천군",
    sourceName: "옥천군",
    sourceUrl: "https://www.oc.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "housingType", "loanBalance"],
  },
  {
    id: "OK_HOUSING_002",
    title: "옥천군 청년월세 지원",
    category: "주거 지원",
    region: "옥천군",
    benefit: "월세 일부 지원",
    period: "공고 확인 필요",
    eligibility: "옥천군 거주 만 19~39세 무주택 청년",
    summary: "옥천군 거주 청년의 월세 부담을 줄이는 주거 지원 정책입니다.",
    detail: "소득, 무주택, 월세 거주 여부 등 세부 조건 확인이 필요합니다.",
    requiredDocuments: ["신청서", "주민등록등본", "임대차계약서", "소득 증빙 서류"],
    agency: "옥천군",
    sourceName: "옥천군 청년포털",
    sourceUrl: "https://www.oc.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "housingType", "isHouseOwner", "income"],
  },
  {
    id: "GS_HOUSING_001",
    title: "청년 농촌보금자리 조성사업",
    category: "주거 지원",
    region: "괴산군",
    benefit: "농촌 정착형 주거 지원",
    period: "공고 확인 필요",
    eligibility: "귀농·귀촌 또는 농촌 정착 희망 청년",
    summary: "청년의 농촌 정착을 돕기 위한 주거 기반 지원 정책입니다.",
    detail: "농촌 거주 선호, 가족·보육 고려 여부, 괴산군 관심 여부가 추천에 반영됩니다.",
    requiredDocuments: ["신청서", "정착 계획서", "주민등록등본"],
    agency: "괴산군",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "ruralInterest"],
  },
  {
    id: "GS_STARTUP_001",
    title: "괴산형 청년창업 지원사업",
    category: "창업 지원",
    region: "괴산군",
    benefit: "로컬 창업 사업화 지원",
    period: "공고 확인 필요",
    eligibility: "괴산군 로컬 창업에 관심 있는 청년",
    summary: "청년 창업가를 지역에 육성하고 생활인구 유입을 돕는 정책입니다.",
    detail: "로컬 창업 아이디어, 괴산군 정착 의향, 사업계획 확인이 필요합니다.",
    requiredDocuments: ["신청서", "사업계획서", "주민등록등본"],
    agency: "괴산군",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "region", "startupInterest"],
  },
  {
    id: "CB_STARTUP_001",
    title: "청년 소상공인 창업응원금 지원",
    category: "창업 지원",
    region: "충북 전역",
    benefit: "초기 창업 정착 지원",
    period: "공고 확인 필요",
    eligibility: "청년 창업자 또는 초기 소상공인",
    summary: "청년 창업기업의 초기 정착과 자생력 강화를 지원합니다.",
    detail: "창업 희망 여부, 사업자등록 여부, 창업 기간 확인이 필요합니다.",
    requiredDocuments: ["신청서", "사업자등록증", "사업계획서"],
    agency: "충청북도",
    sourceName: "충북 청년포털",
    sourceUrl: "https://www.chungbuk.go.kr",
    lastChecked: "2026-08-11",
    status: "확인 필요",
    requiredInputs: ["age", "startupInterest", "businessRegistration"],
  },
];

const state = {
  usersByEmail: new Map([["demo@chungbuk.test", {
    id: "demo-user", email: "demo@chungbuk.test", password: "password", name: "리원",
    age: 29, gender: "여성", currentRegion: "서울특별시", major: "공학계열", job: "IT·개발",
    salary: "3,600~4,500만원", rent: "40~50만원", deposit: "1,000~3,000만원",
    transport: "버스", preferredRegions: ["청주시"], recommendRegion: false,
  }]]),
  tokens: new Map([[DEMO_TOKEN, "demo@chungbuk.test"]]),
  savedRegionsByUser: new Map(),
  savedPoliciesByUser: new Map(),
  recommendationHistoryByUser: new Map(),
  checklistByUser: new Map(),
  communityPosts: [
    {
      id: "community_notice_1",
      category: "공지",
      title: "충북올겨 커뮤니티 이용 안내",
      content: "충북 정착 경험, 지역 질문, 정책 후기, 모임 정보를 안전하게 나누는 공간입니다. 개인정보와 확인되지 않은 정책 정보는 주의해서 작성해 주세요.",
      author: { id: "admin", name: "운영자" },
      viewCount: 2481,
      createdAt: "2026-08-01T09:00:00.000Z",
      updatedAt: null,
    },
    {
      id: "community_post_1",
      category: "정착후기",
      title: "청주 오창으로 이사 온 지 6개월 됐어요",
      content: "오창은 산업단지 출퇴근이 편하고 호수공원, 마트, 병원 접근성이 좋아서 처음 정착하기에 부담이 적었습니다. 대중교통만으로도 가능하지만 늦은 시간 이동은 차가 있으면 훨씬 편합니다.",
      author: { id: "seed_user_1", name: "오창새내기" },
      viewCount: 1284,
      createdAt: "2026-08-18T11:20:00.000Z",
      updatedAt: null,
    },
    {
      id: "community_post_2",
      category: "질문",
      title: "충주에서 자가용 없이 생활하기 괜찮을까요?",
      content: "충주역과 터미널 근처 생활권을 보고 있습니다. 직장은 연수동 근처인데 버스 이동만으로 충분한지 궁금합니다.",
      author: { id: "seed_user_2", name: "충주고민중" },
      viewCount: 896,
      createdAt: "2026-08-19T04:40:00.000Z",
      updatedAt: null,
    },
    {
      id: "community_post_3",
      category: "지역정보",
      title: "제천 원룸 구할 때 확인하면 좋은 것들",
      content: "제천은 역 주변과 대학가 분위기가 꽤 다릅니다. 겨울 난방비와 언덕 위치, 버스 배차를 꼭 같이 확인해보세요.",
      author: { id: "seed_user_3", name: "의림지산책" },
      viewCount: 742,
      createdAt: "2026-08-20T08:10:00.000Z",
      updatedAt: null,
    },
    {
      id: "community_post_4",
      category: "정책정보",
      title: "청년 월세 지원 신청 후기 공유합니다",
      content: "임대차계약서, 월세 납부 증빙, 소득 관련 서류를 미리 준비해두면 신청이 수월했습니다. 기준일은 공고마다 다르니 원문을 꼭 다시 확인하세요.",
      author: { id: "seed_user_4", name: "정책알리미" },
      viewCount: 1105,
      createdAt: "2026-08-21T02:30:00.000Z",
      updatedAt: null,
    },
  ],
  communityCommentsByPost: new Map([
    [
      "community_notice_1",
      [
        {
          id: "comment_notice_1",
          postId: "community_notice_1",
          content: "확인했습니다.",
          author: { id: "seed_user_1", name: "오창새내기" },
          createdAt: "2026-08-01T10:00:00.000Z",
          updatedAt: null,
        },
      ],
    ],
    [
      "community_post_1",
      [
        {
          id: "comment_post_1_1",
          postId: "community_post_1",
          content: "오창 쪽 월세는 어느 정도로 보셨나요?",
          author: { id: "seed_user_2", name: "충주고민중" },
          createdAt: "2026-08-18T12:00:00.000Z",
          updatedAt: null,
        },
      ],
    ],
  ]),
  communityReactionsByPost: new Map(),
};

// 통합 개발 서버에서도 목 게시글을 노출하지 않고 사용자가 작성한 글만 유지한다.
state.communityPosts = [];
state.communityCommentsByPost.clear();

function jsonResponse(res, status, payload) {
  const body = JSON.stringify(payload, null, 2);
  res.writeHead(status, {
    "Content-Type": "application/json; charset=utf-8",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,PATCH,DELETE,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  });
  res.end(body);
}

function parsePath(req) {
  const url = new URL(req.url, `http://${req.headers.host}`);
  const parts = url.pathname.split("/").filter(Boolean);
  return { url, parts, pathname: url.pathname };
}

async function readJson(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  if (!chunks.length) return {};
  try {
    return JSON.parse(Buffer.concat(chunks).toString("utf8"));
  } catch {
    const error = new Error("Invalid JSON body");
    error.status = 400;
    throw error;
  }
}

function getUser(req) {
  const header = req.headers.authorization || "";
  const token = header.startsWith("Bearer ") ? header.slice(7) : "";
  const email = state.tokens.get(token);
  return email ? state.usersByEmail.get(email) || null : null;
}

function requireUser(req) {
  const user = getUser(req);
  if (!user) {
    const error = new Error("로그인이 필요한 요청입니다.");
    error.status = 401;
    error.code = "UNAUTHORIZED";
    throw error;
  }
  return user;
}

function toNumberRangeAverage(value, fallback) {
  if (typeof value === "number") return value;
  if (!value || typeof value !== "string") return fallback;
  const matches = [...value.matchAll(/\d[\d,]*/g)].map((m) => Number(m[0].replaceAll(",", "")));
  if (!matches.length) return fallback;
  if (matches.length === 1) return matches[0];
  return Math.round((matches[0] + matches[1]) / 2);
}

function salaryToMonthlyNet(salaryValue) {
  const annual = toNumberRangeAverage(salaryValue, 3000);
  if (annual <= 100) return annual;
  return Math.round((annual / 12) * 0.85);
}

function rentToMonthlyRent(rentValue, fallback) {
  return toNumberRangeAverage(rentValue, fallback);
}

function regionToListItem(region) {
  return {
    id: region.id,
    name: region.area,
    type: region.type,
    description: region.description,
    highlights: region.infrastructure.slice(0, 4),
    image: region.image,
    imageSource: region.imageSource,
  };
}

function regionToDetail(region) {
  return {
    id: region.id,
    name: region.name,
    area: region.area,
    score: region.scoreBase,
    type: region.type,
    reasons: [
      region.description,
      `${region.infrastructure.slice(0, 2).join(", ")} 중심으로 생활권을 확인할 수 있습니다.`,
      "정책 신청 가능 여부는 신청 시점의 원문 공고 확인이 필요합니다.",
    ],
    rent: region.averageRent,
    commute: region.averageCommute,
    carNeed: region.carNeed,
    transportScore: region.transportScore,
    commuteBasis: {
      origin: region.name,
      destination: region.infrastructure[0],
      method: "백엔드 지역별 대표 생활권 기준 편도 예상시간",
      caution: "실시간 길찾기 결과가 아니며 실제 근무지, 시간대, 교통수단에 따라 달라질 수 있습니다.",
    },
    infrastructure: region.infrastructure,
    policyCount: region.relatedPolicyIds.length,
    relatedPolicyIds: region.relatedPolicyIds,
    image: region.image,
    imageSource: region.imageSource,
  };
}

function scoreRegion(region, condition = {}) {
  let score = region.scoreBase;
  const job = condition.job || "";
  const preferredRegions = condition.preferredRegions || [];
  const rentBudget = rentToMonthlyRent(condition.rent, region.averageRent);

  if (region.jobKeywords.some((keyword) => job.includes(keyword) || keyword.includes(job))) score += 8;
  if (preferredRegions.includes(region.area)) score += 10;
  if (condition.recommendRegion === true) score += 2;
  if (rentBudget >= region.averageRent) score += 6;
  if (condition.transport && condition.transport !== "자가용" && ["권장", "필요"].includes(region.carNeed)) score -= 8;
  if (condition.transport === "자가용" && ["권장", "필요", "있으면 편리"].includes(region.carNeed)) score += 3;

  return Math.max(0, Math.min(100, score));
}

function recommendRegions(condition = {}) {
  const candidates = condition.recommendRegion
    ? regions
    : regions.filter((region) => (condition.preferredRegions || []).includes(region.area));
  const source = candidates.length ? candidates : regions;
  return source
    .map((region) => {
      const score = scoreRegion(region, condition);
      const policyCount = region.relatedPolicyIds.length;
      return {
        id: region.id,
        name: region.name,
        area: region.area,
        score,
        type: region.type,
        reasons: [
          `${condition.job || "희망 직무"} 조건과 연결되는 지역 키워드가 있습니다.`,
          `예상 월세는 약 ${region.averageRent}만원입니다.`,
          `확인 가능한 정책 후보가 ${policyCount}개 있습니다.`,
        ],
        rent: region.averageRent,
        commute: region.averageCommute,
        carNeed: region.carNeed,
        infrastructure: region.infrastructure,
        policyCount,
        image: region.image,
        imageSource: region.imageSource,
      };
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
}

function parseAge(value) {
  if (typeof value === "number") return value;
  const match = String(value || "").match(/\d+/);
  return match ? Number(match[0]) : null;
}

function toAiHousingType(condition = {}) {
  const value = `${condition.rent || ""} ${condition.deposit || ""}`;
  if (value.includes("전세")) return "전세";
  if (value.includes("자가") || value.includes("매매")) return "자가";
  if (condition.rent && !String(condition.rent).includes("정하지")) return "월세";
  return "기타";
}

function toAiEmploymentStatus(job = "") {
  if (["무직", "대학생"].some((keyword) => job.includes(keyword))) return "미취업";
  if (job.includes("창업")) return "창업준비중";
  if (job) return "재직중";
  return "기타";
}

function toAiTransportation(transport = "") {
  if (transport === "자가용") return "자가용";
  if (["버스", "기차", "도보", "자전거"].includes(transport)) return "대중교통";
  return "기타";
}

function toAiInterests(condition = {}) {
  const interests = new Set(["주거"]);
  const job = condition.job || "";
  if (job && !["무직", "대학생"].includes(job)) interests.add("취업");
  if (job.includes("창업")) interests.add("창업");
  if (job.includes("농업")) interests.add("농촌");
  if (`${condition.rent || ""} ${condition.deposit || ""}`.includes("전세")) interests.add("금융");
  return [...interests];
}

function toAiRecommendationRequest(condition = {}) {
  return {
    age: parseAge(condition.age),
    preferred_region: condition.recommendRegion ? null : condition.preferredRegions?.[0] || null,
    housing_type: toAiHousingType(condition),
    monthly_income: salaryToMonthlyNet(condition.salary) * 10000,
    is_house_owner: condition.rent === "전세·매매 희망" ? null : false,
    employment_status: toAiEmploymentStatus(condition.job),
    startup_interest: condition.job?.includes("창업") || false,
    rural_interest: condition.job?.includes("농업") || false,
    newlywed: null,
    has_loan: null,
    needs_housing_loan: condition.deposit?.includes("5,000만원 이상") || false,
    transportation: toAiTransportation(condition.transport),
    interests: toAiInterests(condition),
  };
}

async function requestAiRecommendations(condition = {}) {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), Number(process.env.AI_RECOMMENDATION_TIMEOUT_MS || 1200));
  try {
    const response = await fetch(`${AI_BASE_URL}/recommend`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(toAiRecommendationRequest(condition)),
      signal: controller.signal,
    });
    const data = await response.json();
    if (!response.ok) {
      const error = new Error(data?.detail ? JSON.stringify(data.detail) : "AI recommendation request failed");
      error.status = response.status;
      throw error;
    }
    return data;
  } finally {
    clearTimeout(timeout);
  }
}

function aiRegionToRecommendation(item, condition = {}) {
  const region = findRegionOrNull(item.region) || regions.find((candidate) => candidate.area === item.region);
  if (!region) return null;
  return {
    id: region.id,
    name: region.name,
    area: region.area,
    score: item.match_score,
    type: item.region_type || region.type,
    reasons: item.reasons?.length ? item.reasons : [
      `${condition.job || "입력 조건"} 기준으로 생활권을 비교했습니다.`,
      "추천 정책과 함께 검토할 수 있는 지역입니다.",
    ],
    rent: region.averageRent,
    commute: region.averageCommute,
    carNeed: region.carNeed,
    infrastructure: region.infrastructure,
    policyCount: item.recommended_policy_names?.length || region.relatedPolicyIds.length,
    image: region.image,
    imageSource: region.imageSource,
    source: "ai",
  };
}

async function recommendRegionsWithAiFallback(condition = {}) {
  try {
    const aiResult = await requestAiRecommendations(condition);
    const items = (aiResult.regions || []).map((item) => aiRegionToRecommendation(item, condition)).filter(Boolean);
    return items.length ? items : recommendRegions(condition);
  } catch (error) {
    console.warn("AI recommendation service unavailable. Falling back to backend MVP rules.", error.message);
    return recommendRegions(condition);
  }
}

function aiPolicyToRecommendation(item) {
  const policy = policies.find((candidate) => candidate.id === item.policy_id);
  const base = policy ? policyListItem(policy) : {
    id: item.policy_id,
    title: item.policy_name,
    category: item.category,
    region: item.region,
    benefit: item.support_summary,
    period: "공고 확인 필요",
    eligibility: "세부 조건 확인 필요",
    summary: item.reason,
    status: "확인 필요",
    lastChecked: null,
  };
  return {
    ...base,
    matchScore: item.match_score,
    matchLevel: item.match_level === "높음" ? "가능성 높음" : item.match_level === "중간" ? "추가 확인 필요" : "가능성 낮음",
    matchedConditions: item.matched_factors || [],
    missingFields: item.missing_info || [],
    recommendReason: item.reason,
    caution: item.caution,
  };
}

async function recommendPoliciesWithAiFallback(condition = {}) {
  try {
    const aiResult = await requestAiRecommendations(condition);
    const items = (aiResult.policies || []).map(aiPolicyToRecommendation);
    return items.length ? items : mockAiPolicyRecommendations(condition);
  } catch (error) {
    console.warn("AI policy recommendation service unavailable. Falling back to backend MVP rules.", error.message);
    return mockAiPolicyRecommendations(condition);
  }
}

function saveRecommendationIfNeeded(user, body, items) {
  if (!body.persist || !user) return null;
  const record = {
    id: `rec_${randomUUID().slice(0, 8)}`,
    createdAt: new Date().toISOString(),
    condition: body.condition,
    items,
    persisted: true,
  };
  const list = state.recommendationHistoryByUser.get(user.id) || [];
  list.unshift(record);
  state.recommendationHistoryByUser.set(user.id, list);
  return record;
}

function filterPolicies(query) {
  const category = query.get("category");
  const region = query.get("region");
  const keyword = query.get("keyword");
  const status = query.get("status");
  return policies.filter((policy) => {
    if (category && !policy.category.includes(category)) return false;
    if (region && policy.region !== region && policy.region !== "충북 전역") return false;
    if (keyword && !`${policy.title} ${policy.summary} ${policy.benefit}`.includes(keyword)) return false;
    if (status && policy.status !== status) return false;
    return true;
  });
}

function policyListItem(policy) {
  return {
    id: policy.id,
    title: policy.title,
    category: policy.category,
    region: policy.region,
    benefit: policy.benefit,
    period: policy.period,
    eligibility: policy.eligibility,
    summary: policy.summary,
    status: policy.status,
    lastChecked: policy.lastChecked,
  };
}

function policyDetail(policy) {
  return {
    ...policyListItem(policy),
    detail: policy.detail,
    requiredDocuments: policy.requiredDocuments,
    agency: policy.agency,
    applyUrl: policy.sourceUrl,
    sourceName: policy.sourceName,
    sourceUrl: policy.sourceUrl,
    caution: "정확한 신청 가능 여부는 신청 시점의 원문 공고와 담당 기관 확인이 필요합니다.",
  };
}

function mockAiPolicyRecommendations(condition = {}) {
  return policies
    .map((policy) => {
      let score = 40;
      const matched = [];
      if (condition.age) {
        score += 15;
        matched.push("청년 연령대 입력");
      }
      if ((condition.preferredRegions || []).includes(policy.region) || policy.region === "충북 전역") {
        score += 20;
        matched.push("희망 지역과 정책 지역 연결");
      }
      if (condition.rent && policy.category.includes("주거")) {
        score += 15;
        matched.push("월세/주거 조건 입력");
      }
      if (condition.job && policy.category.includes("일자리")) {
        score += 15;
        matched.push("직무/취업 조건 입력");
      }
      if ((condition.interestedCategories || []).some((item) => policy.category.includes(item))) {
        score += 10;
        matched.push("관심 정책 분야 일치");
      }
      if (condition.startupInterest && policy.category.includes("창업")) {
        score += 15;
        matched.push("창업 관심 조건 입력");
      }
      const matchScore = Math.min(100, score);
      const matchLevel = matchScore >= 80 ? "가능성 높음" : matchScore >= 60 ? "추가 확인 필요" : "가능성 낮음";
      return {
        ...policyListItem(policy),
        matchScore,
        matchLevel,
        matchedConditions: matched,
        missingFields: policy.requiredInputs.filter((field) => !JSON.stringify(condition).includes(field)),
        recommendReason: `${policy.title}은 입력한 조건 기준으로 ${matchLevel} 정책입니다.`,
        caution: "정확한 신청 가능 여부는 신청 시점의 원문 공고와 담당 기관 확인이 필요합니다.",
      };
    })
    .filter((item) => item.matchScore >= 55)
    .sort((a, b) => b.matchScore - a.matchScore)
    .slice(0, 5);
}

function calculateCost(body) {
  const region = findRegion(body.regionId);
  const monthlyNet = body.income?.monthlyIncome || salaryToMonthlyNet(body.income?.salary);
  const rent = rentToMonthlyRent(body.housing?.rent, region.averageRent);
  const maintenanceFee = body.housing?.maintenanceFee ?? region.averageMaintenanceFee;
  const transportCost = transportMonthlyCost(body.transport?.type || "버스", region.carNeed);
  const costs = {
    rent,
    maintenanceFee,
    food: 48,
    transportation: transportCost,
    telecom: 7,
    utilities: 10,
    otherLiving: 36,
  };
  costs.totalMonthlyCost = Object.values(costs).reduce((sum, value) => sum + value, 0);
  const support = body.policy?.includeSupport ? Number(body.policy?.monthlySupportAmount || 0) : 0;
  const monthlyBalance = monthlyNet + support - costs.totalMonthlyCost;
  const savingPossibleAmount = Math.max(0, Math.round(monthlyBalance * 0.7));
  const initialRequiredAmount = Number(body.housing?.deposit || 500) + 50 + rent + maintenanceFee + 80;
  return {
    userId: body.userId || null,
    regionId: region.id,
    regionName: region.name,
    income: {
      monthlyGrossIncome: body.income?.monthlyIncome || Math.round(toNumberRangeAverage(body.income?.salary, 3000) / 12),
      estimatedMonthlyNetIncome: monthlyNet,
    },
    costs,
    policySupport: {
      included: Boolean(body.policy?.includeSupport),
      monthlyAmount: support,
    },
    result: {
      monthlyBalance,
      savingPossibleAmount,
      initialRequiredAmount,
      rentBurdenRate: Number(((rent / monthlyNet) * 100).toFixed(1)),
      stabilityLevel: monthlyBalance >= 80 ? "안정" : monthlyBalance >= 30 ? "보통" : monthlyBalance >= 0 ? "주의" : "위험",
    },
    cautions: [
      "생활비 계산 결과는 입력값과 지역 평균 데이터를 바탕으로 한 예상값입니다.",
      "정책지원금은 실제 선정 여부에 따라 달라질 수 있습니다.",
    ],
  };
}

function transportMonthlyCost(type, carNeed) {
  if (type === "자가용") return carNeed === "필요" ? 32 : 24;
  if (type === "기차") return 18;
  if (type === "도보" || type === "자전거") return 0;
  return carNeed === "필요" ? 18 : 12;
}

function calculateCommute(body) {
  const region = findRegion(body.regionId);
  const type = body.transport?.type || "버스";
  const max = Number(body.transport?.maxCommuteMinutes || 40);
  let oneWay = region.averageCommute;
  if (type === "자가용") oneWay = Math.max(10, oneWay - 8);
  if (type === "도보") oneWay += 25;
  if (type === "자전거") oneWay += 10;
  if (type === "버스" && ["권장", "필요"].includes(region.carNeed)) oneWay += 10;
  const possible = oneWay <= max;
  return {
    userId: body.userId || null,
    regionId: region.id,
    regionName: region.name,
    job: body.job || null,
    origin: body.origin || { name: region.name },
    destination: body.destination || { name: region.infrastructure[0] },
    transportType: type,
    estimatedOneWayMinutes: oneWay,
    estimatedRoundTripMinutes: oneWay * 2,
    maxCommuteMinutes: max,
    isCommutePossible: possible,
    monthlyTransportationCost: transportMonthlyCost(type, region.carNeed),
    carNeed: possible ? region.carNeed : region.carNeed === "필요" ? "필요" : "권장",
    commuteLevel: possible ? "적합" : oneWay <= max + 15 ? "주의" : "어려움",
    cautions: [
      "출퇴근 계산 결과는 대표 생활권과 교통 데이터를 기준으로 한 예상값입니다.",
      "실제 소요 시간은 근무지 위치, 시간대, 배차 간격에 따라 달라질 수 있습니다.",
    ],
  };
}

function mockAiChat(body) {
  const message = body.message || "";
  const regionIds = body.context?.regionIds || [];
  const relatedRegions = regionIds.map((id) => findRegionOrNull(id)).filter(Boolean).map((region) => ({ id: region.id, name: region.name }));
  const policyIds = body.context?.policyIds || [];
  const relatedPolicies = policyIds.map((id) => policies.find((policy) => policy.id === id)).filter(Boolean).map((policy) => ({ id: policy.id, title: policy.title }));
  return {
    sessionId: body.sessionId || `chat_${randomUUID().slice(0, 8)}`,
    answerId: `msg_${randomUUID().slice(0, 8)}`,
    answer: `${message} 질문에 대해 입력한 조건 기준으로 확인해볼게요. 교통, 주거비, 정책 가능성은 지역별로 차이가 있으므로 추천 결과와 생활비 계산을 함께 보는 것이 좋습니다.`,
    summary: "입력 조건 기준으로 지역, 정책, 생활비를 함께 비교하는 답변입니다.",
    basis: [
      "사용자가 전달한 정착 조건",
      "MVP 지역 데이터",
      "정책 후보 및 생활비 계산 결과",
    ],
    relatedRegions,
    relatedPolicies,
    suggestedActions: [
      "정책지원금을 제외한 생활비도 다시 계산해보세요.",
      "차량이 없다면 출퇴근 시뮬레이션을 먼저 확인하세요.",
      "정책 상세에서 원문 공고와 제출 서류를 확인하세요.",
    ],
    needsMoreInfo: !body.condition,
    followUpQuestions: body.condition ? [] : ["나이, 소득, 이동수단 정보를 알려주면 더 정확히 비교할 수 있어요."],
    caution: "AI 상담은 참고 정보이며 정책 신청 가능 여부와 제출 서류는 원문 공고와 담당 기관을 확인해 주세요.",
  };
}

function checklistForPolicy(policy) {
  const base = [
    {
      id: "item_age",
      section: "자격 조건",
      label: "정책 대상 연령에 해당하는지 확인",
      description: policy.eligibility,
      required: true,
      defaultChecked: false,
    },
    {
      id: "item_region",
      section: "자격 조건",
      label: `${policy.region} 거주 또는 전입 조건 확인`,
      description: "신청 기준일의 주민등록상 거주지 조건을 확인해야 합니다.",
      required: true,
      defaultChecked: false,
    },
  ];
  const documents = policy.requiredDocuments.map((doc, index) => ({
    id: `doc_${index + 1}`,
    section: "필요 서류",
    label: `${doc} 준비`,
    description: "원문 공고 기준으로 최신 양식과 발급일 조건을 확인하세요.",
    required: true,
    defaultChecked: false,
  }));
  return {
    policyId: policy.id,
    policyTitle: policy.title,
    checklist: [...base, ...documents],
    caution: "정확한 신청 가능 여부와 제출 서류는 신청 시점의 원문 공고와 담당 기관을 반드시 확인해 주세요.",
    sourceUrl: policy.sourceUrl,
    lastChecked: policy.lastChecked,
  };
}

function findRegion(id) {
  const region = findRegionOrNull(id);
  if (!region) {
    const error = new Error("해당 지역 정보를 찾을 수 없습니다.");
    error.status = 404;
    error.code = "REGION_NOT_FOUND";
    throw error;
  }
  return region;
}

function findRegionOrNull(id) {
  return regions.find((region) => region.id === id || region.area === id) || null;
}

function findPolicy(id) {
  const policy = policies.find((item) => item.id === id);
  if (!policy) {
    const error = new Error("해당 정책 정보를 찾을 수 없습니다.");
    error.status = 404;
    error.code = "POLICY_NOT_FOUND";
    throw error;
  }
  return policy;
}

function getMapList(map, userId) {
  const list = map.get(userId) || [];
  map.set(userId, list);
  return list;
}

function addUniqueSaved(list, key, data) {
  const found = list.find((item) => item[key] === data[key]);
  if (found) return { item: found, alreadySaved: true };
  list.unshift(data);
  return { item: data, alreadySaved: false };
}

const communityCategoryAliases = {
  전체글: [],
  "정착 후기": ["정착후기"],
  "지역 질문": ["질문"],
  "지역 정보": ["지역정보"],
  "정책 정보": ["정책정보"],
  "모임·동행": ["모임"],
  자유게시판: ["자유게시판", "일상"],
};

const communityCategories = ["정착후기", "질문", "지역정보", "정책정보", "모임", "자유게시판"];

function getCommunityComments(postId) {
  const comments = state.communityCommentsByPost.get(postId) || [];
  state.communityCommentsByPost.set(postId, comments);
  return comments;
}

function getCommunityReactions(postId) {
  const reactions = state.communityReactionsByPost.get(postId) || new Set();
  state.communityReactionsByPost.set(postId, reactions);
  return reactions;
}

function communityListItem(post) {
  return {
    id: post.id,
    category: post.category,
    title: post.title,
    excerpt: post.content.length > 120 ? `${post.content.slice(0, 120).trim()}...` : post.content,
    author: post.author,
    authorName: post.author.name,
    viewCount: post.viewCount,
    commentCount: getCommunityComments(post.id).length,
    likeCount: getCommunityReactions(post.id).size,
    createdAt: post.createdAt,
    updatedAt: post.updatedAt,
  };
}

function communityDetail(post) {
  return {
    ...communityListItem(post),
    content: post.content,
    comments: getCommunityComments(post.id).map((comment) => ({
      ...comment,
      authorName: comment.author.name,
    })),
  };
}

function findCommunityPost(postId) {
  const post = state.communityPosts.find((item) => item.id === postId);
  if (!post) {
    const error = new Error("게시글을 찾을 수 없습니다.");
    error.status = 404;
    error.code = "COMMUNITY_POST_NOT_FOUND";
    throw error;
  }
  return post;
}

function validateCommunityPostBody(body) {
  const category = String(body.category || "").trim();
  const title = String(body.title || "").trim();
  const content = String(body.content || "").trim();
  if (!communityCategories.includes(category)) {
    const error = new Error("지원하지 않는 커뮤니티 게시판입니다.");
    error.status = 400;
    error.code = "INVALID_COMMUNITY_CATEGORY";
    throw error;
  }
  if (title.length < 2 || title.length > 80) {
    const error = new Error("제목은 2자 이상 80자 이하로 입력해주세요.");
    error.status = 400;
    error.code = "INVALID_COMMUNITY_TITLE";
    throw error;
  }
  if (content.length < 5 || content.length > 3000) {
    const error = new Error("내용은 5자 이상 3000자 이하로 입력해주세요.");
    error.status = 400;
    error.code = "INVALID_COMMUNITY_CONTENT";
    throw error;
  }
  return { category, title, content };
}

function validateCommunityCommentBody(body) {
  const content = String(body.content || "").trim();
  if (!content || content.length > 500) {
    const error = new Error("댓글은 1자 이상 500자 이하로 입력해주세요.");
    error.status = 400;
    error.code = "INVALID_COMMUNITY_COMMENT";
    throw error;
  }
  return { content };
}

function toPositiveInteger(value, fallback) {
  const number = Number(value);
  return Number.isInteger(number) && number > 0 ? number : fallback;
}

function filterCommunityPosts(searchParams) {
  const category = searchParams.get("category") || "전체글";
  const keyword = (searchParams.get("q") || "").trim().toLowerCase();
  const tab = searchParams.get("tab") || "home";
  const page = toPositiveInteger(searchParams.get("page"), 1);
  const pageSize = Math.min(30, toPositiveInteger(searchParams.get("pageSize"), 10));
  const categories = communityCategoryAliases[category] || (category === "전체글" ? [] : [category]);

  const filtered = state.communityPosts
    .filter((post) => !categories.length || categories.includes(post.category))
    .filter((post) => !keyword || `${post.title} ${post.content} ${post.author.name}`.toLowerCase().includes(keyword))
    .sort((a, b) => {
      if (tab === "popular") return b.viewCount - a.viewCount || Date.parse(b.createdAt) - Date.parse(a.createdAt);
      if (a.category === "공지" && b.category !== "공지") return -1;
      if (a.category !== "공지" && b.category === "공지") return 1;
      return Date.parse(b.createdAt) - Date.parse(a.createdAt);
    });

  const total = filtered.length;
  return {
    posts: filtered.slice((page - 1) * pageSize, page * pageSize).map(communityListItem),
    meta: {
      page,
      pageSize,
      total,
      totalPages: Math.max(1, Math.ceil(total / pageSize)),
    },
  };
}

async function router(req, res) {
  const { url, parts, pathname } = parsePath(req);
  if (req.method === "OPTIONS") return jsonResponse(res, 204, {});

  if (req.method === "GET" && pathname === "/api/health") {
    return jsonResponse(res, 200, { status: "ok", service: "chungbuk-olgyeo-backend", time: new Date().toISOString() });
  }

  if (req.method === "POST" && pathname === "/api/auth/signup") {
    const body = await readJson(req);
    if (!body.email || !/^\S+@\S+\.\S+$/.test(body.email)) return jsonResponse(res, 400, { message: "올바른 이메일 형식을 입력해주세요." });
    if (!body.password || body.password.length < 6) return jsonResponse(res, 400, { message: "비밀번호는 6자 이상이어야 합니다." });
    if (!body.name) return jsonResponse(res, 400, { message: "이름을 입력해주세요." });
    if (state.usersByEmail.has(body.email)) return jsonResponse(res, 409, { message: "이미 가입된 이메일입니다." });
    const user = { id: randomUUID(), email: body.email, password: body.password, name: body.name };
    state.usersByEmail.set(body.email, user);
    return jsonResponse(res, 201, { id: user.id, email: user.email, name: user.name });
  }

  if (req.method === "POST" && pathname === "/api/auth/login") {
    const body = await readJson(req);
    const user = state.usersByEmail.get(body.email);
    if (!user || user.password !== body.password) return jsonResponse(res, 401, { message: "이메일 또는 비밀번호가 올바르지 않습니다." });
    const accessToken = randomUUID();
    state.tokens.set(accessToken, user.email);
    return jsonResponse(res, 200, { accessToken, user: { id: user.id, email: user.email, name: user.name } });
  }

  if (req.method === "GET" && pathname === "/api/regions") {
    const keyword = url.searchParams.get("keyword");
    const payload = regions.filter((region) => !keyword || `${region.area} ${region.name}`.includes(keyword)).map(regionToListItem);
    return jsonResponse(res, 200, { regions: payload });
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "regions" && parts[2]) {
    return jsonResponse(res, 200, regionToDetail(findRegion(parts[2])));
  }

  if (req.method === "POST" && pathname === "/api/recommendations") {
    const body = await readJson(req);
    if (!body.condition) return jsonResponse(res, 400, { code: "INVALID_RECOMMENDATION_CONDITION", message: "추천 조건이 올바르지 않습니다." });
    const user = getUser(req);
    const items = await recommendRegionsWithAiFallback(body.condition);
    const record = saveRecommendationIfNeeded(user, body, items);
    return jsonResponse(res, 200, record ? { recommendationId: record.id, items } : items);
  }

  if (req.method === "GET" && pathname === "/api/users/me/recommendations") {
    const user = requireUser(req);
    const list = getMapList(state.recommendationHistoryByUser, user.id).map((item) => ({
      id: item.id,
      createdAt: item.createdAt,
      conditionSummary: `${item.condition?.job || "-"} / 월세 ${item.condition?.rent || "-"} / ${item.condition?.transport || "-"}`,
      topRegion: item.items[0] ? { id: item.items[0].id, name: item.items[0].name, score: item.items[0].score } : null,
      regionCount: item.items.length,
      persisted: true,
    }));
    return jsonResponse(res, 200, { recommendations: list });
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "recommendations" && parts[2]) {
    const user = requireUser(req);
    const record = getMapList(state.recommendationHistoryByUser, user.id).find((item) => item.id === parts[2]);
    if (!record) return jsonResponse(res, 404, { code: "RECOMMENDATION_NOT_FOUND", message: "추천 결과를 찾을 수 없습니다." });
    return jsonResponse(res, 200, record);
  }

  if (req.method === "GET" && pathname === "/api/policies") {
    return jsonResponse(res, 200, filterPolicies(url.searchParams).map(policyListItem));
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "policies" && parts[2] && parts[3] !== "checklist") {
    return jsonResponse(res, 200, policyDetail(findPolicy(parts[2])));
  }

  if (req.method === "POST" && pathname === "/api/policies/recommendations") {
    const body = await readJson(req);
    const recommendedPolicies = await recommendPoliciesWithAiFallback(body.condition || {});
    return jsonResponse(res, 200, { userId: body.userId || null, recommendedPolicies });
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "policies" && parts[2] && parts[3] === "checklist") {
    return jsonResponse(res, 200, checklistForPolicy(findPolicy(parts[2])));
  }

  if (req.method === "POST" && pathname === "/api/cost-simulations") {
    return jsonResponse(res, 200, calculateCost(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/api/commute-simulations") {
    return jsonResponse(res, 200, calculateCommute(await readJson(req)));
  }

  if (req.method === "POST" && pathname === "/api/ai/chat") {
    const body = await readJson(req);
    if (!body.message) return jsonResponse(res, 400, { code: "INVALID_AI_CHAT_REQUEST", message: "질문 내용이 필요합니다." });
    return jsonResponse(res, 200, mockAiChat(body));
  }

  if (req.method === "GET" && pathname === "/api/community/posts") {
    return jsonResponse(res, 200, filterCommunityPosts(url.searchParams));
  }

  if (req.method === "POST" && pathname === "/api/community/posts") {
    const user = requireUser(req);
    const body = validateCommunityPostBody(await readJson(req));
    const post = {
      id: `community_post_${randomUUID().slice(0, 8)}`,
      category: body.category,
      title: body.title,
      content: body.content,
      author: { id: user.id, name: user.name },
      viewCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    state.communityPosts.unshift(post);
    return jsonResponse(res, 201, communityListItem(post));
  }

  if (req.method === "GET" && parts[0] === "api" && parts[1] === "community" && parts[2] === "posts" && parts[3] && !parts[4]) {
    const post = findCommunityPost(parts[3]);
    post.viewCount += 1;
    return jsonResponse(res, 200, communityDetail(post));
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "community" && parts[2] === "posts" && parts[3] && parts[4] === "comments") {
    const user = requireUser(req);
    const post = findCommunityPost(parts[3]);
    const body = validateCommunityCommentBody(await readJson(req));
    const comment = {
      id: `community_comment_${randomUUID().slice(0, 8)}`,
      postId: post.id,
      content: body.content,
      author: { id: user.id, name: user.name },
      createdAt: new Date().toISOString(),
      updatedAt: null,
    };
    getCommunityComments(post.id).push(comment);
    return jsonResponse(res, 201, { ...comment, authorName: comment.author.name });
  }

  if (req.method === "POST" && parts[0] === "api" && parts[1] === "community" && parts[2] === "posts" && parts[3] && parts[4] === "reactions") {
    const user = requireUser(req);
    const post = findCommunityPost(parts[3]);
    const reactions = getCommunityReactions(post.id);
    const liked = !reactions.has(user.id);
    if (liked) reactions.add(user.id);
    else reactions.delete(user.id);
    return jsonResponse(res, 200, { postId: post.id, liked, likeCount: reactions.size });
  }

  if (req.method === "DELETE" && parts[0] === "api" && parts[1] === "community" && parts[2] === "posts" && parts[3] && !parts[4]) {
    const user = requireUser(req);
    const post = findCommunityPost(parts[3]);
    if (post.author.id !== user.id) return jsonResponse(res, 403, { message: "본인이 작성한 게시글만 삭제할 수 있습니다." });
    state.communityPosts.splice(state.communityPosts.indexOf(post), 1);
    state.communityCommentsByPost.delete(post.id);
    state.communityReactionsByPost.delete(post.id);
    return jsonResponse(res, 200, { deleted: true, postId: post.id });
  }

  if (req.method === "DELETE" && parts[0] === "api" && parts[1] === "community" && parts[2] === "posts" && parts[3] && parts[4] === "comments" && parts[5]) {
    const user = requireUser(req);
    const post = findCommunityPost(parts[3]);
    const comments = getCommunityComments(post.id);
    const index = comments.findIndex((item) => item.id === parts[5]);
    if (index < 0) return jsonResponse(res, 404, { message: "댓글을 찾을 수 없습니다." });
    if (comments[index].author.id !== user.id) return jsonResponse(res, 403, { message: "본인이 작성한 댓글만 삭제할 수 있습니다." });
    comments.splice(index, 1);
    return jsonResponse(res, 200, { deleted: true, commentId: parts[5] });
  }

  if (parts[0] === "api" && parts[1] === "users" && parts[2] === "me") {
    const user = requireUser(req);

    if (parts.length === 3 && req.method === "GET") {
      const { password: _password, ...profile } = user;
      return jsonResponse(res, 200, profile);
    }
    if (parts.length === 3 && req.method === "PATCH") {
      const body = await readJson(req);
      Object.assign(user, body, { email: user.email, id: user.id, password: user.password });
      const { password: _password, ...profile } = user;
      return jsonResponse(res, 200, profile);
    }

    if (req.method === "GET" && parts[3] === "saved-regions") {
      return jsonResponse(res, 200, { savedRegions: getMapList(state.savedRegionsByUser, user.id) });
    }
    if (req.method === "POST" && parts[3] === "saved-regions") {
      const body = await readJson(req);
      const region = findRegion(body.regionId);
      const list = getMapList(state.savedRegionsByUser, user.id);
      const { item, alreadySaved } = addUniqueSaved(list, "regionId", {
        id: `saved_region_${randomUUID().slice(0, 8)}`,
        regionId: region.id,
        name: region.name,
        area: region.area,
        type: region.type,
        score: region.scoreBase,
        image: region.image,
        memo: body.memo || null,
        savedAt: new Date().toISOString(),
      });
      return jsonResponse(res, alreadySaved ? 200 : 201, { ...item, saved: true, alreadySaved });
    }
    if (req.method === "DELETE" && parts[3] === "saved-regions" && parts[4]) {
      const list = getMapList(state.savedRegionsByUser, user.id);
      const index = list.findIndex((item) => item.regionId === parts[4]);
      if (index >= 0) list.splice(index, 1);
      return jsonResponse(res, 200, { regionId: parts[4], deleted: index >= 0 });
    }

    if (req.method === "GET" && parts[3] === "saved-policies") {
      return jsonResponse(res, 200, { savedPolicies: getMapList(state.savedPoliciesByUser, user.id) });
    }
    if (req.method === "POST" && parts[3] === "saved-policies") {
      const body = await readJson(req);
      const policy = findPolicy(body.policyId);
      const list = getMapList(state.savedPoliciesByUser, user.id);
      const { item, alreadySaved } = addUniqueSaved(list, "policyId", {
        id: `saved_policy_${randomUUID().slice(0, 8)}`,
        policyId: policy.id,
        title: policy.title,
        category: policy.category,
        region: policy.region,
        benefit: policy.benefit,
        status: policy.status,
        memo: body.memo || null,
        savedAt: new Date().toISOString(),
      });
      return jsonResponse(res, alreadySaved ? 200 : 201, { ...item, saved: true, alreadySaved });
    }
    if (req.method === "DELETE" && parts[3] === "saved-policies" && parts[4]) {
      const list = getMapList(state.savedPoliciesByUser, user.id);
      const index = list.findIndex((item) => item.policyId === parts[4]);
      if (index >= 0) list.splice(index, 1);
      return jsonResponse(res, 200, { policyId: parts[4], deleted: index >= 0 });
    }

    if (req.method === "PATCH" && parts[3] === "policy-checklists" && parts[4]) {
      findPolicy(parts[4]);
      const body = await readJson(req);
      const key = `${user.id}:${parts[4]}`;
      const item = {
        policyId: parts[4],
        checkedItems: body.checkedItems || [],
        updatedAt: new Date().toISOString(),
      };
      state.checklistByUser.set(key, item);
      return jsonResponse(res, 200, item);
    }
  }

  return jsonResponse(res, 404, { code: "NOT_FOUND", message: "요청한 API를 찾을 수 없습니다." });
}

const server = http.createServer(async (req, res) => {
  try {
    await router(req, res);
  } catch (error) {
    jsonResponse(res, error.status || 500, {
      code: error.code || (error.status === 400 ? "BAD_REQUEST" : "INTERNAL_SERVER_ERROR"),
      message: error.message || "서버 내부 오류",
    });
  }
});

server.listen(PORT, () => {
  console.log(`Chungbuk Olgyeo backend listening on http://localhost:${PORT}`);
});
