import { useState } from "react";
import { ArrowRight, BriefcaseBusiness, BusFront, Calculator, ChevronDown, FileCheck2, Home, MapPin, ReceiptText, Search, WalletCards } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { REGIONS } from "../data/mockData";
import type { QuickCondition, SimulationType } from "../types";

const FIELDS = [
  ["age", "나이", ["20대", "30대", "40대", "50대 이상"]],
  ["major", "전공", ["공학계열", "인문·사회", "자연과학", "예체능", "기타"]],
  ["job", "직업 및 직무", ["대학생", "무직", "IT·개발", "제조·생산", "사무·행정", "교육·연구", "서비스", "농업"]],
  ["salary", "현재 연봉", ["소득 없음", "2,400만원 미만", "2,400~3,000만원", "3,000~3,600만원", "3,600~4,500만원", "4,500~6,000만원", "6,000만원 이상", "기타"]],
  ["rent", "월세 예산", ["30만원 이하", "30~40만원", "40~50만원", "50~60만원", "60~80만원", "80만원 이상", "전세·매매 희망", "아직 정하지 않음"]],
  ["transport", "이동수단", ["자전거", "버스", "기차", "자가용", "기타", "도보"]],
] as const;

const SIMULATIONS: { id: SimulationType; icon: typeof BusFront; title: string; sub: string }[] = [
  { id: "commute", icon: BusFront, title: "출퇴근 해보기", sub: "이동 시간·교통비 확인" },
  { id: "budget", icon: Calculator, title: "생활비 계산하기", sub: "월 생활비 미리 계산" },
  { id: "cost", icon: WalletCards, title: "하루 살아보기", sub: "시간대별 생활 체험" },
  { id: "spending", icon: ReceiptText, title: "지출 확인하기", sub: "소비·저축 계획 확인" },
];

