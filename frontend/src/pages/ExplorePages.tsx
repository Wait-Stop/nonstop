import { Fragment, useState } from "react";
import {
  BarChart3,
  Bell,
  ChevronRight,
  Eye,
  Heart,
  Image,
  MessageCircle,
  Mountain,
  Pencil,
  Search,
  Users,
  X,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { MUNICIPALITIES } from "../data/mockData";

export function RegionsPage() {
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-9">
      <span className="text-xs font-bold text-brand">EXPLORE CHUNGBUK</span>
      <h1 className="mt-2 text-3xl font-bold">추천 대상 지역 알아보기</h1>
      <p className="mt-3 text-sm text-stone-500">
        청주·충주·진천·옥천·괴산 5개 지역의 생활환경과 정착 특징을 살펴보세요.
      </p>
      <section className="mt-7 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
        {MUNICIPALITIES.map((region) => (
          <article
            key={region.id}
            className="overflow-hidden rounded-2xl border border-stone-200 bg-white shadow-card"
          >
            <div className="relative h-40 overflow-hidden bg-stone-100">
              <img
                src={region.image}
                alt={`${region.name} 실제 지역 풍경`}
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/55 to-transparent" />
              <h2 className="absolute bottom-4 left-5 text-xl font-bold text-white">
                {region.name}
              </h2>
              <a
                href={region.imageSource}
                target="_blank"
                rel="noreferrer"
                className="absolute bottom-3 right-3 text-[8px] text-white/70"
              >
                사진 출처
              </a>
            </div>
            <div className="p-5">
              <p className="text-xs font-bold text-brand">{region.type}</p>
              <p className="mt-2 min-h-[40px] text-[11px] leading-5 text-stone-500">
                {region.description}
              </p>
              <div className="mt-4 flex flex-wrap gap-1">
                {region.highlights.map((item) => (
                  <span
                    key={item}
                    className="rounded-full bg-brand-light px-2.5 py-1 text-[10px] text-brand-dark"
                  >
                    {item}
                  </span>
                ))}
              </div>
              <Link
                to={`/regions/${region.id}`}
                className="mt-5 block rounded-lg border border-brand py-2.5 text-center text-xs font-bold text-brand"
              >
                지역 상세 보기
              </Link>
            </div>
          </article>
        ))}
      </section>
    </main>
  );
}

