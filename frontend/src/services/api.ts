import { MUNICIPALITIES, POLICIES, REGION_RECOMMENDATIONS } from "../data/mockData";
import type { Policy, QuickCondition, RegionRecommendation } from "../types";

const delay = (ms = 550) => new Promise((resolve) => window.setTimeout(resolve, ms));
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "http://localhost:8080/api";
const POLICY_ID_ALIASES: Record<string, string> = {
  CB_HOUSING_001: "youth-rent",
  CB_JOB_001: "job-settle",
  CB_STARTUP_001: "startup",
};

async function request<T>(path: string, options: RequestInit = {}): Promise<T> {
  const response = await fetch(`${API_BASE_URL}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
  const data = await response.json();
  if (!response.ok) {
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
  async getRegion(id: string): Promise<RegionRecommendation | undefined> {
    return withMockFallback(
      () => request<RegionRecommendation>(`/regions/${encodeURIComponent(id)}`),
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
};
