import type { PlanComponentKey } from "@/types/templateSystem";

export interface ComponentSchemaField {
  key: string;
  label: string;
  type: "text" | "number" | "boolean" | "textarea";
  placeholder?: string;
}

export interface PlanComponentDefinition {
  key: PlanComponentKey;
  label: string;
  category: "cash_flow" | "investments" | "tax" | "portfolio" | "planning" | "generic";
  description: string;
  requiredAutoDataKeys: string[];
  configSchema: ComponentSchemaField[];
  manualSchema: ComponentSchemaField[];
}

export const planComponentRegistry: PlanComponentDefinition[] = [
  {
    key: "ratios",
    label: "Financial Ratios",
    category: "cash_flow",
    description: "Savings ratio, burn rate, and other quick health indicators.",
    requiredAutoDataKeys: ["savingsRatio", "monthlyNet", "monthlyIncome"],
    configSchema: [],
    manualSchema: [
      { key: "headline", label: "Headline", type: "text", placeholder: "Ratios summary" },
      { key: "notes", label: "Notes", type: "textarea", placeholder: "Advisor context" },
    ],
  },
  {
    key: "tax_allocation",
    label: "Tax Allocation",
    category: "tax",
    description: "Shows tax strategy split and recommendations.",
    requiredAutoDataKeys: ["annualIncome"],
    configSchema: [{ key: "strategyLabel", label: "Strategy Label", type: "text", placeholder: "Tax Strategy" }],
    manualSchema: [{ key: "recommendations", label: "Recommendations", type: "textarea", placeholder: "Tax notes..." }],
  },
  {
    key: "portfolio_optimization",
    label: "Portfolio Optimization",
    category: "portfolio",
    description: "Current vs target portfolio direction.",
    requiredAutoDataKeys: ["netWorth", "totalAssets"],
    configSchema: [{ key: "targetRiskLevel", label: "Target Risk Level", type: "text", placeholder: "Balanced" }],
    manualSchema: [{ key: "allocationNotes", label: "Allocation Notes", type: "textarea", placeholder: "Allocation notes..." }],
  },
  {
    key: "cash_flow_allocation",
    label: "Cash Flow Allocation",
    category: "cash_flow",
    description: "Income allocation by savings, expenses, and remaining cash.",
    requiredAutoDataKeys: ["annualIncome", "annualSavings", "annualOutflow"],
    configSchema: [],
    manualSchema: [{ key: "notes", label: "Notes", type: "textarea", placeholder: "Cash flow notes..." }],
  },
  {
    key: "account_consolidation",
    label: "Account Consolidation",
    category: "investments",
    description: "Account structure recommendations and consolidation actions.",
    requiredAutoDataKeys: ["accountCount", "totalAssets", "totalLiabilities"],
    configSchema: [],
    manualSchema: [{ key: "actions", label: "Consolidation Actions", type: "textarea", placeholder: "Consolidation actions..." }],
  },
  {
    key: "text_block",
    label: "Text Block",
    category: "generic",
    description: "Generic section text for narrative content.",
    requiredAutoDataKeys: [],
    configSchema: [{ key: "title", label: "Title", type: "text", placeholder: "Section title" }],
    manualSchema: [{ key: "body", label: "Body", type: "textarea", placeholder: "Section body..." }],
  },
  {
    key: "goal_list",
    label: "Goal List",
    category: "planning",
    description: "Client goals and timeline priorities.",
    requiredAutoDataKeys: [],
    configSchema: [{ key: "title", label: "Title", type: "text", placeholder: "Goals" }],
    manualSchema: [{ key: "goals", label: "Goals (newline separated)", type: "textarea", placeholder: "Goal 1\nGoal 2" }],
  },
  {
    key: "implementation_phase",
    label: "Implementation Phase",
    category: "planning",
    description: "Action items and sequence of implementation.",
    requiredAutoDataKeys: [],
    configSchema: [{ key: "phaseTitle", label: "Phase Title", type: "text", placeholder: "Phase 1" }],
    manualSchema: [{ key: "actions", label: "Actions (newline separated)", type: "textarea", placeholder: "Action 1\nAction 2" }],
  },
];

export const getRegistryComponent = (key: PlanComponentKey) =>
  planComponentRegistry.find((component) => component.key === key);
