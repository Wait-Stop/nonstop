import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Bookmark,
  CalendarDays,
  CheckCircle2,
  ExternalLink,
  FileText,
  MapPin,
  Wallet,
} from "lucide-react";
import { Link, useParams, useSearchParams } from "react-router-dom";
import { api } from "../services/api";
import type { Policy } from "../types";
import { useAuth } from "../context/AuthContext";

export function PoliciesPage() {
  const { isLoggedIn } = useAuth();
  const [params] = useSearchParams();
  const category = params.get("category");
  const [policies, setPolicies] = useState<Policy[]>([]);
  const [loading, setLoading] = useState(true);
  const [savedIds, setSavedIds] = useState<Set<string>>(new Set());
  useEffect(() => {
    setLoading(true);
    api.getPolicies().then((items) => {
      setPolicies(items);
      setLoading(false);
    });
  }, []);
  useEffect(() => {
    if (!isLoggedIn) { setSavedIds(new Set()); return; }
    api.getSavedPolicies().then((items) => setSavedIds(new Set(items.map((item) => item.policyId)))).catch(() => undefined);
  }, [isLoggedIn]);
  const savePolicy = async (policyId: string) => {
    if (!isLoggedIn) { window.alert("로그인 후 정책을 저장할 수 있습니다."); return; }
    await api.savePolicy(policyId);
    setSavedIds((current) => new Set(current).add(policyId));
  };
  const items = category
    ? policies.filter((policy) => policy.category.includes(category))
    : policies;
  return (
    <main className="mx-auto max-w-[1120px] px-6 py-9">
      <span className="text-xs font-bold text-brand">POLICY MATCHING</span>
      <h1 className="mt-2 text-3xl font-bold">내 조건에 맞는 정착 정책</h1>
      <p className="mt-3 text-sm text-stone-500">
        정책별 지원 내용과 신청 기간을 확인할 수 있으며, 실제 신청 가능 여부는
        공식 공고에서 확인해야 합니다.
      </p>
      <div className="mt-7 flex flex-wrap gap-2">
        {["전체", "주거 지원", "일자리 지원", "창업 지원", "귀농귀촌"].map(
          (item) => (
            <Link
              key={item}
              to={
                item === "전체"
                  ? "/policies"
                  : `/policies?category=${item.split(" ")[0]}`
              }
              className={`rounded-full border px-4 py-2 text-xs font-bold ${(!category && item === "전체") || category === item.split(" ")[0] ? "border-brand bg-brand text-white" : "border-stone-200 bg-white text-stone-500"}`}
            >
              {item}
            </Link>
          ),
        )}
      </div>
      {loading ? (
        <div className="mt-10 rounded-2xl border border-stone-200 bg-white p-10 text-center text-sm text-stone-500">
          정책 정보를 불러오는 중입니다.
        </div>
      ) : (
        <section className="mt-6 grid gap-4 md:grid-cols-2">
          {items.map((policy) => (
            <article
              key={policy.id}
              className="rounded-2xl border border-stone-200 bg-white p-6 shadow-card"
            >
              <div className="flex items-start justify-between">
                <span className="rounded-full bg-brand-light px-3 py-1 text-[10px] font-bold text-brand">
                  {policy.category}
                </span>
                <span className="text-[10px] text-stone-400">
                  {policy.region}
                </span>
              </div>
              <h2 className="mt-4 text-lg font-bold">{policy.title}</h2>
              <p className="mt-2 text-xs leading-5 text-stone-500">
                {policy.summary}
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-stone-50 p-3">
                  <span className="text-[9px] text-stone-400">지원 내용</span>
                  <b className="mt-1 block text-xs text-brand">
                    {policy.benefit}
                  </b>
                </div>
                <div className="rounded-lg bg-stone-50 p-3">
                  <span className="text-[9px] text-stone-400">신청 기간</span>
                  <b className="mt-1 block text-xs">{policy.period}</b>
                </div>
              </div>
              <p className="mt-4 flex items-center gap-2 text-[11px] text-stone-500">
                <CheckCircle2 size={14} className="text-brand" />
                {policy.eligibility}
              </p>
              <div className="mt-5 grid grid-cols-[1fr_auto] gap-2">
                <Link to={`/policies/${policy.id}`} className="rounded-lg border border-brand py-2.5 text-center text-xs font-bold text-brand">자세히 보기</Link>
                <button onClick={()=>void savePolicy(policy.id)} disabled={savedIds.has(policy.id)} className="flex items-center gap-1 rounded-lg bg-brand px-4 text-xs font-bold text-white disabled:bg-stone-300"><Bookmark size={14}/>{savedIds.has(policy.id)?"저장됨":"저장하기"}</button>
              </div>
            </article>
          ))}
        </section>
      )}
    </main>
  );
}

