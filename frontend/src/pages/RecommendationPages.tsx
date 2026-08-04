import { useEffect, useState } from "react";
import { ArrowLeft, BusFront, Car, CheckCircle2, Clock3, Heart, Hospital, MapPin, Save, Store } from "lucide-react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import LoginRequired from "../components/LoginRequired";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { QuickCondition, RegionRecommendation } from "../types";

const fallbackCondition: QuickCondition = { age: "30대", major: "공학계열", job: "IT·개발", salary: "3,600~4,500만원", rent: "60~80만원", deposit: "1,000~3,000만원", transport: "자가용", preferredRegions: [], recommendRegion: true };

export function RecommendationsPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const [items, setItems] = useState<RegionRecommendation[]>([]);
  const [loading, setLoading] = useState(true);
  const state = location.state as { condition?: QuickCondition; persist?: boolean } | null;
  useEffect(() => {
    const saved = localStorage.getItem("chungbuk-olgyeo-quick-condition");
    const condition = state?.condition || (saved ? JSON.parse(saved) as QuickCondition : fallbackCondition);
    api.getRecommendations(condition, { persist: false }).then((data) => { setItems(data); setLoading(false); });
  }, [state]);
  if (loading) return <main className="flex min-h-[560px] items-center justify-center"><div className="text-center"><span className="mx-auto block h-10 w-10 animate-spin rounded-full border-4 border-emerald-100 border-t-brand" /><h1 className="mt-5 text-xl font-bold">정착 조건을 분석하고 있어요</h1><p className="mt-2 text-xs text-stone-400">AI 추천 API 연동 전 Mock 분석 결과를 준비합니다.</p></div></main>;
  return <main className="mx-auto max-w-[1240px] px-6 py-9">
    <div className="flex flex-wrap items-end justify-between gap-4"><div><span className="text-xs font-bold text-brand">ANALYSIS COMPLETE</span><h1 className="mt-2 text-[28px] font-bold">입력한 조건에 잘 맞는 충북 지역이에요</h1><p className="mt-2 text-sm text-stone-500">간편 추천 결과는 로그인 여부와 관계없이 DB에 저장되지 않습니다.</p></div><button onClick={() => navigate("/mypage/profile")} className="rounded-lg border border-brand px-5 py-2.5 text-sm font-bold text-brand">회원정보 수정</button></div>
    <div className="mt-7 rounded-2xl border border-stone-200 bg-white p-5"><h2 className="text-sm font-bold">추천 진행 상태</h2><div className="mt-4 grid grid-cols-4 gap-4">{["조건 확인","지역 매칭","생활비 계산","정착 정보 구성"].map((label,index)=><div key={label} className="flex items-center gap-3"><span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand text-xs font-bold text-white">{index+1}</span><div><p className="text-xs font-bold">{label}</p><p className="text-[10px] text-brand">완료</p></div></div>)}</div></div>
    <section className="mt-7 grid gap-5 lg:grid-cols-3">{items.slice(0,3).map((region,index)=><article key={region.id} className={`overflow-hidden rounded-2xl border bg-white shadow-card ${index===0?"border-brand":"border-stone-200"}`}><div className="relative h-40 overflow-hidden bg-stone-200"><img src={region.image} alt={`${region.area} 실제 지역 풍경`} className="h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-t from-black/65 to-transparent"/><span className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full bg-brand text-lg font-black text-white">{index+1}</span><p className="absolute bottom-4 left-4 text-xs font-bold text-white">{region.type}</p><a href={region.imageSource} target="_blank" rel="noreferrer" className="absolute bottom-3 right-3 text-[8px] text-white/70">사진 출처</a></div><div className="p-5"><div className="flex items-end justify-between"><h2 className="text-xl font-bold">{region.name}</h2><p className="text-xs text-stone-400"><strong className="text-2xl text-brand">{region.score}</strong>점</p></div><div className="mt-4 flex flex-wrap gap-1.5">{region.reasons.map((reason)=><span key={reason} className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] text-brand-dark">{reason}</span>)}</div><div className="mt-5 grid grid-cols-3 border-y border-stone-100 py-3 text-center"><span><b className="block text-sm">{region.rent}만원</b><small className="text-[9px] text-stone-400">예상 월세</small></span><span><b className="block text-sm">{region.commute}분</b><small className="text-[9px] text-stone-400">출퇴근</small></span><span><b className="block text-sm">{region.policyCount}개</b><small className="text-[9px] text-stone-400">맞춤 정책</small></span></div><Link to={`/regions/${region.id}`} className="mt-5 block rounded-lg bg-brand py-2.5 text-center text-sm font-bold text-white">상세 보기</Link></div></article>)}</section>
    <button className="mx-auto mt-7 block rounded-lg border border-stone-300 px-6 py-2.5 text-xs font-bold text-stone-600">전체 지역 결과 보기</button>
  </main>;
}

