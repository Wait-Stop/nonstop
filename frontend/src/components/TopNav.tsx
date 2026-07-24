import { Bell, ChevronDown, LogOut, UserRound } from "lucide-react";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { label: "정착 시뮬레이션", items: [["전체 시뮬레이션", "/simulation"], ["출퇴근 시뮬레이션", "/simulation/commute"], ["생활비 시뮬레이션", "/simulation/budget"], ["하루 생활 시뮬레이션", "/simulation/cost"], ["지출 확인", "/simulation/spending"]] },
  { label: "정책 찾기", items: [["맞춤 정책", "/policies"], ["주거 지원", "/policies?category=주거"], ["취업·창업 지원", "/policies?category=취업"]] },
  { label: "지역 알아보기", items: [["추천 지역", "/recommendations"], ["전체 지역 알아보기", "/regions"], ["지역 비교", "/regions/compare"]] },
  { label: "커뮤니티", items: [] },
  { label: "마이페이지", items: [["내 정보", "/mypage"], ["저장한 지역·정책", "/mypage/saved"], ["회원정보 수정", "/mypage/profile"]] },
];

export default function TopNav() {
  const { isLoggedIn, profile, logout } = useAuth();
  const navigate = useNavigate();
  return (
    <header className="sticky top-0 z-40 h-[72px] border-b border-stone-200 bg-white/95 px-5 backdrop-blur md:px-10">
      <div className="mx-auto flex h-full max-w-[1320px] items-center justify-between">
        <div className="flex items-center gap-8 xl:gap-12">
          <Link to="/" aria-label="충북올겨 홈"><Logo /></Link>
          <nav className="hidden items-center gap-2 lg:flex">
            {NAV_ITEMS.map((nav) => nav.items.length === 0 ? (
              <Link key={nav.label} to="/community" className="flex h-[72px] items-center px-4 text-[14px] font-semibold text-stone-700 transition-colors hover:text-brand">{nav.label}</Link>
            ) : (
              <div key={nav.label} className="group relative">
                <Link to={nav.label === "정착 시뮬레이션" ? "/simulation" : nav.label === "정책 찾기" ? "/policies" : nav.label === "지역 알아보기" ? "/regions" : "/mypage"} className="flex h-[72px] items-center gap-1 px-4 text-[14px] font-semibold text-stone-700 transition-colors hover:text-brand">
                  {nav.label}<ChevronDown size={13} className="transition-transform group-hover:rotate-180" />
                </Link>
                <div className="invisible absolute left-1/2 top-[64px] w-48 -translate-x-1/2 translate-y-2 rounded-xl border border-stone-200 bg-white p-2 opacity-0 shadow-xl transition-all group-hover:visible group-hover:translate-y-0 group-hover:opacity-100">
                  {nav.items.map(([label, path]) => (
                    <Link key={label} to={path} className="block rounded-lg px-3 py-2.5 text-[12px] font-medium text-stone-600 hover:bg-brand-light hover:text-brand">{label}</Link>
                  ))}
                </div>
              </div>
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <button aria-label="알림"><Bell size={19} strokeWidth={1.7} className="text-stone-600" /></button>
          {isLoggedIn ? (
            <>
              <NavLink to="/mypage" className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold"><UserRound size={15} className="text-brand" />{profile.name}</NavLink>
              <button onClick={() => { logout(); navigate("/"); }} aria-label="로그아웃"><LogOut size={18} className="text-stone-400" /></button>
            </>
          ) : (
            <Link to="/login" className="rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-light">로그인</Link>
          )}
        </div>
      </div>
    </header>
  );
}
