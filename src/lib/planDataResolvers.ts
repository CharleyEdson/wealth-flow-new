import { supabase } from "@/integrations/supabase/client";
import type { PlanComponentKey, PlanComponentResolvedData } from "@/types/templateSystem";

interface AccountBalance {
  account_type: string;
  balance: number;
  financial_bucket?: "cash" | "after_tax" | "pre_tax" | "real_estate" | "business" | "debt" | null;
}

interface CashFlowItem {
  amount: number;
  flow_type: "inflow" | "outflow";
  frequency: string;
  outflow_category: string | null;
}

export interface DerivedPlanData {
  totalAssets: number;
  totalLiabilities: number;
  netWorth: number;
  liquidSavings: number;
  annualIncome: number;
  annualOutflow: number;
  annualSavings: number;
  monthlyIncome: number;
  monthlyExpenses: number;
  monthlyNet: number;
  savingsRatio: number;
  accountCount: number;
}

const toAnnual = (amount: number, frequency?: string | null): number => {
  switch (frequency) {
    case "weekly":
      return amount * 52;
    case "bi-weekly":
      return amount * 26;
    case "monthly":
      return amount * 12;
    case "quarterly":
      return amount * 4;
    case "annual":
      return amount;
    default:
      return amount * 12;
  }
};

export const resolveDerivedPlanData = async (userId: string): Promise<DerivedPlanData> => {
  const { data: accounts } = await supabase
    .from("accounts")
    .select("account_type, balance, financial_bucket")
    .eq("user_id", userId);

  const { data: cashFlowItems } = await supabase
    .from("cash_flow_items")
    .select("amount, flow_type, frequency, outflow_category")
    .eq("user_id", userId);

  const assetTypes = new Set([
    "checking_account",
    "savings_account",
    "brokerage_account",
    "ira",
    "roth_ira",
    "traditional_401k",
    "roth_401k",
    "primary_residence",
    "rental_property",
    "business",
    "other_asset",
  ]);

  const liabilityTypes = new Set(["credit_card", "student_loan", "mortgage", "auto_loan", "other_loan"]);

  const accountData = ((accounts || []) as AccountBalance[]).map((acc) => ({
    ...acc,
    balance: Number(acc.balance || 0),
  }));
  const cashData = ((cashFlowItems || []) as CashFlowItem[]).map((item) => ({
    ...item,
    amount: Number(item.amount || 0),
  }));

  const totalAssets = accountData
    .filter((account) => (account.financial_bucket ? account.financial_bucket !== "debt" : assetTypes.has(account.account_type)))
    .reduce((sum, account) => sum + account.balance, 0);

  const totalLiabilities = accountData
    .filter((account) => (account.financial_bucket ? account.financial_bucket === "debt" : liabilityTypes.has(account.account_type)))
    .reduce((sum, account) => sum + account.balance, 0);

  const liquidSavings = accountData
    .filter((account) =>
      account.financial_bucket ? account.financial_bucket === "cash" : account.account_type === "checking_account" || account.account_type === "savings_account",
    )
    .reduce((sum, account) => sum + account.balance, 0);

  const annualIncome = cashData
    .filter((item) => item.flow_type === "inflow")
    .reduce((sum, item) => sum + toAnnual(item.amount, item.frequency), 0);

  const annualOutflow = cashData
    .filter((item) => item.flow_type === "outflow")
    .reduce((sum, item) => sum + toAnnual(item.amount, item.frequency), 0);

  const annualSavings = cashData
    .filter((item) => item.flow_type === "outflow" && item.outflow_category === "savings")
    .reduce((sum, item) => sum + toAnnual(item.amount, item.frequency), 0);

  const annualExpenses = annualOutflow - annualSavings;
  const monthlyIncome = annualIncome / 12;
  const monthlyExpenses = annualExpenses / 12;
  const monthlyNet = monthlyIncome - annualOutflow / 12;
  const savingsRatio = annualIncome > 0 ? (annualSavings / annualIncome) * 100 : 0;

  return {
    totalAssets,
    totalLiabilities,
    netWorth: totalAssets - totalLiabilities,
    liquidSavings,
    annualIncome,
    annualOutflow,
    annualSavings,
    monthlyIncome,
    monthlyExpenses,
    monthlyNet,
    savingsRatio,
    accountCount: accountData.length,
  };
};

export const resolveComponentData = (
  key: PlanComponentKey,
  derivedData: DerivedPlanData,
  manualData: Record<string, unknown>,
): PlanComponentResolvedData => {
  const autoDataByComponent: Record<PlanComponentKey, Record<string, unknown>> = {
    ratios: {
      savingsRatio: derivedData.savingsRatio,
      monthlyNet: derivedData.monthlyNet,
      monthlyIncome: derivedData.monthlyIncome,
    },
    tax_allocation: {
      annualIncome: derivedData.annualIncome,
      annualSavings: derivedData.annualSavings,
      annualOutflow: derivedData.annualOutflow,
    },
    portfolio_optimization: {
      netWorth: derivedData.netWorth,
      totalAssets: derivedData.totalAssets,
      totalLiabilities: derivedData.totalLiabilities,
    },
    cash_flow_allocation: {
      annualIncome: derivedData.annualIncome,
      annualSavings: derivedData.annualSavings,
      annualOutflow: derivedData.annualOutflow,
      monthlyNet: derivedData.monthlyNet,
    },
    account_consolidation: {
      accountCount: derivedData.accountCount,
      totalAssets: derivedData.totalAssets,
      totalLiabilities: derivedData.totalLiabilities,
    },
    text_block: {},
    goal_list: {},
    implementation_phase: {},
  };

  const autoData = autoDataByComponent[key] || {};
  return {
    key,
    autoData,
    manualData,
    merged: {
      ...autoData,
      ...manualData,
    },
  };
};
