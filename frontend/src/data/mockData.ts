import type { Municipality, Policy, RegionRecommendation } from "../types";

export const REGIONS = ["청주시", "충주시", "진천군", "옥천군", "괴산군"];

export const REGION_RECOMMENDATIONS: RegionRecommendation[] = [
  { id: "cheongju", name: "청주시 오창읍", area: "청주시", score: 94, type: "산업단지 직장인형", reasons: ["IT·반도체 일자리 접근성", "생활 인프라와 교통 균형", "청년 지원정책 다수"], rent: 58, commute: 28, carNeed: "있으면 편리", infrastructure: ["충북대병원", "오창호수공원", "대형마트", "청주공항"], policyCount: 12, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Sangdangsangseong.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Cheongju_Sangdangsangseong.jpg" },
  { id: "jincheon", name: "진천·음성 충북혁신도시", area: "진천군", score: 89, type: "혁신도시 정착형", reasons: ["공공기관·산업단지 인접", "신축 주거지 비율이 높음", "청주·수도권 이동 편리"], rent: 52, commute: 24, carNeed: "권장", infrastructure: ["혁신도시터미널", "공공도서관", "종합병원", "수변공원"], policyCount: 9, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon_Nongdari_Bridge_20200716_160025.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg" },
  { id: "chungju", name: "충주시 연수동", area: "충주시", score: 86, type: "중심 생활권형", reasons: ["합리적인 주거비", "상권·문화시설 밀집", "충주역과 버스터미널 접근성"], rent: 45, commute: 22, carNeed: "선택", infrastructure: ["충주역", "건국대병원", "호암지", "대형마트"], policyCount: 8, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg" },
  { id: "okcheon", name: "옥천군 옥천읍", area: "옥천군", score: 81, type: "소도시·농촌형", reasons: ["낮은 생활비", "대전 접근성", "조용한 정착 환경"], rent: 38, commute: 25, carNeed: "권장", infrastructure: ["옥천역", "대청호 생활권", "옥천군청", "전통시장"], policyCount: 7, image: "https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:옥천성당.jpg" },
  { id: "goesan", name: "괴산군 괴산읍", area: "괴산군", score: 77, type: "농촌형", reasons: ["농촌 정착 지원", "로컬 창업 기회", "자연 친화 환경"], rent: 32, commute: 30, carNeed: "필요", infrastructure: ["괴산군청", "괴산읍 생활권", "산막이옛길", "전통시장"], policyCount: 11, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Oeryong-ri,_Buljeong-myeon,_Goesan-gun,_Chungcheongbuk-do,_South_Korea_-_panoramio.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/Category:Goesan" },
];

export const MUNICIPALITIES: Municipality[] = [
  { id:"cheongju", name:"청주시", type:"도청 소재지·산업도시", description:"교육·의료·문화 인프라와 오창·오송 산업단지가 모인 충북의 중심 도시입니다.", highlights:["오창과학산업단지","청주공항","상당산성"], image:REGION_RECOMMENDATIONS[0].image, imageSource:REGION_RECOMMENDATIONS[0].imageSource },
  { id:"chungju", name:"충주시", type:"교통·관광 거점", description:"충주호와 기업도시를 함께 품고 있어 자연과 산업의 균형이 좋은 지역입니다.", highlights:["충주호","기업도시","중부내륙선"], image:REGION_RECOMMENDATIONS[2].image, imageSource:REGION_RECOMMENDATIONS[2].imageSource },
  { id:"jincheon", name:"진천군", type:"혁신도시·산업형", description:"충북혁신도시와 산업단지를 중심으로 청년 인구와 일자리가 성장하는 지역입니다.", highlights:["농다리","혁신도시","선수촌"], image:REGION_RECOMMENDATIONS[1].image, imageSource:REGION_RECOMMENDATIONS[1].imageSource },
  { id:"okcheon", name:"옥천군", type:"소도시·농촌형", description:"대청호 수변 환경과 대전 접근성, 낮은 생활비를 함께 갖춘 정착 지역입니다.", highlights:["부소담악","옥천역","정지용문학관"], image:REGION_RECOMMENDATIONS[3].image, imageSource:REGION_RECOMMENDATIONS[3].imageSource },
  { id:"goesan", name:"괴산군", type:"농촌형", description:"청정 농업 기반과 로컬 창업 지원을 갖춘 자연 친화적 정착 지역입니다.", highlights:["산막이옛길","유기농엑스포","화양구곡"], image:REGION_RECOMMENDATIONS[4].image, imageSource:REGION_RECOMMENDATIONS[4].imageSource },
];

export const POLICIES: Policy[] = [
  { id: "youth-rent", title: "충북 청년 월세 지원", category: "주거 지원", region: "충북 전역", benefit: "월 최대 20만원", period: "상시 확인", eligibility: "만 19~39세 무주택 청년", summary: "청년의 주거비 부담을 낮추기 위해 월세 일부를 지원합니다." },
  { id: "job-settle", title: "지역주도형 청년일자리 정착지원", category: "취업 지원", region: "청주시 외", benefit: "인건비·정착금 지원", period: "사업별 상이", eligibility: "지역 기업에 취업한 청년", summary: "지역 기업 취업과 장기 정착을 함께 지원하는 사업입니다." },
  { id: "startup", title: "청년 로컬창업 패키지", category: "창업 지원", region: "충북 전역", benefit: "최대 2,000만원", period: "공고 기간 내", eligibility: "예비·초기 청년 창업가", summary: "지역 자원을 활용한 창업 아이디어의 사업화를 지원합니다." },
  { id: "transport", title: "청년 대중교통비 지원", category: "교통 지원", region: "청주시", benefit: "연 최대 12만원", period: "예산 소진 시까지", eligibility: "청주시 거주 청년", summary: "버스 등 대중교통 이용 비용 일부를 환급합니다." },
  { id: "farm", title: "청년후계농 영농정착 지원", category: "귀농귀촌", region: "군 지역", benefit: "월 최대 110만원", period: "연 1회 모집", eligibility: "독립 영농 3년 이하 청년", summary: "영농 초기 소득 불안을 줄이고 안정적인 농촌 정착을 돕습니다." },
];
