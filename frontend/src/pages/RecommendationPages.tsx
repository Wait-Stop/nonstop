import { useEffect, useState } from "react";
import {
  ArrowLeft,
  BusFront,
  Car,
  CheckCircle2,
  Clock3,
  Heart,
  Hospital,
  Images,
  Info,
  MapPin,
  Save,
  Store,
  X,
} from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoginRequired from "../components/LoginRequired";
import ResultNoticeModal from "../components/ResultNoticeModal";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { Policy, QuickCondition, RegionRecommendation } from "../types";

const fallbackCondition: QuickCondition = {
  age: "30대",
  major: "공학계열",
  job: "IT·개발",
  salary: "3,600~4,500만원",
  rent: "60~80만원",
  deposit: "1,000~3,000만원",
  transport: "자가용",
  preferredRegions: [],
  recommendRegion: true,
};

const REGION_GALLERIES: Record<
  string,
  Array<{ title: string; image: string; source: string }>
> = {
  cheongju: [
    {
      title: "상당산성",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Sangdangsangseong.jpg?width=1400",
      source:
        "https://commons.wikimedia.org/wiki/File:Cheongju_Sangdangsangseong.jpg",
    },
    {
      title: "청주 도심 야경",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Old_Town_at_Night.jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Cheongju_Old_Town_at_Night.jpg",
    },
    {
      title: "청주종합운동장",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Cheongju_Stadium_exterior.jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Cheongju_Stadium_exterior.jpg",
    },
  ],
  chungju: [
    {
      title: "충주호",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Chungjuho_Lake.jpg?width=1400",
      source: "https://commons.wikimedia.org/wiki/File:Chungjuho_Lake.jpg",
    },
    {
      title: "충주 도심 풍경",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Chungju_20151104_11_(22175635323).jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Chungju_20151104_11_(22175635323).jpg",
    },
    {
      title: "충주의 산과 자연",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Korea-Chungju-Mountain-01.jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Korea-Chungju-Mountain-01.jpg",
    },
  ],
  jincheon: [
    {
      title: "진천 농다리",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon_Nongdari_Bridge_20200716_160025.jpg?width=1400",
      source:
        "https://commons.wikimedia.org/wiki/File:Jincheon_Nongdari_Bridge_20200716_160025.jpg",
    },
    {
      title: "진천 읍내 생활권",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Jincheon-gun_office.JPG?width=1000",
      source: "https://commons.wikimedia.org/wiki/File:Jincheon-gun_office.JPG",
    },
    {
      title: "신헌 고택",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Historic_House_of_Sin_Heon_in_Jincheon.jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Historic_House_of_Sin_Heon_in_Jincheon.jpg",
    },
  ],
  okcheon: [
    {
      title: "옥천성당",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/옥천성당.jpg?width=1400",
      source: "https://commons.wikimedia.org/wiki/File:옥천성당.jpg",
    },
    {
      title: "옥천읍 생활권",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Okcheon-gun_office.JPG?width=1000",
      source: "https://commons.wikimedia.org/wiki/File:Okcheon-gun_office.JPG",
    },
    {
      title: "옥천 중앙로와 옥천교",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Okcheon_County_Jungang-ro_Okcheon_Bridge_20240730.jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Okcheon_County_Jungang-ro_Okcheon_Bridge_20240730.jpg",
    },
  ],
  goesan: [
    {
      title: "괴산의 자연 풍경",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Oeryong-ri,_Buljeong-myeon,_Goesan-gun,_Chungcheongbuk-do,_South_Korea_-_panoramio.jpg?width=1400",
      source: "https://commons.wikimedia.org/wiki/Category:Goesan",
    },
    {
      title: "괴산읍 생활권",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Goesan-eup.JPG?width=1000",
      source: "https://commons.wikimedia.org/wiki/File:Goesan-eup.JPG",
    },
    {
      title: "괴산의 가을",
      image:
        "https://commons.wikimedia.org/wiki/Special:FilePath/Korea_Goesan_Fall_03_(15017086228).jpg?width=1000",
      source:
        "https://commons.wikimedia.org/wiki/File:Korea_Goesan_Fall_03_(15017086228).jpg",
    },
  ],
};

