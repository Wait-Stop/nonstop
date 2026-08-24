import { MUNICIPALITIES, POLICIES, REGION_RECOMMENDATIONS } from "../data/mockData";
import type { Policy, QuickCondition, RegionRecommendation } from "../types";

const delay = (ms = 550) => new Promise((resolve) => window.setTimeout(resolve, ms));
const POLICY_ID_ALIASES: Record<string, string> = {
  CB_HOUSING_001: "youth-rent",
  CB_JOB_001: "job-settle",
  CB_STARTUP_001: "startup",
};

/**
 * Backend/AI integration boundary.
 * Replace only these functions when API contracts are finalized.
 * Quick recommendations are intentionally returned without persistence.
 */
export const api = {
  async getRecommendations(_condition: QuickCondition, options: { persist: boolean }): Promise<RegionRecommendation[]> {
    await delay();
    // TODO(BE/AI): POST /recommendations with { condition, persist: options.persist }
    void options;
    return REGION_RECOMMENDATIONS;
  },
  async getRegion(id: string): Promise<RegionRecommendation | undefined> {
    await delay(250);
    // TODO(BE): GET /regions/:id
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
  async getPolicies(): Promise<Policy[]> {
    await delay(250);
    // TODO(BE): GET /policies
    return POLICIES;
  },
  async getPolicy(id: string): Promise<Policy | undefined> {
    await delay(200);
    // TODO(BE): GET /policies/:id
    return POLICIES.find((policy) => policy.id === id || policy.id === POLICY_ID_ALIASES[id]);
  },
};