export default function HomePage() {
  const navigate = useNavigate();
  const [selectedSimulations, setSelectedSimulations] = useState<SimulationType[]>([]);
  const [form, setForm] = useState<Record<string, string>>({});
  const [regions, setRegions] = useState<string[]>([]);
  const [recommend, setRecommend] = useState(false);
  const [regionOpen, setRegionOpen] = useState(false);
  const [error, setError] = useState("");

  const toggleRegion = (region: string) => {
    setRecommend(false);
    setRegions((current) => current.includes(region) ? current.filter((item) => item !== region) : [...current, region]);
  };
  const chooseRecommend = () => { setRecommend(true); setRegions([]); setRegionOpen(false); };
  const submitQuick = () => {
    if (FIELDS.some(([key]) => !form[key]) || (!recommend && regions.length === 0)) {
      setError("모든 조건과 희망 지역을 선택해 주세요.");
      return;
    }
    const condition: QuickCondition = {
      age: form.age, major: form.major, job: form.job, salary: form.salary,
      rent: form.rent, transport: form.transport, preferredRegions: regions, recommendRegion: recommend,
    };
    localStorage.setItem("chungbuk-olgyeo-quick-condition", JSON.stringify(condition));
    navigate("/recommendations", { state: { condition, persist: false } });
  };

  return <main>
    <section className="mx-auto grid max-w-[1240px] gap-8 px-6 py-10 lg:grid-cols-[1fr_1.05fr]">
      <div className="flex min-h-[250px] flex-col justify-center">
        <span className="mb-4 w-fit rounded-full bg-brand-light px-3 py-1.5 text-[11px] font-bold text-brand">충북 정착 생활 플랫폼</span>
        <h1 className="text-[32px] font-bold leading-[1.4] tracking-[-0.05em]">충북에서의 새로운 시작,<br /><span className="text-brand">충북올겨</span>와 함께 준비해보세요</h1>
        <p className="mt-4 text-sm leading-6 text-stone-500">내게 맞는 지역을 찾고, 실제 생활비와 출퇴근을 미리 경험하고,<br className="hidden md:block" />정착에 필요한 정책까지 한눈에 확인하세요.</p>
      </div>
      <div className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card">
        <h2 className="text-[15px] font-bold">어떤 시뮬레이션을 해볼까요?</h2>
        <p className="mt-1 text-[11px] text-stone-400">원하는 항목을 선택한 뒤 시작 버튼을 눌러주세요.</p>
        <div className="mt-5 grid grid-cols-2 gap-3 md:grid-cols-4">
          {SIMULATIONS.map(({ id, icon: Icon, title, sub }) => {
            const selected = selectedSimulations.includes(id);
            return <button key={id} onClick={() => setSelectedSimulations((current) => selected ? current.filter((item) => item !== id) : [...current, id])} className={`flex h-[126px] flex-col items-center justify-center rounded-xl border bg-white text-center transition-all ${selected ? "border-brand ring-2 ring-brand/10" : "border-stone-200 hover:border-brand"}`}><Icon size={29} strokeWidth={1.6} className="text-brand" /><strong className="mt-3 text-[12px] text-stone-800">{title}</strong><span className="mt-1 text-[9px] text-stone-400">{sub}</span></button>;
          })}
        </div>
        <div className="mt-4 flex justify-end"><button disabled={selectedSimulations.length === 0} onClick={() => navigate("/simulation", { state: { selected: selectedSimulations } })} className="rounded-lg bg-brand px-7 py-2.5 text-xs font-bold text-white hover:bg-brand-dark disabled:cursor-not-allowed disabled:bg-stone-300">선택한 시뮬레이션 시작하기</button></div>
      </div>
    </section>

    <section className="mx-auto max-w-[1240px] px-6">
      <div className="rounded-2xl border border-emerald-100 bg-[#F3FAF6] p-5">
        <div className="mb-4 flex items-end justify-between"><div><h2 className="text-lg font-bold">내 정착 조건으로 맞는 지역을 찾아보세요</h2><p className="mt-1 text-xs font-medium text-brand">로그인 없이 간단하게 추천받을 수 있으며, 이 결과는 계정에 저장되지 않습니다.</p></div><span className="rounded-full bg-white px-3 py-1 text-[10px] font-bold text-brand">비회원 이용 가능</span></div>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-7">
          {FIELDS.map(([key, label, options]) => <label key={key}><span className="mb-1.5 block text-[11px] font-medium text-stone-500">{label}</span><span className="relative block"><select value={form[key] || ""} onChange={(event) => setForm((current) => ({ ...current, [key]: event.target.value }))} className="h-10 w-full appearance-none rounded-lg border border-stone-300 bg-white px-3 pr-8 text-xs outline-none focus:border-brand"><option value="" disabled hidden>선택</option>{options.map((option) => <option key={option}>{option}</option>)}</select><ChevronDown size={13} className="pointer-events-none absolute right-3 top-3.5" /></span></label>)}
          <div className="relative"><span className="mb-1.5 block text-[11px] font-medium text-stone-500">희망 지역</span><button onClick={() => setRegionOpen((open) => !open)} className="flex h-10 w-full items-center justify-between rounded-lg border border-stone-300 bg-white px-3 text-xs"><span className="truncate">{recommend ? "추천받을게요" : regions.length ? `${regions.length}곳 선택` : "선택"}</span><ChevronDown size={13} /></button>
            {regionOpen && <div className="absolute right-0 top-16 z-20 w-64 rounded-xl border border-stone-200 bg-white p-3 shadow-xl"><button onClick={chooseRecommend} className={`mb-2 w-full rounded-lg border px-3 py-2 text-left text-xs font-bold ${recommend ? "border-brand bg-brand-light text-brand" : "border-stone-200"}`}>추천받을게요 <span className="ml-1 text-[9px] font-normal text-stone-400">지역 자동 추천</span></button><div className="grid grid-cols-2 gap-1 border-t border-stone-100 pt-2">{REGIONS.map((region) => <label key={region} className="flex cursor-pointer items-center gap-2 rounded px-2 py-1.5 text-xs hover:bg-stone-50"><input type="checkbox" checked={regions.includes(region)} onChange={() => toggleRegion(region)} className="accent-brand" />{region}</label>)}</div><button onClick={() => setRegionOpen(false)} className="mt-2 w-full rounded-lg bg-brand py-2 text-xs font-bold text-white">선택 완료</button></div>}
          </div>
        </div>
        <div className="mt-4 flex items-center justify-between"><p className="text-xs text-rose-600">{error}</p><button onClick={submitQuick} className="flex items-center gap-1.5 rounded-lg bg-brand px-6 py-2.5 text-xs font-bold text-white"><Search size={14} />지역 찾기</button></div>
      </div>
    </section>

    <section className="mt-16 border-y border-emerald-100 bg-[#F1F6F3]">
      <div className="mx-auto max-w-[1240px] px-6 py-16">
        <div className="grid gap-8 border-b border-emerald-200/70 pb-10 lg:grid-cols-[.8fr_1.2fr] lg:items-end">
          <div>
            <span className="text-xs font-bold text-brand">충북올겨 이용 안내</span>
            <h2 className="mt-3 text-[30px] font-bold leading-[1.35] tracking-[-0.04em]">
              지역을 고르는 일부터<br />실제 정착 준비까지
            </h2>
          </div>
          <div className="flex flex-col items-start justify-between gap-5 sm:flex-row sm:items-end">
            <p className="max-w-xl text-[13px] leading-6 text-stone-600">
              막연한 지역 소개 대신 내 조건에 맞는 후보지를 찾고, 주거비와 이동 시간을 비교한 뒤
              받을 수 있는 지원정책까지 순서대로 확인할 수 있습니다.
            </p>
            <Link to="/regions" className="flex shrink-0 items-center gap-2 border-b border-brand pb-1 text-xs font-bold text-brand">
              충북 전체 지역 보기 <ArrowRight size={14} />
            </Link>
          </div>
        </div>

        <div className="grid border-b border-emerald-200/70 py-9 md:grid-cols-3">
          {[
            ["01", "조건을 알려주세요", "직업·소득·주거 예산·이동수단", BriefcaseBusiness],
            ["02", "지역을 비교해보세요", "충북 11개 시·군의 생활 조건", MapPin],
            ["03", "생활을 준비하세요", "생활비·출퇴근·지원정책", Home],
          ].map(([number, title, description, Icon], index) => (
            <div key={String(number)} className={`relative flex gap-4 py-3 ${index ? "md:border-l md:border-emerald-200/70 md:pl-8" : ""} ${index < 2 ? "md:pr-8" : ""}`}>
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-brand/30 bg-white text-brand">
                <Icon size={19} strokeWidth={1.7} />
              </span>
              <div>
                <span className="text-[10px] font-bold tracking-[.12em] text-brand">{String(number)} STEP</span>
                <h3 className="mt-1 text-[15px] font-bold">{String(title)}</h3>
                <p className="mt-1 text-[11px] text-stone-500">{String(description)}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-[1.2fr_.8fr]">
          <div className="overflow-hidden rounded-xl bg-brand text-white">
            <div className="grid h-full md:grid-cols-[1fr_210px]">
              <div className="p-7">
                <span className="text-[11px] font-semibold text-emerald-100">내 조건에 맞는 정착 후보지</span>
                <h3 className="mt-2 text-xl font-bold">어디에서 살지 고민된다면<br />지역 추천부터 시작해보세요.</h3>
                <p className="mt-4 max-w-md text-xs leading-5 text-white/70">
                  간편 검색은 로그인 없이 이용할 수 있으며, 회원정보나 추천 이력으로 저장되지 않습니다.
                </p>
                <Link to="/recommendations" className="mt-6 inline-flex items-center gap-2 rounded-md bg-white px-4 py-2.5 text-xs font-bold text-brand">
                  추천 지역 살펴보기 <ArrowRight size={13} />
                </Link>
              </div>
              <div className="grid grid-cols-2 border-l border-white/15 bg-black/5 p-5 md:grid-cols-1">
                {[["11", "충북 시·군"], ["4", "생활 시뮬레이션"], ["5", "정책 분야"]].map(([value, label]) => (
                  <div key={label} className="flex items-center justify-between border-b border-white/15 px-2 py-3 last:border-0">
                    <span className="text-[11px] text-white/65">{label}</span>
                    <strong className="text-xl">{value}</strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="divide-y divide-stone-200 rounded-xl border border-stone-200 bg-white">
            {[
              [Calculator, "생활비 미리 계산하기", "주거비와 고정 지출을 월 단위로 확인", "/simulation/budget"],
              [BusFront, "출퇴근 여건 확인하기", "이동 시간과 교통수단을 함께 비교", "/simulation/commute"],
              [FileCheck2, "내게 맞는 정책 찾기", "주거·취업·창업 지원정보 확인", "/policies"],
            ].map(([Icon, title, description, path]) => (
              <Link key={String(title)} to={String(path)} className="group flex items-center gap-4 px-5 py-4 hover:bg-stone-50">
                <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-brand-light text-brand">
                  <Icon size={17} />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[13px]">{String(title)}</strong>
                  <small className="mt-1 block truncate text-[10px] text-stone-400">{String(description)}</small>
                </span>
                <ArrowRight size={14} className="text-stone-300 group-hover:text-brand" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  </main>;
}
