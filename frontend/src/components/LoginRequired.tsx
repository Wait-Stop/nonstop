import { LockKeyhole } from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

export default function LoginRequired() {
  const navigate = useNavigate();
  const location = useLocation();
  const targetPath = (location.state as { from?: string } | null)?.from || location.pathname;
  return <main className="mx-auto flex min-h-[560px] max-w-[620px] items-center px-6"><section className="w-full rounded-2xl border border-stone-200 bg-white p-10 text-center shadow-card"><span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brand-light text-brand"><LockKeyhole /></span><h1 className="mt-5 text-2xl font-bold">로그인이 필요한 기능입니다</h1><p className="mt-3 text-sm leading-6 text-stone-500">지역 상세 정보와 생활 시뮬레이션을 이용하려면 로그인해 주세요.<br />로그인 후 현재 화면으로 다시 돌아옵니다.</p><div className="mt-7 flex justify-center gap-2"><button onClick={() => navigate("/login", { state: { from: targetPath } })} className="rounded-lg bg-brand px-6 py-2.5 text-sm font-bold text-white">로그인하기</button><button onClick={() => navigate(-1)} className="rounded-lg border border-stone-300 px-6 py-2.5 text-sm font-bold text-stone-600">계속 둘러보기</button></div></section></main>;
}
