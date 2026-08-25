import { MUNICIPALITIES, POLICIES, REGION_RECOMMENDATIONS } from "../data/mockData";
import type { AiChatResponse, CommuteSimulation, CommunityComment, CommunityPost, CostSimulation, Policy, QuickCondition, RegionRecommendation, SavedPolicy, SavedRegion, UserProfile } from "../types";

const delay = (ms = 550) => new Promise((resolve) => window.setTimeout(resolve, ms));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";
const TOKEN_KEY = "chungbuk-olgyeo-token";
const PROFILE_KEY = "chungbuk-olgyeo-profile";
export const AUTH_EXPIRED_EVENT = "chungbuk-olgyeo-auth-expired";
const POLICY_ID_ALIASES: Record<string, string> = {
  CB_HOUSING_001: "youth-rent",
  CB_JOB_001: "job-settle",
  CB_STARTUP_001: "startup",
};

const DEFAULT_REGION_ID = "cheongju";

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem(TOKEN_KEY);
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
    if (response.status === 401 && token) {
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(PROFILE_KEY);
      window.dispatchEvent(new Event(AUTH_EXPIRED_EVENT));
      throw new Error("로그인 시간이 만료되었습니다. 다시 로그인해 주세요.");
    }
    throw new Error(data?.message || `${options.method || "GET"} ${path} failed`);
  }
  return data as T;
}

async function withMockFallback<T>(run: () => Promise<T>, fallback: () => Promise<T>): Promise<T> {
  try {
    return await run();
  } catch (error) {
    console.warn("Backend API unavailable. Falling back to local mock data.", error);
    return fallback();
  }
}

/**
 * Backend/AI integration boundary.
 * These functions call the backend MVP APIs and keep mock fallbacks for local UI-only development.
 * Quick recommendations are intentionally returned without persistence.
 */