export function PolicyDetailPage() {
  const { isLoggedIn } = useAuth();
  const { id } = useParams();
  const [policy, setPolicy] = useState<Policy>();
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);
  useEffect(() => {
    if (!id) return;
    setLoading(true);
    api.getPolicy(id).then((item) => {
      setPolicy(item);
      setLoading(false);
    });
  }, [id]);
  useEffect(() => {
    if (!isLoggedIn || !id) { setSaved(false); return; }
    api.getSavedPolicies().then((items) => setSaved(items.some((item) => item.policyId === id))).catch(() => undefined);
  }, [id, isLoggedIn]);
  if (loading)
    return (
      <main className="p-20 text-center">정책 정보를 불러오는 중입니다.</main>
    );
  if (!policy)
    return <main className="p-20 text-center">정책을 찾을 수 없습니다.</main>;
  return (
    <main className="mx-auto max-w-[900px] px-6 py-9">
      <Link
        to="/policies"
        className="flex items-center gap-1 text-xs text-stone-500"
      >
        <ArrowLeft size={14} />
        정책 목록
      </Link>
      <section className="mt-5 rounded-2xl border border-stone-200 bg-white p-8">
        <span className="rounded-full bg-brand-light px-3 py-1 text-xs font-bold text-brand">
          {policy.category}
        </span>
        <h1 className="mt-5 text-3xl font-bold">{policy.title}</h1>
        <p className="mt-4 text-sm leading-7 text-stone-500">
          {policy.detail || policy.summary}
        </p>
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {[
            [Wallet, "지원 내용", policy.benefit],
            [MapPin, "대상 지역", policy.region],
            [CalendarDays, "신청 기간", policy.period],
            [CheckCircle2, "신청 대상", policy.eligibility],
          ].map(([Icon, label, value]) => (
            <div key={String(label)} className="rounded-xl bg-stone-50 p-5">
              <Icon size={20} className="text-brand" />
              <span className="mt-3 block text-[10px] text-stone-400">
                {String(label)}
              </span>
              <b className="mt-1 block text-sm">{String(value)}</b>
            </div>
          ))}
        </div>
        <div className="mt-8 border-t border-stone-100 pt-7">
          <h2 className="flex items-center gap-2 text-lg font-bold">
            <FileText className="text-brand" />
            신청 방법 및 필요 서류
          </h2>
          {policy.requiredDocuments?.length ? (
            <ul className="mt-4 grid gap-2 text-sm text-stone-600 sm:grid-cols-2">
              {policy.requiredDocuments.map((document) => (
                <li key={document} className="rounded-lg bg-stone-50 px-4 py-3">
                  {document}
                </li>
              ))}
            </ul>
          ) : (
            <ol className="mt-4 space-y-3 text-sm text-stone-600">
              <li>1. 공식 사업 공고에서 현재 모집 여부를 확인합니다.</li>
              <li>
                2. 주민등록등본, 소득 증빙 등 대상자 확인 서류를 준비합니다.
              </li>
              <li>3. 담당 기관 온라인 또는 방문 접수처로 신청합니다.</li>
            </ol>
          )}
          <div className="mt-6 flex flex-wrap gap-2">
            <a href={policy.applyUrl || policy.sourceUrl || "#"} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 rounded-lg bg-brand px-6 py-3 text-sm font-bold text-white">공식 안내 페이지로 이동<ExternalLink size={15} /></a>
            <button onClick={async()=>{if(!isLoggedIn){window.alert("로그인 후 정책을 저장할 수 있습니다.");return;}await api.savePolicy(policy.id);setSaved(true);}} disabled={saved} className="inline-flex items-center gap-2 rounded-lg border border-brand px-6 py-3 text-sm font-bold text-brand disabled:border-stone-300 disabled:text-stone-400"><Bookmark size={15}/>{saved?"저장됨":"정책 저장하기"}</button>
          </div>
          {policy.caution && (
            <p className="mt-4 text-[11px] leading-5 text-stone-400">
              {policy.caution}
            </p>
          )}
        </div>
      </section>
    </main>
  );
}