export function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useAuth();
  const [items, setItems] = useState<RegionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const state = location.state as {
    condition?: QuickCondition;
    persist?: boolean;
  } | null;
  const savedCondition = localStorage.getItem("chungbuk-olgyeo-quick-condition");
  const condition = state?.condition || (savedCondition ? JSON.parse(savedCondition) as QuickCondition : fallbackCondition);
  useEffect(() => {
    api.getRecommendations(condition, { persist: false }).then((data) => {
      setItems(data);
      setLoading(false);
    });
  }, [state]);
  if (loading)
    return (
      <main className="flex min-h-[560px] items-center justify-center">
        <div className="text-center">
          <span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-brand" />
          <h1 className="mt-5 text-xl font-bold">
            정착 조건을 분석하고 있어요
          </h1>
          <p className="mt-2 text-xs text-stone-400">
            입력한 조건에 맞는 지역을 찾고 있습니다.
          </p>
        </div>
      </main>
    );
  return (
    <main className="mx-auto max-w-[1240px] px-6 py-9">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold text-brand">
            ANALYSIS COMPLETE
          </span>
          <h1 className="mt-2 text-[28px] font-bold">
            입력한 조건에 잘 맞는 충북 지역이에요
          </h1>
          <p className="mt-2 text-sm text-stone-500">
            간편 추천 결과는 로그인 여부와 관계없이 DB에 저장되지 않습니다.
          </p>
        </div>
        <button
          onClick={() => navigate(isLoggedIn ? "/mypage/profile" : "/")}
          className="rounded-lg border border-brand px-5 py-2.5 text-sm font-bold text-brand"
        >
          {isLoggedIn ? "회원정보 수정" : "조건 다시 입력"}
        </button>
      </div>
      <div className="mt-7 rounded-2xl border border-stone-200 bg-white p-5">
        <h2 className="text-sm font-bold">추천 진행 상태</h2>
        <div className="mt-4 grid grid-cols-4 gap-4">
          {["조건 확인", "지역 매칭", "생활비 계산", "정착 정보 구성"].map(
            (label, index) => (
              <div key={label} className="flex items-center gap-3">
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">
                  {index + 1}
                </span>
                <div>
                  <p className="text-xs font-bold">{label}</p>
                  <p className="text-[10px] text-brand">완료</p>
                </div>
              </div>
            ),
          )}
        </div>
      </div>
      <section className="mt-7 grid gap-5 lg:grid-cols-3">
        {items.slice(0, 3).map((region, index) => (
          <article
            key={region.id}
            className={`overflow-hidden rounded-2xl border bg-white shadow-card ${index === 0 ? "border-brand" : "border-stone-200"}`}
          >
            <div className="relative h-40 overflow-hidden bg-stone-200">
              <img
                src={region.image}
                alt={`${region.area} 실제 지역 풍경`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent" />
              <span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-black text-white">
                {index + 1}
              </span>
              <p className="absolute bottom-4 left-4 text-xs font-bold text-white">
                {region.type}
              </p>
              <a
                href={region.imageSource}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 text-[8px] text-white/70"
              >
                사진 출처
              </a>
            </div>
            <div className="p-5">
              <div className="flex items-end justify-between">
                <h2 className="text-xl font-bold">{region.name}</h2>
                <p className="text-xs text-stone-400">
                  <strong className="text-2xl text-brand">
                    {region.score}
                  </strong>
                  점
                </p>
              </div>
              <div className="mt-4 flex flex-wrap gap-1.5">
                {region.reasons.map((reason) => (
                  <span
                    key={reason}
                    className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] text-brand-dark"
                  >
                    {reason}
                  </span>
                ))}
              </div>
              <div className="mt-5 grid grid-cols-3 border-y border-stone-100 py-3 text-center">
                <span>
                  <b className="block text-sm">{region.rent}만원</b>
                  <small className="text-[9px] text-stone-400">예상 월세</small>
                </span>
                <span>
                  <b className="block text-sm">{region.commute}분</b>
                  <small className="text-[9px] text-stone-400">출퇴근</small>
                </span>
                <span>
                  <b className="block text-sm">{region.policyCount}개</b>
                  <small className="text-[9px] text-stone-400">맞춤 정책</small>
                </span>
              </div>
              <Link
                to={`/regions/${region.id}`}
                state={{ recommendation: region, condition }}
                className="mt-5 block rounded-lg bg-brand py-2.5 text-center text-sm font-bold text-white"
              >
                상세 보기
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export function RegionDetailPage() {
  const { isLoggedIn } = useAuth();
  const location = useLocation();
  const { id = "" } = useParams();
  const [region, setRegion] = useState<RegionRecommendation>();
  const [relatedPolicies, setRelatedPolicies] = useState<Policy[]>([]);
  const [evidenceOpen, setEvidenceOpen] = useState<
    "commute" | "car" | "policies" | null
  >(null);
  const [saved, setSaved] = useState(false);
  const [saveNoticeOpen, setSaveNoticeOpen] = useState(false);
  const [saveError, setSaveError] = useState("");
  useEffect(() => {
    let active = true;
    setRelatedPolicies([]);
    const routeState = location.state as { recommendation?: RegionRecommendation; condition?: QuickCondition } | null;
    const stored = localStorage.getItem("chungbuk-olgyeo-quick-condition");
    const condition = routeState?.condition || (stored ? JSON.parse(stored) as QuickCondition : fallbackCondition);
    api.getRegion(id, condition).then(async (item) => {
      if (!active || !item) return;
      const exactRecommendation = routeState?.recommendation?.id === id ? routeState.recommendation : undefined;
      const resolved = exactRecommendation ? { ...item, ...exactRecommendation, transportScore: item.transportScore, commuteBasis: item.commuteBasis, relatedPolicyIds: item.relatedPolicyIds } : item;
      setRegion(resolved);
      const policies = await Promise.all(
        (item.relatedPolicyIds || []).map((policyId) =>
          api.getPolicy(policyId),
        ),
      );
      if (active)
        setRelatedPolicies(
          policies.filter((policy): policy is Policy => Boolean(policy)),
        );
    });
    return () => {
      active = false;
    };
  }, [id, location.state]);
  useEffect(() => {
    if (!isLoggedIn) return;
    api.getSavedRegions().then((items) => setSaved(items.some((item) => item.regionId === id))).catch(() => undefined);
  }, [id, isLoggedIn]);
  if (!isLoggedIn) return <LoginRequired />;
  if (!region)
    return (
      <main className="p-20 text-center">지역 정보를 불러오는 중입니다.</main>
    );
  const gallery = REGION_GALLERIES[region.id] || [];
  const transportScore = region.transportScore;
  const carNeedLevel =
    transportScore === undefined
      ? region.carNeed === "필요"
        ? "상"
        : region.carNeed === "선택"
          ? "하"
          : "중"
      : transportScore >= 70
        ? "하"
        : transportScore >= 50
          ? "중"
          : "상";
  const policyCount = relatedPolicies.length || region.policyCount;
  return (
    <main className="mx-auto max-w-[1100px] px-6 py-9">
      <Link
        to="/recommendations"
        className="flex items-center gap-1 text-xs text-stone-500"
      >
        <ArrowLeft size={14} />
        추천 결과로
      </Link>
      <div className="relative mt-5 overflow-hidden rounded-2xl bg-brand p-8 text-white">
        <img
          src={region.image}
          alt={`${region.area} 풍경`}
          className="absolute inset-0 h-full w-full object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20" />
        <div className="relative">
          <p className="text-sm text-white/70">{region.type}</p>
          <div className="mt-2 flex items-end justify-between">
            <div>
              <h1 className="text-3xl font-bold">{region.name}</h1>
              <p className="mt-3 text-sm text-white/75">
                {region.reasons.join(" · ")}
              </p>
            </div>
            <div className="text-right">
              <strong className="text-5xl">{region.score}</strong>
              <span className="text-sm"> / 100</span>
              <p className="text-xs text-white/70">나와의 적합도</p>
            </div>
          </div>
        </div>
      </div>
      <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold">예상 생활비</h2>
          <div className="mt-5 space-y-4">
            {[
              ["월세·관리비", region.rent],
              ["식비", 48],
              ["교통비", region.carNeed === "필요" ? 28 : 14],
              ["생활비", 36],
            ].map(([label, cost]) => (
              <div
                key={String(label)}
                className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm"
              >
                <span className="text-stone-500">{label}</span>
                <b>{cost}만원</b>
              </div>
            ))}
            <div className="flex justify-between rounded-lg bg-brand-light p-4">
              <b>월 예상 생활비</b>
              <strong className="text-xl text-brand">
                {region.rent + 98}만원
              </strong>
            </div>
          </div>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-6">
          <h2 className="text-lg font-bold">생활 인프라</h2>
          <div className="mt-5 space-y-3">
            {region.infrastructure.map((item, index) => (
              <div
                key={item}
                className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 text-xs"
              >
                <span className="text-brand">
                  {index === 0 ? (
                    <Hospital size={17} />
                  ) : index === 1 ? (
                    <Heart size={17} />
                  ) : index === 2 ? (
                    <Store size={17} />
                  ) : (
                    <BusFront size={17} />
                  )}
                </span>
                {item}
              </div>
            ))}
          </div>
        </div>
      </section>
      <section className="mt-5 grid gap-4 md:grid-cols-3">
        {[
          ["commute", Clock3, `평균 출퇴근 : ${region.commute}분`],
          ["car", Car, `차량 필요도 : ${carNeedLevel}`],
          ["policies", CheckCircle2, `받을 수 있는 정책 : ${policyCount}개`],
        ].map(([key, Icon, value]) => (
          <button
            key={String(key)}
            onClick={() => setEvidenceOpen(key as typeof evidenceOpen)}
            className="rounded-xl border border-stone-200 bg-white p-5 text-left transition hover:border-brand hover:shadow-card"
          >
            <Icon className="text-brand" />
            <strong className="mt-4 block text-xl">{String(value)}</strong>
            <span className="mt-1 flex items-center gap-1 text-xs text-stone-400">
              <Info size={12} />
              클릭해 산정 근거 보기
            </span>
          </button>
        ))}
      </section>
      {gallery.length > 0 && (
        <section className="mt-8">
          <div className="flex items-end justify-between gap-4">
            <div>
              <p className="flex items-center gap-2 text-xs font-bold text-brand">
                <Images size={16} />
                REGION GALLERY
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                사진으로 둘러보는 {region.area}
              </h2>
              <p className="mt-2 text-sm text-stone-500">
                생활권과 지역 분위기를 사진으로 미리 살펴보세요.
              </p>
            </div>
            <span className="text-[10px] text-stone-400">
              사진: Wikimedia Commons
            </span>
          </div>
          <div className="mt-5 grid gap-4 md:grid-cols-2">
            {gallery.map((photo, index) => (
              <figure
                key={photo.image}
                className={`group relative overflow-hidden rounded-2xl bg-stone-200 ${index === 0 ? "h-[420px] md:row-span-2" : "h-[202px]"}`}
              >
                <img
                  src={photo.image}
                  alt={`${region.area} ${photo.title}`}
                  loading="lazy"
                  className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <figcaption className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-3 p-5 text-white">
                  <b className="text-sm">{photo.title}</b>
                  <a
                    href={photo.source}
                    target="_blank"
                    rel="noreferrer"
                    className="text-[9px] text-white/75 underline underline-offset-2"
                  >
                    원본·출처
                  </a>
                </figcaption>
              </figure>
            ))}
          </div>
        </section>
      )}
      <div className="mt-6 flex gap-3">
        <Link
          to="/simulation/cost"
          className="flex-1 rounded-lg bg-brand py-3 text-center text-sm font-bold text-white"
        >
          이 지역에서 하루 살아보기
        </Link>
        <button onClick={async()=>{try{setSaveError("");await api.saveRegion(region.id,region.score);setSaved(true);setSaveNoticeOpen(true);}catch(error){setSaveError(error instanceof Error?error.message:"지역을 저장하지 못했습니다.");}}} disabled={saved} className="flex items-center gap-2 rounded-lg border border-brand px-6 text-sm font-bold text-brand disabled:border-stone-300 disabled:text-stone-400">
          <Save size={15} />
          {saved?"저장됨":"지역 저장"}
        </button>
      </div>
      {saveError&&<p className="mt-3 rounded-lg bg-red-50 p-3 text-center text-xs text-red-600">{saveError}</p>}
      <ResultNoticeModal open={saveNoticeOpen} title="결과가 저장되었습니다." description="저장한 지역에서 해당 지역과 추천 점수를 확인할 수 있습니다." linkLabel="저장한 지역 보기" linkTo="/mypage/saved" onClose={()=>setSaveNoticeOpen(false)}/>
      {evidenceOpen && (
        <div
          className="fixed inset-0 z-[80] flex items-center justify-center bg-black/45 px-5"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setEvidenceOpen(null);
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-2xl bg-white p-7 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-xs font-bold text-brand">산정 근거</p>
                <h2 className="mt-2 text-xl font-bold">
                  {evidenceOpen === "commute"
                    ? `평균 출퇴근 : ${region.commute}분`
                    : evidenceOpen === "car"
                      ? `차량 필요도 : ${carNeedLevel}`
                      : `받을 수 있는 정책 : ${policyCount}개`}
                </h2>
              </div>
              <button
                onClick={() => setEvidenceOpen(null)}
                aria-label="닫기"
                className="rounded-lg p-1 text-stone-400 hover:bg-stone-100"
              >
                <X size={20} />
              </button>
            </div>
            {evidenceOpen === "commute" && (
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-xl bg-stone-50 p-4">
                  <span className="text-xs text-stone-400">대표 이동 구간</span>
                  <b className="mt-1 block">
                    {region.commuteBasis?.origin || region.name} →{" "}
                    {region.commuteBasis?.destination ||
                      region.infrastructure[0]}
                  </b>
                </div>
                <p className="leading-6 text-stone-600">
                  {region.commuteBasis?.method ||
                    "지역별 대표 생활권의 편도 예상 시간"}
                  으로 설정된 값입니다.
                </p>
                <p className="rounded-lg bg-amber-50 p-4 text-xs leading-5 text-amber-800">
                  {region.commuteBasis?.caution ||
                    "실제 소요 시간은 출발지, 근무지, 시간대와 교통수단에 따라 달라질 수 있습니다."}
                </p>
              </div>
            )}
            {evidenceOpen === "car" && (
              <div className="mt-6 space-y-4 text-sm">
                <div className="rounded-xl bg-stone-50 p-4">
                  <span className="text-xs text-stone-400">
                    대중교통 접근성
                  </span>
                  <b className="mt-1 block text-2xl text-brand">
                    {transportScore === undefined
                      ? "확인 불가"
                      : `${transportScore}점 / 100점`}
                  </b>
                </div>
                <div className="grid grid-cols-3 gap-2 text-center text-xs">
                  <span
                    className={`rounded-lg p-3 ${carNeedLevel === "하" ? "bg-brand text-white" : "bg-stone-50"}`}
                  >
                    70점 이상
                    <br />
                    <b>하</b>
                  </span>
                  <span
                    className={`rounded-lg p-3 ${carNeedLevel === "중" ? "bg-brand text-white" : "bg-stone-50"}`}
                  >
                    50~69점
                    <br />
                    <b>중</b>
                  </span>
                  <span
                    className={`rounded-lg p-3 ${carNeedLevel === "상" ? "bg-brand text-white" : "bg-stone-50"}`}
                  >
                    50점 미만
                    <br />
                    <b>상</b>
                  </span>
                </div>
                <p className="leading-6 text-stone-600">
                  지역의 대중교통 접근성을 기준으로 차량 의존도를 판단했습니다.
                  교통 접근성이 높을수록 차량 필요도는 낮아집니다.
                </p>
              </div>
            )}
            {evidenceOpen === "policies" && (
              <div className="mt-6">
                <p className="text-sm leading-6 text-stone-600">
                  현재 이 지역에서 확인할 수 있는 지원 정책입니다. 실제 신청
                  가능 여부는 각 정책의 세부 자격과 공식 공고를 확인해 주세요.
                </p>
                <div className="mt-4 space-y-3">
                  {relatedPolicies.map((policy) => (
                    <Link
                      key={policy.id}
                      to={`/policies/${policy.id}`}
                      onClick={() => setEvidenceOpen(null)}
                      className="block rounded-xl border border-stone-200 p-4 hover:border-brand"
                    >
                      <span className="text-[10px] font-bold text-brand">
                        {policy.category} · {policy.status || "확인 필요"}
                      </span>
                      <b className="mt-1 block text-sm">{policy.title}</b>
                      <p className="mt-2 text-xs text-stone-500">
                        {policy.benefit}
                      </p>
                    </Link>
                  ))}
                  {!relatedPolicies.length && (
                    <p className="rounded-lg bg-stone-50 p-4 text-xs text-stone-500">
                      정책 상세 정보를 불러오지 못했습니다.
                    </p>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      )}
    </main>
  );
}