export function RegionDetailPage() {
  const { isLoggedIn } = useAuth();
  const { id = "" } = useParams();
  const [region, setRegion] = useState<RegionRecommendation>();
  useEffect(() => { api.getRegion(id).then(setRegion); }, [id]);
  if (!isLoggedIn) return <LoginRequired />;
  if (!region) return <main className="p-20 text-center">지역 정보를 불러오는 중입니다.</main>;
  return <main className="mx-auto max-w-[1100px] px-6 py-9"><Link to="/recommendations" className="flex items-center gap-1 text-xs text-stone-500"><ArrowLeft size={14}/>추천 결과로</Link><div className="relative mt-5 overflow-hidden rounded-2xl bg-brand p-8 text-white"><img src={region.image} alt={`${region.area} 풍경`} className="absolute inset-0 h-full w-full object-cover"/><div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/55 to-black/20"/><div className="relative"><p className="text-sm text-white/70">{region.type}</p><div className="mt-2 flex items-end justify-between"><div><h1 className="text-3xl font-bold">{region.name}</h1><p className="mt-3 text-sm text-white/75">{region.reasons.join(" · ")}</p></div><div className="text-right"><strong className="text-5xl">{region.score}</strong><span className="text-sm"> / 100</span><p className="text-xs text-white/70">나와의 적합도</p></div></div></div></div>
    <section className="mt-5 grid gap-5 lg:grid-cols-[1.3fr_.7fr]"><div className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-lg font-bold">예상 생활비</h2><div className="mt-5 space-y-4">{[["월세·관리비",region.rent],["식비",48],["교통비",region.carNeed==="필요"?28:14],["생활비",36]].map(([label,cost])=><div key={String(label)} className="flex items-center justify-between border-b border-stone-100 pb-3 text-sm"><span className="text-stone-500">{label}</span><b>{cost}만원</b></div>)}<div className="flex justify-between rounded-lg bg-brand-light p-4"><b>월 예상 생활비</b><strong className="text-xl text-brand">{region.rent+98}만원</strong></div></div></div><div className="rounded-2xl border border-stone-200 bg-white p-6"><h2 className="text-lg font-bold">생활 인프라</h2><div className="mt-5 space-y-3">{region.infrastructure.map((item,index)=><div key={item} className="flex items-center gap-3 rounded-lg bg-stone-50 p-3 text-xs"><span className="text-brand">{index===0?<Hospital size={17}/>:index===1?<Heart size={17}/>:index===2?<Store size={17}/>:<BusFront size={17}/>}</span>{item}</div>)}</div></div></section>
    <section className="mt-5 grid gap-4 md:grid-cols-3">{[[Clock3,`${region.commute}분`,"평균 출퇴근"],[Car,region.carNeed,"차량 필요도"],[CheckCircle2,`${region.policyCount}개`,"받을 수 있는 정책"]].map(([Icon,value,label])=><div key={String(label)} className="rounded-xl border border-stone-200 bg-white p-5"><Icon className="text-brand"/><strong className="mt-4 block text-xl">{String(value)}</strong><span className="text-xs text-stone-400">{String(label)}</span></div>)}</section>
    <div className="mt-6 flex gap-3"><Link to="/simulation/cost" className="flex-1 rounded-lg bg-brand py-3 text-center text-sm font-bold text-white">이 지역에서 하루 살아보기</Link><button className="flex items-center gap-2 rounded-lg border border-brand px-6 text-sm font-bold text-brand"><Save size={15}/>결과 저장</button></div>
  </main>;
}
