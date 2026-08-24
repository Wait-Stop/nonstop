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
  transportScore?: number;
  commuteBasis?: {
    origin: string;
    destination: string;
    method: string;
    caution: string;
  };
  infrastructure: string[];
  policyCount: number;
  relatedPolicyIds?: string[];
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

export interface CostSimulation {
  userId: string | null;
  regionId: string;
  regionName: string;
  income: {
    monthlyGrossIncome: number;
    estimatedMonthlyNetIncome: number;
  };
  costs: {
    rent: number;
    maintenanceFee: number;
    food: number;
    transportation: number;
    telecom: number;
    utilities: number;
    otherLiving: number;
    totalMonthlyCost: number;
  };
  policySupport: {
    included: boolean;
    monthlyAmount: number;
  };
  result: {
    monthlyBalance: number;
    savingPossibleAmount: number;
    initialRequiredAmount: number;
    rentBurdenRate: number;
    stabilityLevel: string;
  };
  cautions: string[];
  dataSources?: {
    housing: {
      source: string;
      sampleCount: number;
      status: "external" | "fallback";
    };
    livingCosts: {
      source: string;
      status: "external" | "fallback";
    };
  };
}

export interface CommuteSimulation {
  userId: string | null;
  regionId: string;
  regionName: string;
  job: string | null;
  origin: {
    name?: string;
  };
  destination: {
    name?: string;
  };
  transportType: string;
  estimatedOneWayMinutes: number;
  estimatedRoundTripMinutes: number;
  maxCommuteMinutes: number;
  isCommutePossible: boolean;
  monthlyTransportationCost: number;
  carNeed: string;
  commuteLevel: string;
  cautions: string[];
}

export interface AiChatResponse {
  answer: string;
  usedContext: {
    condition?: Partial<QuickCondition>;
    regionIds?: string[];
    policyIds?: string[];
  };
  isMock: boolean;
  caution: string;
}
