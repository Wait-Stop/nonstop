interface LogoProps {
  size?: number;
  textSize?: number;
}

export default function Logo({ size = 38, textSize = 22 }: LogoProps) {
  return (
    <div className="flex items-center gap-2.5" aria-label="충북올겨">
      <svg width={size} height={size} viewBox="0 0 64 64" fill="none" aria-hidden="true">
        <path d="M7 29 31 9l24 20" stroke="#13864F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M14 25v31h34V25" stroke="#13864F" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="21" y="33" width="8" height="8" rx="1" fill="#13864F" />
        <rect x="33" y="33" width="8" height="8" rx="1" fill="#13864F" />
        <rect x="21" y="45" width="8" height="8" rx="1" fill="#13864F" />
        <path d="M39 48c2-10 10-15 20-13-1 11-7 18-20 17 5-6 10-9 16-12-7 2-12 4-16 8Z" fill="#13864F" />
      </svg>
      <span className="font-extrabold tracking-[-0.06em]" style={{ fontSize: textSize }}>
        <span className="text-stone-900">충북</span><span className="text-brand">올겨</span>
      </span>
    </div>
  );
}
