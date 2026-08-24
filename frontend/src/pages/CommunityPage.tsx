import { useEffect, useState } from "react";
import { Eye, MessageCircle, Pencil, Search, Trash2, Users, X } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { api } from "../services/api";
import type { CommunityPost } from "../types";

const NOTICE: CommunityPost = {
  id: "official-notice",
  category: "공지",
  title: "[필독] 충북올겨 커뮤니티 이용규칙",
  excerpt: "안전하고 유익한 커뮤니티 이용을 위한 운영규칙입니다.",
  content: `충북올겨 커뮤니티는 충북 정착 경험과 지역 정보를 안전하게 나누는 공간입니다.

1. 전화번호, 상세 주소 등 개인을 특정할 수 있는 정보는 게시하지 마세요.
2. 욕설, 조롱, 혐오 표현과 비하는 금지합니다.
3. 정책, 생활비, 교통 정보는 가능한 경우 출처와 확인 날짜를 함께 적어주세요.
4. 상업 광고, 반복 홍보, 금전 거래 유도와 불법 중개 게시물은 제한합니다.
5. 직접 작성했거나 사용 허가를 받은 글과 이미지만 게시해 주세요.
6. 운영규칙을 위반한 게시물은 검토 후 숨김·삭제되거나 작성이 제한될 수 있습니다.`,
  author: { id: "admin", name: "운영자" },
  authorName: "운영자",
  viewCount: 0,
  commentCount: 0,
  likeCount: 0,
  createdAt: "2026-08-01T00:00:00.000Z",
  comments: [],
};

const CATEGORY_OPTIONS = ["전체글", "정착 후기", "지역 질문", "지역 정보", "정책 정보", "모임·동행", "자유게시판"];
const CREATE_CATEGORY: Record<string, string> = { "정착 후기": "정착후기", "지역 질문": "질문", "지역 정보": "지역정보", "정책 정보": "정책정보", "모임·동행": "모임", 자유게시판: "자유게시판" };

