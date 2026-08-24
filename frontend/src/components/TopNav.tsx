import { useEffect, useRef, useState } from "react";
import { Bell, CheckCheck, ChevronDown, LogOut, MessageSquareText, UserRound } from "lucide-react";
import { Link, NavLink, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Logo from "./Logo";

const NAV_ITEMS = [
  { label: "정착 시뮬레이션", items: [["전체 시뮬레이션", "/simulation"], ["출퇴근 시뮬레이션", "/simulation/commute"], ["생활비 시뮬레이션", "/simulation/budget"], ["하루 생활 시뮬레이션", "/simulation/cost"], ["지출 확인", "/simulation/spending"]] },
  { label: "정책 찾기", items: [["맞춤 정책", "/policies"], ["주거 지원", "/policies?category=주거"], ["취업·창업 지원", "/policies?category=취업"]] },
  { label: "지역 알아보기", items: [["추천 지역", "/recommendations"], ["전체 지역 알아보기", "/regions"], ["지역 비교", "/regions/compare"]] },
  { label: "커뮤니티", items: [] },
  { label: "마이페이지", items: [["내 정보", "/mypage"], ["저장한 지역·정책", "/mypage/saved"], ["회원정보 수정", "/mypage/profile"]] },
];

const NOTIFICATIONS = [
  { id: 1, category: "커뮤니티", title: "작성한 질문에 새 댓글이 달렸어요.", time: "방금 전", path: "/community" },
  { id: 2, category: "정책", title: "관심 조건에 맞는 주거 지원정책이 등록됐어요.", time: "2시간 전", path: "/policies" },
  { id: 3, category: "서비스", title: "저장한 청주시 지역 정보가 업데이트됐어요.", time: "어제", path: "/mypage/saved" },
];

export default function TopNav() {
  const { isLoggedIn, profile, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const loginState = location.pathname === "/login" ? undefined : { from: `${location.pathname}${location.search}` };
  const [notificationOpen, setNotificationOpen] = useState(false);
  const [logoutOpen, setLogoutOpen] = useState(false);
  const [readIds, setReadIds] = useState<number[]>([]);
  const notificationRef = useRef<HTMLDivElement>(null);
  const unreadCount = NOTIFICATIONS.filter((item) => !readIds.includes(item.id)).length;
  useEffect(() => {
    if (!notificationOpen) return;
    const closeOnOutside = (event: MouseEvent | TouchEvent) => {
      if (notificationRef.current && !notificationRef.current.contains(event.target as Node)) {
        setNotificationOpen(false);
      }
    };
    document.addEventListener("mousedown", closeOnOutside);
    document.addEventListener("touchstart", closeOnOutside);
    return () => {
      document.removeEventListener("mousedown", closeOnOutside);
      document.removeEventListener("touchstart", closeOnOutside);
    };
  }, [notificationOpen]);
  return (
    <>
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
          <div ref={notificationRef} className="relative z-50">
            <button onClick={() => setNotificationOpen((open) => !open)} aria-label="알림" aria-expanded={notificationOpen} className="relative flex h-9 w-9 items-center justify-center rounded-full hover:bg-stone-100">
              <Bell size={19} strokeWidth={1.7} className="text-stone-600" />
              {isLoggedIn && unreadCount > 0 && <span className="absolute right-1 top-1 h-2 w-2 rounded-full border-2 border-white bg-rose-500" />}
            </button>
            {notificationOpen && (
              <div className="absolute right-0 top-12 z-50 w-[340px] overflow-hidden rounded-xl border border-stone-200 bg-white shadow-[0_16px_45px_rgba(0,0,0,.14)]">
                <div className="flex items-center justify-between border-b border-stone-200 px-5 py-4">
                  <div><h2 className="text-sm font-bold">알림</h2>{isLoggedIn && <p className="mt-0.5 text-[10px] text-stone-400">읽지 않은 알림 {unreadCount}개</p>}</div>
                  {isLoggedIn && unreadCount > 0 && <button onClick={() => setReadIds(NOTIFICATIONS.map((item) => item.id))} className="flex items-center gap-1 text-[10px] font-semibold text-brand"><CheckCheck size={13}/>모두 읽음</button>}
                </div>
                {isLoggedIn ? (
                  <div className="max-h-[360px] divide-y divide-stone-100 overflow-y-auto">
                    {NOTIFICATIONS.map((item) => {
                      const read = readIds.includes(item.id);
                      return <Link key={item.id} to={item.path} onClick={() => { setReadIds((ids) => ids.includes(item.id) ? ids : [...ids, item.id]); setNotificationOpen(false); }} className={`flex gap-3 px-5 py-4 hover:bg-stone-50 ${read ? "bg-white" : "bg-emerald-50/50"}`}><span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-200 bg-white text-brand"><MessageSquareText size={14}/></span><span className="min-w-0 flex-1"><span className="flex items-center justify-between"><b className="text-[10px] text-brand">{item.category}</b><small className="text-[9px] text-stone-400">{item.time}</small></span><span className="mt-1 block text-xs leading-5 text-stone-700">{item.title}</span></span>{!read && <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brand"/>}</Link>;
                    })}
                  </div>
                ) : (
                  <div className="px-6 py-8 text-center"><Bell className="mx-auto text-stone-300" size={27}/><p className="mt-3 text-sm font-bold">로그인 후 알림을 확인하세요</p><p className="mt-1 text-[11px] leading-5 text-stone-400">커뮤니티 댓글과 관심 정책 소식을<br/>한곳에서 알려드려요.</p><Link to="/login" state={loginState} onClick={() => setNotificationOpen(false)} className="mt-4 inline-flex rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-white">로그인하기</Link></div>
                )}
              </div>
            )}
          </div>
          {isLoggedIn ? (
            <>
              <NavLink to="/mypage" className="flex items-center gap-2 rounded-lg border border-stone-200 px-3 py-2 text-xs font-semibold"><UserRound size={15} className="text-brand" />{profile.name}</NavLink>
              <button onClick={() => setLogoutOpen(true)} aria-label="로그아웃"><LogOut size={18} className="text-stone-400" /></button>
            </>
          ) : (
            <Link to="/login" state={loginState} className="rounded-lg border border-brand px-5 py-2.5 text-sm font-semibold text-brand hover:bg-brand-light">로그인</Link>
          )}
        </div>
      </div>
    </header>
    {logoutOpen&&<div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/35 px-5 pt-24" onMouseDown={(event)=>{if(event.target===event.currentTarget)setLogoutOpen(false);}}><section role="dialog" aria-modal="true" aria-labelledby="logout-title" className="logout-dialog-enter w-full max-w-sm rounded-xl border border-stone-200 bg-white p-7 text-center shadow-2xl"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-stone-100 text-stone-600"><LogOut size={20}/></span><h2 id="logout-title" className="mt-4 text-lg font-bold">로그아웃 하시겠습니까?</h2><p className="mt-2 text-xs text-stone-500">저장하지 않은 내용이 있다면 사라질 수 있습니다.</p><div className="mt-6 grid grid-cols-2 gap-2"><button onClick={()=>{logout();setLogoutOpen(false);navigate("/");}} className="rounded-lg bg-brand py-2.5 text-sm font-bold text-white">예</button><button onClick={()=>setLogoutOpen(false)} className="rounded-lg border border-stone-300 py-2.5 text-sm font-bold text-stone-600">아니요</button></div></section></div>}
    </>
  );
}
