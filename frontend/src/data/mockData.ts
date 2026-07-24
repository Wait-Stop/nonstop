import type { Municipality, Policy, RegionRecommendation } from "../types";

export const REGIONS = ["청주시", "충주시", "제천시", "보은군", "옥천군", "영동군", "증평군", "진천군", "괴산군", "음성군", "단양군"];

export const REGION_RECOMMENDATIONS: RegionRecommendation[] = [
  { id: "cheongju", name: "청주시 오창읍", area: "청주시", score: 94, type: "산업단지 직장인형", reasons: ["IT·반도체 일자리 접근성", "생활 인프라와 교통 균형", "청년 지원정책 다수"], rent: 58, commute: 28, carNeed: "있으면 편리", infrastructure: ["충북대병원", "오창호수공원", "대형마트", "청주공항"], policyCount: 12, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Sangdangsangseong.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Cheongju_Sangdangsangseong.jpg" },
  { id: "jincheon", name: "진천·음성 충북혁신도시", area: "진천군", score: 89, type: "혁신도시 정착형", reasons: ["공공기관·산업단지 인접", "신축 주거지 비율이 높음", "청주·수도권 이동 편리"], rent: 52, commute: 24, carNeed: "권장", infrastructure: ["혁신도시터미널", "공공도서관", "종합병원", "수변공원"], policyCount: 9, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon_Nongdari_Bridge_20200716_160025.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg" },
  { id: "chungju", name: "충주시 연수동", area: "충주시", score: 86, type: "중심 생활권형", reasons: ["합리적인 주거비", "상권·문화시설 밀집", "충주역과 버스터미널 접근성"], rent: 45, commute: 22, carNeed: "선택", infrastructure: ["충주역", "건국대병원", "호암지", "대형마트"], policyCount: 8, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg" },
  { id: "jecheon", name: "제천시 중앙동", area: "제천시", score: 81, type: "로컬 문화생활형", reasons: ["기차 교통 편리", "자연과 도심의 균형", "상대적으로 낮은 생활비"], rent: 38, commute: 18, carNeed: "선택", infrastructure: ["제천역", "세명대병원", "의림지", "전통시장"], policyCount: 7, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Jecheon_Travel_03_(32236727471).jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Jecheon_Travel_03_(32236727471).jpg" },
  { id: "danyang", name: "단양군 단양읍", area: "단양군", score: 77, type: "자연친화 정착형", reasons: ["우수한 자연환경", "관광·로컬 창업 기회", "귀농귀촌 지원"], rent: 32, commute: 16, carNeed: "필요", infrastructure: ["단양역", "보건의료원", "다누리센터", "남한강 산책로"], policyCount: 11, image: "https://commons.wikimedia.org/wiki/Special:FilePath/Dodamsambong_Rocks,_near_Danyang,_Korea.jpg?width=1200", imageSource: "https://commons.wikimedia.org/wiki/File:Dodamsambong_Rocks,_near_Danyang,_Korea.jpg" },
];

export const MUNICIPALITIES: Municipality[] = [
  { id:"cheongju", name:"청주시", type:"도청 소재지·산업도시", description:"교육·의료·문화 인프라와 오창·오송 산업단지가 모인 충북의 중심 도시입니다.", highlights:["오창과학산업단지","청주공항","상당산성"], image:REGION_RECOMMENDATIONS[0].image, imageSource:REGION_RECOMMENDATIONS[0].imageSource },
  { id:"chungju", name:"충주시", type:"교통·관광 거점", description:"충주호와 기업도시를 함께 품고 있어 자연과 산업의 균형이 좋은 지역입니다.", highlights:["충주호","기업도시","중부내륙선"], image:REGION_RECOMMENDATIONS[2].image, imageSource:REGION_RECOMMENDATIONS[2].imageSource },
  { id:"jecheon", name:"제천시", type:"철도·한방·관광도시", description:"중앙선 철도와 천혜의 자연환경, 한방 바이오 산업이 어우러진 도시입니다.", highlights:["의림지","제천역","한방바이오"], image:REGION_RECOMMENDATIONS[3].image, imageSource:REGION_RECOMMENDATIONS[3].imageSource },
  { id:"boeun", name:"보은군", type:"산림·귀농귀촌형", description:"속리산을 중심으로 청정 자연과 농촌 정착 지원이 발달한 지역입니다.", highlights:["속리산","법주사","귀농귀촌"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/법주사_2.jpg?width=1200", imageSource:"https://commons.wikimedia.org/wiki/Category:Beopjusa" },
  { id:"okcheon", name:"옥천군", type:"대청호 생활권", description:"대청호 수변 환경과 대전 접근성을 함께 갖춘 남부권 정착 지역입니다.", highlights:["부소담악","옥천역","정지용문학관"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1200", imageSource:"https://commons.wikimedia.org/wiki/File:옥천성당.jpg" },
  { id:"yeongdong", name:"영동군", type:"과일·국악·로컬창업형", description:"포도와 와인, 국악을 지역 자원으로 발전시킨 충북 최남단 지역입니다.", highlights:["월류봉","와인터널","국악체험촌"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/Yeongdong-gun_office.JPG?width=1200", imageSource:"https://commons.wikimedia.org/wiki/File:Yeongdong-gun_office.JPG" },
  { id:"jeungpyeong", name:"증평군", type:"압축 생활권형", description:"작은 면적 안에 주거와 생활 인프라가 밀집해 이동이 편리한 지역입니다.", highlights:["좌구산","증평역","벨포레"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/Jeungpyeong-gun_office.JPG?width=1200", imageSource:"https://commons.wikimedia.org/wiki/File:Jeungpyeong-gun_office.JPG" },
  { id:"jincheon", name:"진천군", type:"혁신도시·산업형", description:"충북혁신도시와 산업단지를 중심으로 청년 인구와 일자리가 성장하는 지역입니다.", highlights:["농다리","혁신도시","선수촌"], image:REGION_RECOMMENDATIONS[1].image, imageSource:REGION_RECOMMENDATIONS[1].imageSource },
  { id:"goesan", name:"괴산군", type:"유기농·자연정착형", description:"산막이옛길과 청정 농업 기반을 갖춘 자연 친화적 정착 지역입니다.", highlights:["산막이옛길","유기농엑스포","화양구곡"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/Oeryong-ri,_Buljeong-myeon,_Goesan-gun,_Chungcheongbuk-do,_South_Korea_-_panoramio.jpg?width=1200", imageSource:"https://commons.wikimedia.org/wiki/Category:Goesan" },
  { id:"eumseong", name:"음성군", type:"산업단지·혁신도시형", description:"충북혁신도시와 다수의 산업단지로 직장 중심 정착 수요가 높은 지역입니다.", highlights:["혁신도시","산업단지","품바축제"], image:"https://commons.wikimedia.org/wiki/Special:FilePath/Eumseong-gun_office.JPG?width=1200", imageSource:"https://commons.wikimedia.org/wiki/Category:Eumseong" },
  { id:"danyang", name:"단양군", type:"관광·자연생활형", description:"남한강과 소백산의 자연을 기반으로 관광·레저 산업이 발달한 지역입니다.", highlights:["도담삼봉","소백산","패러글라이딩"], image:REGION_RECOMMENDATIONS[4].image, imageSource:REGION_RECOMMENDATIONS[4].imageSource },
];

export const POLICIES: Policy[] = [
  { id: "youth-rent", title: "충북 청년 월세 지원", category: "주거 지원", region: "충북 전역", benefit: "월 최대 20만원", period: "상시 확인", eligibility: "만 19~39세 무주택 청년", summary: "청년의 주거비 부담을 낮추기 위해 월세 일부를 지원합니다." },
  { id: "job-settle", title: "지역주도형 청년일자리 정착지원", category: "취업 지원", region: "청주시 외", benefit: "인건비·정착금 지원", period: "사업별 상이", eligibility: "지역 기업에 취업한 청년", summary: "지역 기업 취업과 장기 정착을 함께 지원하는 사업입니다." },
  { id: "startup", title: "청년 로컬창업 패키지", category: "창업 지원", region: "충북 전역", benefit: "최대 2,000만원", period: "공고 기간 내", eligibility: "예비·초기 청년 창업가", summary: "지역 자원을 활용한 창업 아이디어의 사업화를 지원합니다." },
  { id: "transport", title: "청년 대중교통비 지원", category: "교통 지원", region: "청주시", benefit: "연 최대 12만원", period: "예산 소진 시까지", eligibility: "청주시 거주 청년", summary: "버스 등 대중교통 이용 비용 일부를 환급합니다." },
  { id: "farm", title: "청년후계농 영농정착 지원", category: "귀농귀촌", region: "군 지역", benefit: "월 최대 110만원", period: "연 1회 모집", eligibility: "독립 영농 3년 이하 청년", summary: "영농 초기 소득 불안을 줄이고 안정적인 농촌 정착을 돕습니다." },
];