export default function CommunityPage() {
  const navigate = useNavigate();
  const { isLoggedIn, profile } = useAuth();
  const [category, setCategory] = useState("전체글");
  const [tab, setTab] = useState<"home" | "popular">("home");
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [writerOpen, setWriterOpen] = useState(false);
  const [activePost, setActivePost] = useState<CommunityPost | null>(null);
  const [draft, setDraft] = useState({ category: "정착후기", title: "", content: "" });
  const [comment, setComment] = useState("");

  const loadPosts = async () => {
    setLoading(true);
    setError("");
    try {
      const result = await api.getCommunityPosts({ category, q: query, tab, page });
      setPosts(result.posts);
      setTotalPages(result.meta.totalPages);
    } catch (requestError) {
      setError(requestError instanceof Error ? requestError.message : "게시글을 불러오지 못했습니다.");
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { void loadPosts(); }, [category, query, tab, page]);

  const openPost = async (post: CommunityPost) => {
    if (post.id === NOTICE.id) { setActivePost(NOTICE); return; }
    try { setActivePost(await api.getCommunityPost(post.id)); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "게시글을 열지 못했습니다."); }
  };

  const openWriter = () => {
    if (!isLoggedIn) { navigate("/login-required", { state: { from: "/community" } }); return; }
    setWriterOpen(true);
  };

  const submitPost = async () => {
    if (!draft.title.trim() || !draft.content.trim()) return;
    try {
      await api.createCommunityPost({ ...draft, title: draft.title.trim(), content: draft.content.trim() });
      setDraft({ category: "정착후기", title: "", content: "" });
      setWriterOpen(false);
      setCategory("전체글"); setTab("home"); setPage(1);
      await loadPosts();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "게시글을 등록하지 못했습니다."); }
  };

  const submitComment = async () => {
    if (!activePost || !comment.trim() || activePost.id === NOTICE.id) return;
    try {
      await api.createCommunityComment(activePost.id, comment.trim());
      setComment("");
      setActivePost(await api.getCommunityPost(activePost.id));
      await loadPosts();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "댓글을 등록하지 못했습니다."); }
  };

  const deletePost = async (postId: string) => {
    if (!window.confirm("작성한 게시글을 삭제할까요? 댓글도 함께 삭제됩니다.")) return;
    try { await api.deleteCommunityPost(postId); setActivePost(null); await loadPosts(); }
    catch (requestError) { setError(requestError instanceof Error ? requestError.message : "게시글을 삭제하지 못했습니다."); }
  };

  const deleteComment = async (postId: string, commentId: string) => {
    if (!window.confirm("작성한 댓글을 삭제할까요?")) return;
    try {
      await api.deleteCommunityComment(postId, commentId);
      setActivePost(await api.getCommunityPost(postId));
      await loadPosts();
    } catch (requestError) { setError(requestError instanceof Error ? requestError.message : "댓글을 삭제하지 못했습니다."); }
  };

  const displayedPosts = page === 1 && (!query || `${NOTICE.title} ${NOTICE.content}`.includes(query)) ? [NOTICE, ...posts.filter((post) => post.id !== NOTICE.id)] : posts;

  return <main className="mx-auto max-w-[1180px] px-6 py-8">
    <header className="border-b border-stone-300 pb-6"><div className="flex items-start gap-4"><span className="flex h-11 w-11 items-center justify-center rounded-lg bg-emerald-50 text-brand"><Users size={21}/></span><div><p className="text-[10px] font-bold text-brand">충북올겨 커뮤니티</p><h1 className="mt-1 text-[26px] font-bold">충북 생활 이야기</h1><p className="mt-2 text-xs text-stone-500">정착 경험과 지역 정보를 이웃과 나눠보세요.</p></div></div></header>
    {error && <div className="mt-4 rounded-lg bg-red-50 px-4 py-3 text-xs text-red-700">{error}</div>}
    <div className="mt-5 grid gap-5 lg:grid-cols-[190px_1fr]">
      <aside className="h-fit rounded-xl border border-stone-200 bg-white p-3"><button onClick={openWriter} className="mb-3 flex w-full items-center justify-center gap-2 rounded-lg bg-brand py-2.5 text-xs font-bold text-white"><Pencil size={14}/>글쓰기</button>{CATEGORY_OPTIONS.map((item)=><button key={item} onClick={()=>{setCategory(item);setPage(1);}} className={`flex w-full rounded-lg px-3 py-2.5 text-left text-xs ${category===item?"bg-brand-light font-bold text-brand":"text-stone-600 hover:bg-stone-50"}`}>{item}</button>)}</aside>
      <section className="overflow-hidden rounded-xl border border-stone-200 bg-white">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-stone-200 p-5"><div className="flex gap-2"><button onClick={()=>{setTab("home");setPage(1);}} className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab==="home"?"bg-brand text-white":"bg-stone-100 text-stone-500"}`}>최신글</button><button onClick={()=>{setTab("popular");setPage(1);}} className={`rounded-full px-3 py-1.5 text-xs font-bold ${tab==="popular"?"bg-brand text-white":"bg-stone-100 text-stone-500"}`}>인기글</button></div><div className="relative"><input value={query} onChange={(event)=>{setQuery(event.target.value);setPage(1);}} className="h-9 rounded-lg border border-stone-300 pl-3 pr-9 text-xs" placeholder="제목 또는 작성자 검색"/><Search size={14} className="absolute right-3 top-3 text-stone-400"/></div></div>
        <div>{loading?<p className="p-12 text-center text-xs text-stone-400">게시글을 불러오는 중입니다.</p>:displayedPosts.length?displayedPosts.map((post)=><button key={post.id} onClick={()=>void openPost(post)} className={`flex w-full items-center gap-3 border-b px-5 py-4 text-left ${post.category==="공지"?"border-red-200 bg-red-50 hover:bg-red-100":"border-stone-100 hover:bg-stone-50"}`}><span className={`w-16 shrink-0 text-[10px] font-bold ${post.category==="공지"?"text-red-600":"text-brand"}`}>{post.category==="공지"?"📌 공지":post.category}</span><span className="min-w-0 flex-1"><b className={`block truncate text-[13px] ${post.category==="공지"?"text-red-700":""}`}>{post.title}</b><small className="mt-1 block text-stone-400">{post.authorName}</small></span><span className="hidden items-center gap-1 text-[10px] text-stone-400 sm:flex"><Eye size={12}/>{post.viewCount}</span><span className="hidden items-center gap-1 text-[10px] text-stone-400 sm:flex"><MessageCircle size={12}/>{post.commentCount}</span></button>):<p className="p-12 text-center text-xs text-stone-400">등록된 게시글이 없습니다.</p>}</div>
        {totalPages>1&&<nav className="flex justify-center gap-1 p-5">{Array.from({length:totalPages},(_,index)=>index+1).map((number)=><button key={number} onClick={()=>setPage(number)} className={`h-8 min-w-8 rounded text-xs ${page===number?"bg-brand text-white":"border border-stone-200"}`}>{number}</button>)}</nav>}
      </section>
    </div>
    {writerOpen&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-5"><section className="w-full max-w-xl rounded-xl bg-white p-6"><div className="flex justify-between"><h2 className="text-xl font-bold">이야기 작성하기</h2><button onClick={()=>setWriterOpen(false)} aria-label="닫기"><X/></button></div><label className="mt-5 block text-xs font-bold">게시판</label><select value={draft.category} onChange={(event)=>setDraft({...draft,category:event.target.value})} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm">{Object.entries(CREATE_CATEGORY).map(([label,value])=><option key={value} value={value}>{label}</option>)}</select><label className="mt-4 block text-xs font-bold">제목</label><input value={draft.title} onChange={(event)=>setDraft({...draft,title:event.target.value})} maxLength={80} className="mt-2 h-11 w-full rounded-lg border px-3 text-sm"/><label className="mt-4 block text-xs font-bold">내용</label><textarea value={draft.content} onChange={(event)=>setDraft({...draft,content:event.target.value})} maxLength={3000} className="mt-2 h-40 w-full rounded-lg border p-3 text-sm"/><button onClick={()=>void submitPost()} className="mt-5 w-full rounded-lg bg-brand py-3 text-sm font-bold text-white">등록하기</button></section></div>}
    {activePost&&<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/45 px-5" onMouseDown={(event)=>{if(event.target===event.currentTarget)setActivePost(null);}}><article className="max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-7"><div className="flex items-start justify-between"><div><span className={`text-xs font-bold ${activePost.category==="공지"?"text-red-600":"text-brand"}`}>{activePost.category}</span><h2 className="mt-2 text-xl font-bold">{activePost.title}</h2><p className="mt-2 text-xs text-stone-400">{activePost.authorName} · 조회 {activePost.viewCount}</p></div><div className="flex gap-2">{activePost.author.id===profile.id&&<button onClick={()=>void deletePost(activePost.id)} aria-label="게시글 삭제" className="rounded-lg p-2 text-red-500 hover:bg-red-50"><Trash2 size={18}/></button>}<button onClick={()=>setActivePost(null)} aria-label="닫기"><X/></button></div></div><p className="mt-6 whitespace-pre-wrap border-y py-6 text-sm leading-7 text-stone-700">{activePost.content}</p><div className="mt-5 space-y-2">{activePost.comments?.map((item)=><div key={item.id} className="flex items-start justify-between rounded-lg bg-stone-50 p-3 text-xs"><div><b>{item.authorName}</b><p className="mt-1 text-stone-600">{item.content}</p></div>{item.author.id===profile.id&&<button onClick={()=>void deleteComment(activePost.id,item.id)} aria-label="댓글 삭제" className="text-red-500"><Trash2 size={14}/></button>}</div>)}</div>{activePost.id!==NOTICE.id&&<div className="mt-4 flex gap-2"><input value={comment} onChange={(event)=>setComment(event.target.value)} disabled={!isLoggedIn} placeholder={isLoggedIn?"댓글을 입력하세요":"로그인 후 댓글을 작성할 수 있습니다."} className="h-10 flex-1 rounded-lg border px-3 text-xs disabled:bg-stone-50"/><button onClick={()=>void submitComment()} disabled={!isLoggedIn||!comment.trim()} className="rounded-lg bg-brand px-4 text-xs font-bold text-white disabled:bg-stone-300">등록</button></div>}</article></div>}
  </main>;
}
