import { CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";

interface ResultNoticeModalProps {
  open: boolean;
  title: string;
  description: string;
  linkLabel?: string;
  linkTo?: string;
  onClose: () => void;
}

export default function ResultNoticeModal({ open, title, description, linkLabel, linkTo, onClose }: ResultNoticeModalProps) {
  if (!open) return null;
  return <div className="fixed inset-0 z-[90] flex items-start justify-center bg-black/35 px-5 pt-24" onMouseDown={(event)=>{if(event.target===event.currentTarget)onClose();}}><section role="dialog" aria-modal="true" aria-labelledby="result-notice-title" className="logout-dialog-enter w-full max-w-sm rounded-xl border border-stone-200 bg-white p-7 text-center shadow-2xl"><span className="mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-brand-light text-brand"><CheckCircle2 size={22}/></span><h2 id="result-notice-title" className="mt-4 text-lg font-bold">{title}</h2><p className="mt-2 text-xs leading-5 text-stone-500">{description}</p><div className={`mt-6 grid gap-2 ${linkTo&&linkLabel?"grid-cols-2":"grid-cols-1"}`}>{linkTo&&linkLabel&&<Link to={linkTo} onClick={onClose} className="rounded-lg bg-brand py-2.5 text-sm font-bold text-white">{linkLabel}</Link>}<button onClick={onClose} className={`rounded-lg py-2.5 text-sm font-bold ${linkTo&&linkLabel?"border border-stone-300 text-stone-600":"bg-brand text-white"}`}>확인</button></div></section></div>;
}
