import { FormEvent, useEffect, useMemo, useState } from "react";
import {
  Bot,
  BusFront,
  Calculator,
  CheckCircle2,
  Clock3,
  Coffee,
  Home,
  Moon,
  PiggyBank,
  ReceiptText,
  Send,
  Sun,
  WalletCards,
  type LucideIcon,
} from "lucide-react";
import { useParams } from "react-router-dom";
import LoginRequired from "../components/LoginRequired";
import { useAuth } from "../context/AuthContext";
import { REGION_RECOMMENDATIONS } from "../data/mockData";
import { api } from "../services/api";
import type { AiChatResponse, CommuteSimulation, CostSimulation, QuickCondition } from "../types";

const INFO = {
  commute: { title: "출퇴근 시뮬레이션", icon: BusFront, description: "선택 지역에서 직장까지의 이동 시간과 교통비를 계산합니다." },
  budget: { title: "생활비 계산하기", icon: Calculator, description: "주거비와 고정 지출을 반영해 한 달 생활비를 계산합니다." },
  cost: { title: "하루 생활 시뮬레이션", icon: WalletCards, description: "충북에서 보내는 평범한 하루를 시간대별로 미리 경험합니다." },
  spending: { title: "지출 확인하기", icon: ReceiptText, description: "예상 소득과 지출을 비교해 저축 가능 금액을 확인합니다." },
};

const OVERALL_INFO = {
  title: "전체 정착 시뮬레이션",
  icon: Calculator,
  description: "출퇴근, 생활비, 하루 일정과 예상 지출을 한 페이지에서 순서대로 확인합니다.",
};

const REGION_ID_BY_NAME: Record<string, string> = {
  청주시: "cheongju",
  충주시: "chungju",
  진천군: "jincheon",
  옥천군: "okcheon",
  괴산군: "goesan",
};

function getRegionId(condition: QuickCondition) {
  if (condition.recommendRegion) return "cheongju";
  return REGION_ID_BY_NAME[condition.preferredRegions[0]] || "cheongju";
}

function formatMoney(value?: number) {
  return typeof value === "number" ? `${value.toLocaleString("ko-KR")}만원` : "계산 중";
}