export function RegionComparePage() {
  const [selected, setSelected] = useState(["cheongju", "chungju"]);
  const toggle = (id: string) =>
    setSelected((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : current.length < 3
          ? [...current, id]
          : current,
    );
  const compared = MUNICIPALITIES.filter((item) => selected.includes(item.id));
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-9">
      <span className="text-xs font-bold text-brand">REGION COMPARE</span>
      <h1 className="mt-2 text-3xl font-bold">지역 비교하기</h1>
      <p className="mt-3 text-sm text-stone-500">
        비교할 지역을 2~3곳 선택하면 생활 조건을 한눈에 비교할 수 있어요.
      </p>
      <section className="mt-6 rounded-2xl border border-stone-200 bg-white p-5">
        <div className="flex flex-wrap gap-2">
          {MUNICIPALITIES.map((region) => (
            <button
              key={region.id}
              onClick={() => toggle(region.id)}
              className={`rounded-lg border px-4 py-2 text-xs font-bold ${selected.includes(region.id) ? "border-brand bg-brand text-white" : "border-stone-200 text-stone-500"}`}
            >
              {region.name}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[10px] text-stone-400">
          현재 {selected.length}개 지역 선택 · 최대 3개
        </p>
      </section>
      {compared.length < 2 ? (
        <div className="mt-7 rounded-2xl bg-brand-light p-10 text-center text-sm font-bold text-brand">
          비교할 지역을 2곳 이상 선택해 주세요.
        </div>
      ) : (
        <section className="mt-7 overflow-hidden rounded-2xl border border-stone-200 bg-white">
          <div
            className={`grid ${compared.length === 2 ? "grid-cols-[150px_1fr_1fr]" : "grid-cols-[150px_1fr_1fr_1fr]"}`}
          >
            <div className="bg-stone-50 p-5" />
            {compared.map((region) => (
              <div key={region.id} className="border-l border-stone-100 p-4">
                <img
                  src={region.image}
                  alt={region.name}
                  className="h-28 w-full rounded-xl object-cover"
                />
                <h2 className="mt-3 text-lg font-bold">{region.name}</h2>
                <p className="text-[10px] text-brand">{region.type}</p>
              </div>
            ))}
            {[
              [
                "지역 특징",
                (r: (typeof MUNICIPALITIES)[number]) => r.description,
              ],
              [
                "주요 생활권",
                (r: (typeof MUNICIPALITIES)[number]) =>
                  r.highlights.join(" · "),
              ],
              [
                "예상 월세",
                (r: (typeof MUNICIPALITIES)[number]) =>
                  r.id === "cheongju"
                    ? "58만원"
                    : r.id === "chungju"
                      ? "45만원"
                      : "40만원대",
              ],
              [
                "교통 환경",
                (r: (typeof MUNICIPALITIES)[number]) =>
                  r.id === "cheongju"
                    ? "공항·버스 중심"
                    : r.id === "chungju"
                      ? "철도·버스 중심"
                      : "자가용 권장",
              ],
              [
                "추천 생활 유형",
                (r: (typeof MUNICIPALITIES)[number]) => r.type,
              ],
            ].map(([label, getValue]) => (
              <Fragment key={String(label)}>
                <div className="border-t border-stone-100 bg-stone-50 p-5 text-xs font-bold">
                  {String(label)}
                </div>
                {compared.map((region) => (
                  <div
                    key={`${String(label)}-${region.id}`}
                    className="border-l border-t border-stone-100 p-5 text-xs leading-5 text-stone-600"
                  >
                    {(getValue as (r: typeof region) => string)(region)}
                  </div>
                ))}
              </Fragment>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}

const COMMUNITY_NOTICE = [
  "공지",
  "[필독] 충북올겨 커뮤니티 이용규칙",
  "운영자",
  "-",
  "0",
  `충북올겨 커뮤니티는 충북 정착 경험과 지역 정보를 안전하게 나누는 공간입니다.

1. 전화번호, 상세 주소, 직장·학교 등 개인을 특정할 수 있는 정보는 게시하지 마세요.
2. 욕설, 조롱, 혐오 표현과 지역·성별·직업 등을 이유로 한 비하를 금지합니다.
3. 정책, 생활비, 교통 정보는 가능한 경우 출처와 확인 날짜를 함께 적어주세요.
4. 상업 광고, 반복 홍보, 금전 거래 유도 및 불법 중개 게시물은 제한됩니다.
5. 직접 작성했거나 사용 허가를 받은 글과 이미지만 게시해 주세요.
6. 운영규칙을 위반한 게시물은 검토 후 숨김·삭제되거나 작성이 제한될 수 있습니다.

서로의 상황과 선택을 존중하며 유용한 충북 생활 정보를 나눠주세요.`,
];

export function CommunityPage() {
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();
  const [category, setCategory] = useState("전체글");
  const [tab, setTab] = useState<"home" | "popular" | "guide">("home");
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [writerOpen, setWriterOpen] = useState(false);
  const [selectedPost, setSelectedPost] = useState<string | null>(null);
  const [draft, setDraft] = useState({
    category: "정착후기",
    title: "",
    content: "",
  });
  const [comment, setComment] = useState("");
  const [commentsByPost, setCommentsByPost] = useState<
    Record<string, string[]>
  >({});
  const [userPosts, setUserPosts] = useState<string[][]>(() => {
    const saved = localStorage.getItem("chungbuk-olgyeo-community-posts");
    return saved ? (JSON.parse(saved) as string[][]) : [];
  });
  const allPosts = [COMMUNITY_NOTICE, ...userPosts];
  const normalizedCategory = category.replace(/\s/g, "").replace("게시판", "");
  const matchesCategory = (postCategory: string) => {
    if (postCategory === "공지") return true;
    if (category === "전체글") return true;
    if (category === "자유게시판")
      return ["자유게시판", "일상"].includes(postCategory);
    return postCategory.replace(/\s/g, "") === normalizedCategory;
  };
  const visiblePosts = allPosts
    .filter((post) => matchesCategory(post[0]))
    .filter((post) =>
      `${post[1]} ${post[2]}`.toLowerCase().includes(query.toLowerCase()),
    )
    .sort((a, b) =>
      tab === "popular"
        ? Number(b[3].replace(",", "")) - Number(a[3].replace(",", ""))
        : 0,
    );
  const noticePosts = visiblePosts.filter((post) => post[0] === "공지");
  const regularPosts = visiblePosts.filter((post) => post[0] !== "공지");
  const pageSize = 5;
  const totalPages = Math.max(1, Math.ceil(regularPosts.length / pageSize));
  const currentPage = Math.min(page, totalPages);
  const pagedPosts = [
    ...noticePosts,
    ...regularPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize),
  ];
  const openWriter = () => {
    if (!isLoggedIn) {
      navigate("/login-required", { state: { from: "/community" } });
      return;
    }
    if (category === "자유게시판")
      setDraft((current) => ({ ...current, category: "자유게시판" }));
    setWriterOpen(true);
  };
  const submitPost = () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    const next = [
      [
        draft.category,
        draft.title.trim(),
        profile.name,
        "0",
        "0",
        draft.content.trim(),
      ],
      ...userPosts,
    ];
    setUserPosts(next);
    localStorage.setItem(
      "chungbuk-olgyeo-community-posts",
      JSON.stringify(next),
    );
    setDraft({ category: "정착후기", title: "", content: "" });
    setWriterOpen(false);
    setCategory("전체글");
    setTab("home");
  };
  const activePost = allPosts.find((post) => post[1] === selectedPost);
  return (
    <main className="mx-auto max-w-[1180px] px-6 py-8">
      <header className="border-b border-stone-300 pb-6">
        <div className="flex flex-col justify-between gap-5 sm:flex-row sm:items-end">
          <div className="flex items-start gap-4">
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-emerald-200 bg-emerald-50/60 text-brand">
              <Users size={21} strokeWidth={1.7} />
            </span>
            <div>
              <p className="text-[10px] font-bold tracking-[.08em] text-brand">
                충북올겨 커뮤니티
              </p>
              <h1 className="mt-1 text-[26px] font-bold tracking-[-0.04em]">
                충북 생활 이야기
              </h1>
              <p className="mt-2 text-xs text-stone-500">
                정착 경험과 지역 정보를 이웃들과 편하게 나눠보세요.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-5 text-[11px] text-stone-500">
            <span>
              <b className="mr-1 text-stone-800">등록된 글</b>{" "}
              {userPosts.length}
            </span>
            <span className="h-3 w-px bg-stone-300" />
            <span>
              <b className="mr-1 text-stone-800">작성한 댓글</b>{" "}
              {Object.values(commentsByPost).reduce(
                (total, items) => total + items.length,
                0,
              )}
            </span>
          </div>
        </div>
        <div className="mt-6 flex gap-6 text-xs font-semibold">
          {[
            ["home", "커뮤니티 홈"],
            ["popular", "인기글"],
            ["guide", "이용 안내"],
          ].map(([id, label]) => (
            <button
              key={id}
              onClick={() => {
                setTab(id as typeof tab);
                setPage(1);
              }}
              className={`border-b-2 pb-2 ${tab === id ? "border-brand text-brand" : "border-transparent text-stone-500 hover:text-stone-800"}`}
            >
              {label}
            </button>
          ))}
        </div>
      </header>

      {tab === "guide" ? (
        <section className="mx-auto mt-8 max-w-4xl border-y border-stone-300 bg-white py-8">
          <div className="px-7">
            <p className="text-[10px] font-bold text-brand">COMMUNITY GUIDE</p>
            <h2 className="mt-2 text-2xl font-bold">커뮤니티 이용수칙</h2>
            <p className="mt-3 text-xs leading-6 text-stone-500">
              충북 생활 경험을 안전하게 나누기 위한 기준입니다. 게시글과 댓글
              모두 동일하게 적용됩니다.
            </p>
          </div>
          <div className="mt-7 grid border-t border-stone-200 md:grid-cols-2">
            {[
              [
                "01",
                "개인정보와 사생활 보호",
                "전화번호·상세 주소·직장·학교·차량번호 등 개인을 특정할 수 있는 정보는 본인과 타인의 것 모두 게시하지 마세요.",
              ],
              [
                "02",
                "존중하는 대화",
                "욕설, 조롱, 혐오 표현, 지역·성별·직업 등을 이유로 한 비하, 반복적인 시비와 괴롭힘을 금지합니다.",
              ],
              [
                "03",
                "정확한 지역·정책 정보",
                "지원정책, 비용, 교통 정보는 확인한 출처와 기준일을 적어주세요. 확인되지 않은 내용을 사실처럼 단정하지 마세요.",
              ],
              [
                "04",
                "광고와 거래 제한",
                "상업 광고, 추천인 모집, 반복 링크, 부동산·상품 판매 유도, 금전 거래 및 불법적인 중개 게시물은 제한됩니다.",
              ],
              [
                "05",
                "저작권과 초상권",
                "직접 작성하거나 사용 허가를 받은 글과 이미지만 올려주세요. 타인의 사진과 글을 옮길 때는 권리와 출처를 확인해야 합니다.",
              ],
              [
                "06",
                "신고와 운영 조치",
                "문제가 있는 글은 게시글 단위로 신고할 수 있습니다. 운영진 검토 후 숨김·삭제·작성 제한 조치가 적용될 수 있습니다.",
              ],
            ].map(([number, title, description], index) => (
              <article
                key={number}
                className={`px-7 py-6 ${index % 2 === 0 ? "md:border-r" : ""} ${index < 4 ? "border-b border-stone-200" : ""}`}
              >
                <div className="flex gap-4">
                  <b className="text-sm text-brand">{number}</b>
                  <div>
                    <h3 className="text-sm font-bold">{title}</h3>
                    <p className="mt-2 text-xs leading-6 text-stone-500">
                      {description}
                    </p>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="mx-7 mt-7 border-l-2 border-brand bg-stone-50 px-5 py-4">
            <h3 className="text-xs font-bold">운영 및 제재 기준</h3>
            <p className="mt-2 text-[11px] leading-5 text-stone-500">
              신고되었다는 이유만으로 즉시 삭제하지 않으며, 내용과 맥락을
              검토합니다. 위반 정도에 따라 안내, 게시물 숨김 또는 삭제, 일정
              기간 작성 제한, 반복·중대한 위반 시 이용 제한이 적용될 수
              있습니다. 권리침해나 불법 콘텐츠는 관계 기관의 요청에 따라 별도
              조치될 수 있습니다.
            </p>
          </div>
        </section>
      ) : (
        <div className="mt-5 grid gap-5 lg:grid-cols-[190px_1fr_250px]">
          <aside className="rounded-xl border border-stone-200 bg-white p-3">
            <button
              onClick={openWriter}
              className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-xs font-bold text-white"
            >
              <Pencil size={14} />
              글쓰기
            </button>
            {[
              "전체글",
              "정착 후기",
              "지역 질문",
              "지역 정보",
              "정책 정보",
              "모임·동행",
              "자유게시판",
            ].map((item) => (
              <button
                key={item}
                onClick={() => {
                  setCategory(item);
                  setPage(1);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-xs ${category === item ? "bg-brand-light font-bold text-brand" : "text-stone-600 hover:bg-stone-50"}`}
              >
                {item}
                <ChevronRight size={12} />
              </button>
            ))}
          </aside>
          <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
            <div className="flex flex-col justify-between gap-3 border-b border-stone-200 p-5 sm:flex-row sm:items-center">
              <div>
                <h2 className="text-lg font-bold">
                  {tab === "popular" ? "인기글" : category}
                </h2>
                <p className="mt-1 text-[10px] text-stone-400">
                  게시글 {regularPosts.length}개
                </p>
              </div>
              <div className="relative">
                <input
                  value={query}
                  onChange={(event) => {
                    setQuery(event.target.value);
                    setPage(1);
                  }}
                  className="h-9 w-full rounded-lg border border-stone-300 pl-3 pr-9 text-xs sm:w-52"
                  placeholder="제목 또는 작성자 검색"
                />
                <Search
                  size={14}
                  className="absolute right-3 top-3 text-stone-400"
                />
              </div>
            </div>
            <div>
              {pagedPosts.length ? (
                pagedPosts.map(
                  ([tag, title, author, views, postComments], index) => (
                    <button
                      onClick={() => setSelectedPost(title)}
                      key={`${title}-${index}`}
                      className={`flex w-full items-center gap-3 border-b px-5 py-4 text-left ${tag === "공지" ? "border-red-200 bg-red-50 hover:bg-red-100" : "border-stone-100 hover:bg-stone-50"}`}
                    >
                      <span
                        className={`w-16 shrink-0 text-[10px] font-bold ${tag === "공지" ? "text-red-600" : "text-brand"}`}
                      >
                        {tag === "공지" ? "📌 공지" : tag}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span
                          className={`truncate text-[13px] font-medium ${tag === "공지" ? "font-bold text-red-700" : ""}`}
                        >
                          {title}{" "}
                          <b className="ml-1 text-[10px] text-brand">
                            [{postComments}]
                          </b>
                        </span>
                        <span className="mt-1 block text-[10px] text-stone-400">
                          {author}
                        </span>
                      </span>
                      <span className="hidden items-center gap-1 text-[10px] text-stone-400 sm:flex">
                        <Eye size={12} />
                        {views}
                      </span>
                    </button>
                  ),
                )
              ) : (
                <div className="px-6 py-16 text-center">
                  <p className="text-sm font-bold text-stone-600">
                    아직 등록된 게시글이 없습니다.
                  </p>
                  <p className="mt-2 text-xs text-stone-400">
                    첫 번째 충북 생활 이야기를 작성해 보세요.
                  </p>
                  <button
                    onClick={openWriter}
                    className="mt-5 rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-white"
                  >
                    첫 글 작성하기
                  </button>
                </div>
              )}
            </div>
            {totalPages > 1 && (
              <nav
                aria-label="게시글 페이지"
                className="flex justify-center gap-1 border-t border-stone-100 p-5"
              >
                {Array.from(
                  { length: totalPages },
                  (_, index) => index + 1,
                ).map((number) => (
                  <button
                    key={number}
                    onClick={() => setPage(number)}
                    aria-current={currentPage === number ? "page" : undefined}
                    className={`h-8 min-w-8 rounded px-2 text-xs font-semibold ${currentPage === number ? "bg-brand text-white" : "border border-stone-200 text-stone-500 hover:border-brand hover:text-brand"}`}
                  >
                    {number}
                  </button>
                ))}
              </nav>
            )}
          </section>
          <aside className="space-y-4">
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <BarChart3 size={16} className="text-brand" />
                지금 인기 있는 글
              </h2>
              {userPosts.length ? (
                <ol className="mt-4 space-y-4">
                  {[...userPosts]
                    .sort((a, b) => Number(b[3]) - Number(a[3]))
                    .slice(0, 4)
                    .map((post, index) => (
                      <li key={post[1]}>
                        <button
                          onClick={() => setSelectedPost(post[1])}
                          className="flex gap-3 text-left"
                        >
                          <b className="text-sm text-brand">{index + 1}</b>
                          <span>
                            <span className="line-clamp-2 text-xs leading-5">
                              {post[1]}
                            </span>
                            <span className="text-[9px] text-stone-400">
                              댓글 {post[4]}
                            </span>
                          </span>
                        </button>
                      </li>
                    ))}
                </ol>
              ) : (
                <p className="mt-4 text-xs leading-5 text-stone-400">
                  게시글이 등록되면 인기 글을 확인할 수 있습니다.
                </p>
              )}
            </div>
            <div className="rounded-xl border border-stone-200 bg-white p-5">
              <h2 className="flex items-center gap-2 text-sm font-bold">
                <Bell size={16} className="text-brand" />
                커뮤니티 소식
              </h2>
              <p className="mt-3 text-xs leading-5 text-stone-500">
                게시글 작성과 댓글 참여는 로그인 후 이용할 수 있습니다.
              </p>
              <button
                onClick={() => setTab("guide")}
                className="mt-4 w-full rounded-lg border border-brand py-2 text-xs font-bold text-brand"
              >
                이용 안내 보기
              </button>
            </div>
          </aside>
        </div>
      )}

      {writerOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <section className="w-full max-w-xl rounded-xl bg-white p-6 shadow-2xl">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-brand">새 게시글</p>
                <h2 className="mt-1 text-xl font-bold">이야기 작성하기</h2>
              </div>
              <button onClick={() => setWriterOpen(false)} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            <label className="mt-6 block text-xs font-bold">게시판</label>
            <select
              value={draft.category}
              onChange={(event) =>
                setDraft({ ...draft, category: event.target.value })
              }
              className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-sm"
            >
              {[
                "정착후기",
                "질문",
                "지역정보",
                "정책정보",
                "모임",
                "자유게시판",
              ].map((item) => (
                <option key={item}>{item}</option>
              ))}
            </select>
            <label className="mt-4 block text-xs font-bold">제목</label>
            <input
              value={draft.title}
              onChange={(event) =>
                setDraft({ ...draft, title: event.target.value })
              }
              maxLength={80}
              className="mt-2 h-11 w-full rounded-lg border border-stone-300 px-3 text-sm"
              placeholder="제목을 입력하세요"
            />
            <label className="mt-4 block text-xs font-bold">내용</label>
            <textarea
              value={draft.content}
              onChange={(event) =>
                setDraft({ ...draft, content: event.target.value })
              }
              className="mt-2 h-40 w-full resize-none rounded-lg border border-stone-300 p-3 text-sm"
              placeholder={
                draft.category === "자유게시판"
                  ? "충북 생활과 관련된 자유로운 이야기를 작성해 주세요."
                  : "충북 생활 경험이나 궁금한 내용을 작성해 주세요."
              }
            />
            <div className="mt-5 flex justify-end gap-2">
              <button
                onClick={() => setWriterOpen(false)}
                className="rounded-lg border border-stone-300 px-5 py-2.5 text-xs font-bold"
              >
                취소
              </button>
              <button
                onClick={submitPost}
                disabled={!draft.title.trim() || !draft.content.trim()}
                className="rounded-lg bg-brand px-5 py-2.5 text-xs font-bold text-white disabled:bg-stone-300"
              >
                등록하기
              </button>
            </div>
          </section>
        </div>
      )}

      {activePost && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5">
          <article className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-7 shadow-2xl">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-bold text-brand">
                  {activePost[0]}
                </span>
                <h2 className="mt-2 text-xl font-bold">{activePost[1]}</h2>
                <p className="mt-2 text-[10px] text-stone-400">
                  {activePost[2]} · 조회 {activePost[3]}
                </p>
              </div>
              <button onClick={() => setSelectedPost(null)} aria-label="닫기">
                <X size={20} />
              </button>
            </div>
            <p className="mt-7 min-h-28 whitespace-pre-wrap border-y border-stone-200 py-6 text-sm leading-7 text-stone-700">
              {activePost[5]}
            </p>
            <div className="mt-5 flex items-center gap-4">
              <button className="flex items-center gap-1.5 text-xs text-stone-500">
                <Heart size={15} />
                공감
              </button>
              <span className="flex items-center gap-1.5 text-xs text-stone-500">
                <MessageCircle size={15} />
                댓글{" "}
                {Number(activePost[4]) +
                  (commentsByPost[activePost[1]]?.length || 0)}
              </span>
            </div>
            <div className="mt-5 space-y-2">
              {(commentsByPost[activePost[1]] || []).map((item, index) => (
                <div
                  key={`${item}-${index}`}
                  className="rounded-lg bg-stone-50 p-3 text-xs"
                >
                  <b>{profile.name}</b>
                  <p className="mt-1 text-stone-600">{item}</p>
                </div>
              ))}
            </div>
            <div className="mt-4 flex gap-2">
              <input
                value={comment}
                onChange={(event) => setComment(event.target.value)}
                placeholder={
                  isLoggedIn
                    ? "댓글을 입력하세요"
                    : "로그인 후 댓글을 작성할 수 있습니다."
                }
                disabled={!isLoggedIn}
                className="h-10 flex-1 rounded-lg border border-stone-300 px-3 text-xs disabled:bg-stone-50"
              />
              <button
                onClick={() => {
                  if (comment.trim()) {
                    setCommentsByPost((current) => ({
                      ...current,
                      [activePost[1]]: [
                        ...(current[activePost[1]] || []),
                        comment.trim(),
                      ],
                    }));
                    setComment("");
                  }
                }}
                disabled={!isLoggedIn || !comment.trim()}
                className="rounded-lg bg-brand px-4 text-xs font-bold text-white disabled:bg-stone-300"
              >
                등록
              </button>
            </div>
          </article>
        </div>
      )}
    </main>
  );
}
