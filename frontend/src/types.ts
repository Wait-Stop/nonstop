export type SimulationType = "commute" | "budget" | "cost" | "spending";

export interface QuickCondition {
  age: string;
  major: string;
  job: string;
  salary: string;
  rent: string;
  deposit: string;
  transport: string;
  preferredRegions: string[];
  recommendRegion: boolean;
}

export interface RegionRecommendation {
  id: string;
  name: string;
  area: string;
  score: number;
  type: string;
  reasons: string[];
  rent: number;
  commute: number;
  carNeed: string;
  infrastructure: string[];
  policyCount: number;
  image: string;
  imageSource: string;
}

export interface Municipality {
  id: string;
  name: string;
  type: string;
  description: string;
  highlights: string[];
  image: string;
  imageSource: string;
}

export interface Policy {
  id: string;
  title: string;
  category: string;
  region: string;
  benefit: string;
  period: string;
  eligibility: string;
  summary: string;
  status?: string;
  lastChecked?: string;
  detail?: string;
  requiredDocuments?: string[];
  agency?: string;
  applyUrl?: string;
  sourceName?: string;
  sourceUrl?: string;
  caution?: string;
}

export interface UserProfile extends QuickCondition {
  name: string;
  email: string;
  gender: string;
  currentRegion: string;
}