export default function SimulationPage() {
  const { isLoggedIn, profile } = useAuth();
  const { type } = useParams();
  const [cost, setCost] = useState<CostSimulation>();
  const [commute, setCommute] = useState<CommuteSimulation>();
  const [aiMessage, setAiMessage] = useState("차 없이 살기 괜찮을까?");
  const [aiAnswer, setAiAnswer] = useState<AiChatResponse>();
  const [loading, setLoading] = useState(true);
  const [chatting, setChatting] = useState(false);
  const [chatError, setChatError] = useState("");

  const info = type ? INFO[type as keyof typeof INFO] || OVERALL_INFO : OVERALL_INFO;
  const Icon = info.icon;
  const regionId = useMemo(() => getRegionId(profile), [profile]);
  const heroRegion = REGION_RECOMMENDATIONS.find((region) => region.id === regionId) || REGION_RECOMMENDATIONS[0];

  useEffect(() => {
    let active = true;
    setLoading(true);

    Promise.all([
      api.calculateCost(profile, regionId),
      api.calculateCommute(profile, regionId),
    ]).then(([costResult, commuteResult]) => {
      if (!active) return;
      setCost(costResult);
      setCommute(commuteResult);
      setLoading(false);
    });

    return () => {
      active = false;
    };
  }, [profile, regionId]);

  const timeline: Array<[string, LucideIcon, string, string]> = [
    ["07:30", Sun, "기상", `${cost?.regionName || "선택 지역"} 주거지`],
    ["08:10", BusFront, "집에서 출발", `${commute?.transportType || profile.transport} 기준 이동`],
    ["08:40", Clock3, "회사 도착", `편도 약 ${commute?.estimatedOneWayMinutes || 0}분 예상`],
    ["12:00", Coffee, "점심 식사", "구내식당 또는 인근 상권"],
    ["18:00", Home, "퇴근", `왕복 약 ${commute?.estimatedRoundTripMinutes || 0}분 소요`],
    ["21:00", Moon, "여가·휴식", "호수공원 산책 또는 문화시설"],
  ];

  const handleChat = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const message = aiMessage.trim();
    if (!message) return;

    setChatting(true);
    setChatError("");
    try {
      const answer = await api.chatWithAi(message, profile, regionId);
      setAiAnswer(answer);
    } catch (error) {
      setChatError(error instanceof Error ? error.message : "AI 상담을 불러오지 못했습니다.");
    } finally {
      setChatting(false);
    }
  };

  if (!isLoggedIn) return <LoginRequired />;

  return (
    <main className="mx-auto max-w-[1100px] px-6 py-9">
      <section className="relative h-[320px] overflow-hidden rounded-2xl">
        <img src={heroRegion.image} alt={`${heroRegion.area} 정착 시뮬레이션 배경`} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950/90 via-emerald-950/55 to-transparent" />
        <div className="absolute inset-0 flex items-center p-8 text-white md:p-10">
          <div>
            <span className="rounded-full bg-white/15 px-3 py-1 text-[10px] font-bold backdrop-blur">현재 시뮬레이션 지역</span>
            <h2 className="mt-4 text-3xl font-bold leading-tight">{cost?.regionName || heroRegion.name}에서<br/>새로운 하루 미리 보기</h2>
            <p className="mt-3 max-w-lg text-xs leading-5 text-white/75">회원정보에 입력한 주거, 직업과 이동 조건을 바탕으로 출퇴근 시간과 생활비를 계산합니다.</p>
          </div>
        </div>
        <a href={heroRegion.imageSource} target="_blank" rel="noreferrer" className="absolute bottom-4 right-5 text-[9px] text-white/70 underline">사진 출처</a>
      </section>

      <div className="mt-7 flex items-center gap-4">
        <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand text-white"><Icon size={27} /></span>
        <div>
          <h1 className="text-2xl font-bold">{info.title}</h1>
          <p className="mt-1 text-sm text-stone-500">{info.description}</p>
        </div>
      </div>

      <nav className="mt-6 flex flex-wrap gap-2 rounded-xl border border-stone-200 bg-white p-3 text-xs font-bold text-stone-600">
        {[['출퇴근', 'commute-section'], ['생활비', 'cost-section'], ['하루 일정', 'day-section'], ['AI 상담', 'ai-section']].map(([label,target])=><a key={target} href={`#${target}`} className="rounded-lg px-4 py-2 hover:bg-brand-light hover:text-brand">{label}</a>)}
      </nav>

      <div className="mt-7 grid grid-cols-2 gap-3 md:grid-cols-5">
        {[
          ["선택 지역", cost?.regionName || "계산 중"],
          ["직업", profile.job],
          ["예상 연봉", profile.salary],
          ["주거 예산", `보증금: ${profile.deposit || "아직 정하지 않음"} / 월세: ${profile.rent}`],
          ["이동수단", commute?.transportType || profile.transport],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-4">
            <span className="text-[10px] text-stone-400">{label}</span>
            <b className="mt-1 block text-xs leading-5">{value}</b>
          </div>
        ))}
      </div>

      <section id="day-section" className="mt-6 scroll-mt-24 grid gap-5 lg:grid-cols-[1.3fr_.7fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-7">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold">나의 하루</h2>
            <span className="text-[10px] font-bold text-brand">{loading ? "계산 중" : commute?.commuteLevel}</span>
          </div>
          <div className="mt-6 space-y-1">
            {timeline.map(([time, TimelineIcon, title, desc]) => (
              <div key={time} className="grid grid-cols-[55px_34px_1fr] items-center gap-3">
                <b className="text-xs text-brand">{time}</b>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-light text-brand"><TimelineIcon size={15} /></span>
                <div className="border-b border-stone-100 py-3">
                  <p className="text-sm font-bold">{title}</p>
                  <p className="text-[11px] text-stone-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-2xl border border-stone-200 bg-white p-6">
            <PiggyBank className="text-brand" />
            <p className="mt-4 text-xs text-stone-400">월 예상 생활비</p>
            <strong className="text-3xl text-brand">{formatMoney(cost?.costs.totalMonthlyCost)}</strong>
            <div className="mt-4 h-2 rounded-full bg-stone-100">
              <div className="h-full rounded-full bg-brand" style={{ width: `${Math.min(100, Math.max(12, cost?.result.rentBurdenRate || 24))}%` }} />
            </div>
            <p className="mt-3 text-[10px] leading-4 text-stone-400">주거비 부담률 {cost?.result.rentBurdenRate ?? "-"}% · 보증금은 초기 필요 자금에 반영됩니다.</p>
            <p className="mt-2 text-[10px] font-bold text-brand">
              {cost?.dataSources?.housing.status === "external" ? "국토부 실거래가 반영" : "지역 기준값 사용"}
            </p>
          </div>

          <div className="rounded-2xl bg-brand p-6 text-white">
            <p className="text-xs text-white/70">월 예상 저축 가능액</p>
            <strong className="mt-2 block text-3xl">+{formatMoney(cost?.result.savingPossibleAmount)}</strong>
            <p className="mt-3 text-[11px] text-white/70">{cost?.result.stabilityLevel || "계산 중"} · 교통비 {formatMoney(commute?.monthlyTransportationCost)}</p>
            <p className="mt-1 text-[10px] text-white/60">
              {cost?.dataSources?.livingCosts.status === "external" ? "KOSIS 소비지출 반영" : "MVP 생활비 기준값"}
            </p>
          </div>
        </div>
      </section>

      <section id="commute-section" className="mt-6 scroll-mt-24 grid gap-4 md:grid-cols-3">
        {[
          ["월 실수령액", formatMoney(cost?.income.estimatedMonthlyNetIncome)],
          ["편도 출퇴근", commute ? `${commute.estimatedOneWayMinutes}분` : "계산 중"],
          ["초기 필요 자금", formatMoney(cost?.result.initialRequiredAmount)],
        ].map(([label, value]) => (
          <div key={label} className="rounded-xl border border-stone-200 bg-white p-5">
            <span className="text-[10px] text-stone-400">{label}</span>
            <b className="mt-2 block text-xl">{value}</b>
          </div>
        ))}
      </section>

      <section id="cost-section" className="mt-7 scroll-mt-24 grid gap-5 lg:grid-cols-[1.1fr_.9fr]">
        <div className="rounded-2xl border border-stone-200 bg-white p-7">
          <div className="flex items-end justify-between gap-3">
            <div><p className="text-xs font-bold text-brand">DAILY COST</p><h2 className="mt-1 text-xl font-bold">하루 예상 지출</h2></div>
            <span className="text-[10px] text-stone-400">월 비용을 30일 기준으로 환산한 참고값</span>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[["주거",cost?.costs.rent],["식비",cost?.costs.food],["교통",cost?.costs.transportation],["기타 생활",cost?.costs.otherLiving]].map(([label,value])=><div key={String(label)} className="rounded-xl bg-stone-50 p-4"><span className="text-[10px] text-stone-400">{String(label)}</span><b className="mt-2 block text-lg text-brand">{typeof value==="number"?`${Math.round(value/30*10000).toLocaleString("ko-KR")}원`:"계산 중"}</b></div>)}
          </div>
          <div className="mt-4 flex items-center justify-between rounded-xl bg-brand-light p-4"><span className="text-sm font-bold">하루 총 예상 지출</span><strong className="text-xl text-brand">{typeof cost?.costs.totalMonthlyCost==="number"?`${Math.round(cost.costs.totalMonthlyCost/30*10000).toLocaleString("ko-KR")}원`:"계산 중"}</strong></div>
          <p className="mt-3 text-[10px] leading-5 text-stone-400">보증금과 이사비처럼 한 번에 필요한 비용은 하루 지출에서 제외되며, 개인 소비 습관에 따라 달라질 수 있습니다.</p>
        </div>
        <div className="rounded-2xl border border-stone-200 bg-white p-7">
          <p className="text-xs font-bold text-brand">LIVING CHECK</p><h2 className="mt-1 text-xl font-bold">정착 전 확인할 점</h2>
          <div className="mt-5 space-y-3">{[
            `출퇴근 왕복 ${commute?.estimatedRoundTripMinutes??"-"}분이 장기적으로 가능한지 확인`,
            `월 고정지출 ${formatMoney(cost?.costs.totalMonthlyCost)}과 예상 저축액 비교`,
            `차량 필요도 ${commute?.carNeed||"계산 중"} 및 대체 교통수단 확인`,
            `초기 필요 자금 ${formatMoney(cost?.result.initialRequiredAmount)} 마련 계획 확인`,
          ].map((item)=><p key={item} className="flex gap-2 rounded-lg bg-stone-50 p-3 text-xs leading-5 text-stone-600"><CheckCircle2 size={15} className="mt-0.5 shrink-0 text-brand"/>{item}</p>)}</div>
        </div>
      </section>

      <section id="ai-section" className="mt-7 scroll-mt-24 rounded-2xl border border-stone-200 bg-white p-6">
        <div className="flex items-center gap-3">
          <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-light text-brand"><Bot size={20} /></span>
          <div>
            <h2 className="text-lg font-bold">AI 정착 상담</h2>
            <p className="text-xs text-stone-400">현재 조건과 계산 결과를 바탕으로 상담 응답을 받아옵니다.</p>
          </div>
        </div>
        <form onSubmit={handleChat} className="mt-5 flex flex-col gap-3 md:flex-row">
          <input
            value={aiMessage}
            onChange={(event) => setAiMessage(event.target.value)}
            className="min-h-11 flex-1 rounded-lg border border-stone-200 px-4 text-sm outline-none focus:border-brand"
            placeholder="정착 조건에 대해 질문해보세요"
          />
          <button disabled={chatting} className="flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-bold text-white disabled:bg-stone-300">
            <Send size={15} />
            {chatting ? "상담 중" : "질문하기"}
          </button>
        </form>
        {chatError&&<p className="mt-4 rounded-lg bg-red-50 p-3 text-xs text-red-600">{chatError}</p>}
        {aiAnswer && (
          <div className="mt-5 rounded-xl bg-stone-50 p-4">
            <p className="text-sm leading-6 text-stone-700">{aiAnswer.answer}</p>
            <p className="mt-3 text-[10px] text-stone-400">{aiAnswer.caution}</p>
          </div>
        )}
      </section>

      <section className="mt-7">
        <div className="flex items-end justify-between">
          <div>
            <h2 className="text-xl font-bold">오늘의 그림일기</h2>
            <p className="mt-1 text-xs text-stone-400">사진과 함께 미리 보는 충북에서의 하루예요.</p>
          </div>
          <span className="text-xs font-bold text-brand">DAY 1 · {cost?.regionName || "청주"}</span>
        </div>
        <div className="mt-4 grid gap-4 md:grid-cols-3">
          {[
            [REGION_RECOMMENDATIONS[0].image, "08:40", "출근길", `${commute?.destination.name || "근무지"}까지 ${commute?.estimatedOneWayMinutes || 0}분. 아침 이동 조건을 확인했어요.`],
            [REGION_RECOMMENDATIONS[3].image, "18:40", "퇴근 후 산책", "퇴근 후에는 가까운 공원에서 천천히 하루를 정리해요."],
            [REGION_RECOMMENDATIONS[1].image, "20:10", "지출 점검", `이번 달 예상 생활비는 ${formatMoney(cost?.costs.totalMonthlyCost)}입니다.`],
          ].map(([image, time, title, diary], index) => (
            <article key={String(title)} className={`overflow-hidden rounded-2xl border border-stone-200 bg-white ${index === 1 ? "md:-rotate-1" : "md:rotate-[.5deg]"}`}>
              <img src={String(image)} alt={String(title)} className="h-40 w-full object-cover" />
              <div className="p-5">
                <span className="font-serif text-[11px] font-bold text-brand">{String(time)}</span>
                <h3 className="mt-2 font-serif text-lg font-bold">{String(title)}</h3>
                <p className="mt-3 font-serif text-xs leading-6 text-stone-500">{String(diary)}</p>
                <div className="mt-4 border-t border-dashed border-stone-200 pt-3 text-right text-lg">☀️ 🌿</div>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
