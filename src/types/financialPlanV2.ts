export type PlanSectionKey =
  | "statement"
  | "cashFlow"
  | "investment"
  | "tax"
  | "insurance"
  | "estate"
  | "summary";

export type SectionVisibilityMap = Record<PlanSectionKey, boolean>;

export interface PlanCashBucket {
  id: string;
  title: string;
  targetAmount: string;
  monthlyContribution: string;
  recommendation: string;
}

export interface PlanPhase {
  id: string;
  title: string;
  actions: string[];
}

export interface FinancialPlanV2Document {
  version: 1;
  updatedAt: string;
  clientProfile: {
    clientAge: number | null;
    advisorName: string;
    planHorizon: string;
  };
  visibility: SectionVisibilityMap;
  statement: {
    purpose: string;
    goals: string[];
  };
  cashFlow: {
    overview: string;
    buckets: PlanCashBucket[];
    debtNotes: string[];
  };
  investment: {
    accountRecommendations: string[];
    allocationNotes: string[];
  };
  tax: {
    recommendations: string[];
  };
  insurance: {
    recommendations: string[];
  };
  estate: {
    recommendations: string[];
  };
  summary: {
    summaryText: string;
    phases: PlanPhase[];
  };
}

const makeId = () => Math.random().toString(36).slice(2, 10);

export const createDefaultFinancialPlanV2 = (): FinancialPlanV2Document => ({
  version: 1,
  updatedAt: new Date().toISOString(),
  clientProfile: {
    clientAge: null,
    advisorName: "Charley Edson",
    planHorizon: "2026-2031",
  },
  visibility: {
    statement: true,
    cashFlow: true,
    investment: true,
    tax: true,
    insurance: true,
    estate: true,
    summary: true,
  },
  statement: {
    purpose: "Build intentional wealth with clear priorities, low complexity, and high confidence decisions.",
    goals: ["Goal #1", "Goal #2"],
  },
  cashFlow: {
    overview:
      "Use cash flow as the operating system: protect baseline liquidity, fund near-term goals, and automate investing.",
    buckets: [
      {
        id: makeId(),
        title: "Checking Account",
        targetAmount: "$xx,xxx",
        monthlyContribution: "$x,xxx",
        recommendation:
          "Keep 2 months of expenses in checking to run monthly spending and maintain cash flow stability.",
      },
      {
        id: makeId(),
        title: "Emergency Savings",
        targetAmount: "$xx,xxx",
        monthlyContribution: "$x,xxx",
        recommendation: "Hold 3 months of expenses in a high-yield savings account as your rainy-day reserve.",
      },
      {
        id: makeId(),
        title: "Brokerage Account",
        targetAmount: "$xx,xxx",
        monthlyContribution: "$x,xxx",
        recommendation: "Use taxable brokerage for flexible wealth growth and longer-term goals.",
      },
    ],
    debtNotes: ["Debt review notes..."],
  },
  investment: {
    accountRecommendations: ["Brokerage: tax-efficient ETFs and diversified equity exposure."],
    allocationNotes: ["Target globally diversified allocation across US, international, and alternatives as relevant."],
  },
  tax: {
    recommendations: ["Use tax-loss harvesting opportunities and optimize account location by asset type."],
  },
  insurance: {
    recommendations: ["Review life, disability, umbrella, and property coverage annually."],
  },
  estate: {
    recommendations: ["Maintain will, POA, health proxy, and beneficiary alignment across accounts."],
  },
  summary: {
    summaryText:
      "We will implement this plan in phases, review quarterly, and adjust as life and market conditions evolve.",
    phases: [
      { id: makeId(), title: "Phase 1", actions: ["Action item 1"] },
      { id: makeId(), title: "Phase 2", actions: ["Action item 1"] },
      { id: makeId(), title: "Phase 3", actions: ["Action item 1"] },
    ],
  },
});

export const mergeFinancialPlanV2 = (
  source: unknown,
  clientName?: string,
): FinancialPlanV2Document => {
  const defaults = createDefaultFinancialPlanV2();
  const raw = (source && typeof source === "object" ? source : {}) as Partial<FinancialPlanV2Document>;

  return {
    ...defaults,
    ...raw,
    clientProfile: {
      ...defaults.clientProfile,
      ...raw.clientProfile,
      advisorName: raw.clientProfile?.advisorName || defaults.clientProfile.advisorName,
    },
    visibility: {
      ...defaults.visibility,
      ...raw.visibility,
    },
    statement: {
      ...defaults.statement,
      ...raw.statement,
      goals: Array.isArray(raw.statement?.goals) && raw.statement?.goals.length > 0
        ? raw.statement.goals.filter((goal): goal is string => typeof goal === "string")
        : defaults.statement.goals,
    },
    cashFlow: {
      ...defaults.cashFlow,
      ...raw.cashFlow,
      buckets: Array.isArray(raw.cashFlow?.buckets) && raw.cashFlow?.buckets.length > 0
        ? raw.cashFlow.buckets.map((bucket) => ({
            id: bucket.id || makeId(),
            title: bucket.title || "Bucket",
            targetAmount: bucket.targetAmount || "",
            monthlyContribution: bucket.monthlyContribution || "",
            recommendation: bucket.recommendation || "",
          }))
        : defaults.cashFlow.buckets,
      debtNotes: Array.isArray(raw.cashFlow?.debtNotes)
        ? raw.cashFlow.debtNotes.filter((note): note is string => typeof note === "string")
        : defaults.cashFlow.debtNotes,
    },
    investment: {
      ...defaults.investment,
      ...raw.investment,
      accountRecommendations: Array.isArray(raw.investment?.accountRecommendations)
        ? raw.investment.accountRecommendations.filter((rec): rec is string => typeof rec === "string")
        : defaults.investment.accountRecommendations,
      allocationNotes: Array.isArray(raw.investment?.allocationNotes)
        ? raw.investment.allocationNotes.filter((note): note is string => typeof note === "string")
        : defaults.investment.allocationNotes,
    },
    tax: {
      ...defaults.tax,
      ...raw.tax,
      recommendations: Array.isArray(raw.tax?.recommendations)
        ? raw.tax.recommendations.filter((rec): rec is string => typeof rec === "string")
        : defaults.tax.recommendations,
    },
    insurance: {
      ...defaults.insurance,
      ...raw.insurance,
      recommendations: Array.isArray(raw.insurance?.recommendations)
        ? raw.insurance.recommendations.filter((rec): rec is string => typeof rec === "string")
        : defaults.insurance.recommendations,
    },
    estate: {
      ...defaults.estate,
      ...raw.estate,
      recommendations: Array.isArray(raw.estate?.recommendations)
        ? raw.estate.recommendations.filter((rec): rec is string => typeof rec === "string")
        : defaults.estate.recommendations,
    },
    summary: {
      ...defaults.summary,
      ...raw.summary,
      phases: Array.isArray(raw.summary?.phases) && raw.summary?.phases.length > 0
        ? raw.summary.phases.map((phase) => ({
            id: phase.id || makeId(),
            title: phase.title || "Phase",
            actions: Array.isArray(phase.actions)
              ? phase.actions.filter((action): action is string => typeof action === "string")
              : [],
          }))
        : defaults.summary.phases,
    },
    updatedAt: new Date().toISOString(),
  };
};
