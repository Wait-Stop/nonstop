import { Outlet } from "react-router-dom";
import TopNav from "./TopNav";

export default function Layout() {
  return <div className="min-h-screen bg-[#FAFBFA]"><TopNav /><Outlet /><footer className="mt-20 border-t border-stone-200 bg-white py-10"><div className="mx-auto flex max-w-[1240px] items-center justify-between px-6 text-xs text-stone-400"><span>© 2026 충북올겨</span><span>충북 정착을 고민하는 청년을 위한 생활 안내 서비스</span></div></footer></div>;
}