export const api = {
  async signup(email: string, password: string, name: string) {
    return request<{ id: string; email: string; name: string }>("/auth/signup", {
      method: "POST",
      body: JSON.stringify({ email, password, name }),
    });
  },
  async login(email: string, password: string) {
    const result = await request<{ accessToken: string; user: { id: string; email: string; name: string } }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email, password }),
    });
    localStorage.setItem(TOKEN_KEY, result.accessToken);
    return result.user;
  },
  async getMyProfile(): Promise<Partial<UserProfile> & { email: string; name: string }> {
    const user = await request<Record<string, unknown>>("/users/me");
    return {
      id: String(user.id || ""), name: String(user.name || ""), email: String(user.email || ""),
      age: user.age == null ? "" : String(user.age), gender: String(user.gender || ""),
      currentRegion: String(user.currentRegion || user.current_region || ""), major: String(user.major || ""),
      job: String(user.job || ""), salary: String(user.salary || ""), rent: String(user.rent || ""),
      deposit: String(user.deposit || ""), transport: String(user.transport || ""),
      preferredRegions: (user.preferredRegions || user.preferred_regions || []) as string[],
      recommendRegion: Boolean(user.recommendRegion ?? user.recommend_region),
    };
  },
  async getCommunityPosts(params: { category?: string; q?: string; tab?: string; page?: number } = {}) {
    const query = new URLSearchParams();
    if (params.category) query.set("category", params.category);
    if (params.q) query.set("q", params.q);
    if (params.tab) query.set("tab", params.tab);
    query.set("page", String(params.page || 1));
    query.set("pageSize", "10");
    return request<{ posts: CommunityPost[]; meta: { page: number; total: number; totalPages: number } }>(`/community/posts?${query}`);
  },
  async getCommunityPost(postId: string) { return request<CommunityPost>(`/community/posts/${encodeURIComponent(postId)}`); },
  async createCommunityPost(body: { category: string; title: string; content: string }) {
    return request<CommunityPost>("/community/posts", { method: "POST", body: JSON.stringify(body) });
  },
  async createCommunityComment(postId: string, content: string) {
    return request<CommunityComment>(`/community/posts/${encodeURIComponent(postId)}/comments`, { method: "POST", body: JSON.stringify({ content }) });
  },
  async deleteCommunityPost(postId: string) {
    return request<{ deleted: boolean }>(`/community/posts/${encodeURIComponent(postId)}`, { method: "DELETE" });
  },
  async deleteCommunityComment(postId: string, commentId: string) {
    return request<{ deleted: boolean }>(`/community/posts/${encodeURIComponent(postId)}/comments/${encodeURIComponent(commentId)}`, { method: "DELETE" });
  },
  async updateMyProfile(profile: UserProfile) {
    return request<Record<string, unknown>>("/users/me", {
      method: "PATCH",
      body: JSON.stringify({
        name: profile.name, age: Number.parseInt(profile.age, 10), gender: profile.gender,
        currentRegion: profile.currentRegion, major: profile.major, job: profile.job,
        salary: profile.salary, rent: profile.rent, deposit: profile.deposit,
        transport: profile.transport, preferredRegions: profile.preferredRegions,
        recommendRegion: profile.recommendRegion,
      }),
    });
  },
  async getRecommendations(condition: QuickCondition, options: { persist: boolean }): Promise<RegionRecommendation[]> {
    return withMockFallback(
      async () => {
        const data = await request<RegionRecommendation[] | { items: RegionRecommendation[]; results: RegionRecommendation[] }>("/recommendations", {
          method: "POST",
          body: JSON.stringify({ condition, persist: options.persist }),
        });
        if (Array.isArray(data)) return data;
        return data.items || data.results || [];
      },
      async () => {
        await delay();
        return REGION_RECOMMENDATIONS;
      },
    );
  },
  async getRegion(id: string, condition?: QuickCondition): Promise<RegionRecommendation | undefined> {
    return withMockFallback(
      async () => {
        const detail = await request<RegionRecommendation>(`/regions/${encodeURIComponent(id)}`);
        if (!condition) return detail;
        const recommendations = await this.getRecommendations(condition, { persist: false });
        const matched = recommendations.find((region) => region.id === id);
        return matched ? { ...detail, ...matched, transportScore: detail.transportScore, commuteBasis: detail.commuteBasis, relatedPolicyIds: detail.relatedPolicyIds } : detail;
      },
      async () => {
        await delay(250);
        const recommendation = REGION_RECOMMENDATIONS.find((region) => region.id === id);
        if (recommendation) return recommendation;
        const municipality = MUNICIPALITIES.find((region) => region.id === id);
        if (!municipality) return undefined;
        return {
          id: municipality.id, name: municipality.name, area: municipality.name,
          score: 80, type: municipality.type, reasons: municipality.highlights,
          rent: 42, commute: 25, carNeed: "권장", infrastructure: municipality.highlights,
          policyCount: 8, image: municipality.image, imageSource: municipality.imageSource,
        };
      },
    );
  },
  async getPolicies(): Promise<Policy[]> {
    return withMockFallback(
      async () => {
        const data = await request<Policy[] | { policies: Policy[] }>("/policies");
        return Array.isArray(data) ? data : data.policies;
      },
      async () => {
        await delay(250);
        return POLICIES;
      },
    );
  },
  async getPolicy(id: string): Promise<Policy | undefined> {
    return withMockFallback(
      () => request<Policy>(`/policies/${encodeURIComponent(id)}`),
      async () => {
        await delay(200);
        return POLICIES.find((policy) => policy.id === id || policy.id === POLICY_ID_ALIASES[id]);
      },
    );
  },
  async getSavedRegions(): Promise<SavedRegion[]> {
    const items = await request<Array<{ id: string; score?: number; created_at: string; region: { code?: string; name?: string } }>>("/users/me/saved-regions");
    return items.map((item) => ({
      id: item.id,
      regionId: item.region.code || "",
      name: item.region.name || "지역명 확인 필요",
      score: item.score,
      createdAt: item.created_at,
    }));
  },
  async saveRegion(regionId: string, score: number) {
    return request("/users/me/saved-regions", { method: "POST", body: JSON.stringify({ regionId, score }) });
  },
  async deleteSavedRegion(regionId: string) {
    return request(`/users/me/saved-regions/${encodeURIComponent(regionId)}`, { method: "DELETE" });
  },
  async getSavedPolicies(): Promise<SavedPolicy[]> {
    const items = await request<Array<{ id: string; created_at: string; policy: { code?: string; title?: string; category?: string } }>>("/users/me/saved-policies");
    return items.map((item) => ({
      id: item.id,
      policyId: item.policy.code || "",
      title: item.policy.title || "정책명 확인 필요",
      category: item.policy.category || undefined,
      createdAt: item.created_at,
    }));
  },
  async savePolicy(policyId: string) {
    return request("/users/me/saved-policies", { method: "POST", body: JSON.stringify({ policyId }) });
  },
  async deleteSavedPolicy(policyId: string) {
    return request(`/users/me/saved-policies/${encodeURIComponent(policyId)}`, { method: "DELETE" });
  },
  async calculateCost(condition: QuickCondition, regionId = DEFAULT_REGION_ID): Promise<CostSimulation> {
    return withMockFallback(
      () => request<CostSimulation>("/cost-simulations", {
        method: "POST",
        body: JSON.stringify({
          regionId,
          income: { salary: condition.salary },
          housing: { rent: condition.rent, deposit: condition.deposit, maintenanceFee: 8 },
          transport: { type: condition.transport },
          policy: { includeSupport: true, monthlySupportAmount: 20 },
        }),
      }),
      async () => {
        await delay(250);
        return {
          userId: null,
          regionId,
          regionName: "청주시 오창읍",
          income: { monthlyGrossIncome: 338, estimatedMonthlyNetIncome: 287 },
          costs: { rent: 70, maintenanceFee: 8, food: 48, transportation: 24, telecom: 7, utilities: 10, otherLiving: 36, totalMonthlyCost: 203 },
          policySupport: { included: true, monthlyAmount: 20 },
          result: { monthlyBalance: 104, savingPossibleAmount: 73, initialRequiredAmount: 1208, rentBurdenRate: 24.4, stabilityLevel: "안정" },
          cautions: ["백엔드 연결이 없어서 로컬 기준값으로 계산했습니다."],
        };
      },
    );
  },
  async calculateCommute(condition: QuickCondition, regionId = DEFAULT_REGION_ID): Promise<CommuteSimulation> {
    return withMockFallback(
      () => request<CommuteSimulation>("/commute-simulations", {
        method: "POST",
        body: JSON.stringify({
          regionId,
          job: condition.job,
          transport: { type: condition.transport, maxCommuteMinutes: 40 },
        }),
      }),
      async () => {
        await delay(250);
        return {
          userId: null,
          regionId,
          regionName: "청주시 오창읍",
          job: condition.job,
          origin: { name: "청주시 오창읍" },
          destination: { name: "오창과학산업단지" },
          transportType: condition.transport,
          estimatedOneWayMinutes: 20,
          estimatedRoundTripMinutes: 40,
          maxCommuteMinutes: 40,
          isCommutePossible: true,
          monthlyTransportationCost: 24,
          carNeed: "있으면 편리",
          commuteLevel: "적합",
          cautions: ["백엔드 연결이 없어서 로컬 기준값으로 계산했습니다."],
        };
      },
    );
  },
  async chatWithAi(message: string, condition: QuickCondition, regionId = DEFAULT_REGION_ID, simulation?: { commute?: CommuteSimulation; cost?: CostSimulation }): Promise<AiChatResponse> {
    const asksAboutPolicy = /정책|지원|혜택|신청|자격/.test(message);
    return request<AiChatResponse>("/ai/chat", {
      method: "POST",
      body: JSON.stringify({
        message,
        condition,
        context: {
          regionIds: [regionId],
          policyIds: asksAboutPolicy ? ["CB_HOUSING_001"] : [],
          commute: simulation?.commute ? {
            transportType: simulation.commute.transportType,
            oneWayMinutes: simulation.commute.estimatedOneWayMinutes,
            roundTripMinutes: simulation.commute.estimatedRoundTripMinutes,
            carNeed: simulation.commute.carNeed,
          } : undefined,
          cost: simulation?.cost ? {
            totalMonthlyCost: simulation.cost.costs.totalMonthlyCost,
            monthlyBalance: simulation.cost.result.monthlyBalance,
            savingPossibleAmount: simulation.cost.result.savingPossibleAmount,
          } : undefined,
        },
      }),
    });
  },
};
