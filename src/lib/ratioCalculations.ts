import type { FinancialBucket } from "@/lib/accountBuckets";

export interface RatioAccountInput {
  id: string;
  name: string;
  balance: number;
  financial_bucket: FinancialBucket;
}

export interface RatioCashFlowInput {
  id: string;
  name: string;
  amount: number;
  flow_type: "inflow" | "outflow";
  outflow_category: "savings" | "transfers" | "expenses" | "debt_payments" | "taxes" | null;
  frequency: string;
}

export interface RatioTile {
  key:
    | "equity_rate"
    | "savings_rate"
    | "burn_rate"
    | "debt_rate"
    | "tax_rate"
    | "liquid_term"
    | "qualified_term"
    | "real_estate_term"
    | "business_term"
    | "total_term";
  title: string;
  value: number | null;
  valueLabel: string;
  targetLabel: string;
  themeClass: string;
  valueType: "percent" | "multiple";
  status: "good" | "warn" | "bad" | "neutral";
  details: {
    formula: string;
    numeratorLabel: string;
    denominatorLabel: string;
    numeratorValue: number;
    denominatorValue: number;
    includedAccounts: RatioAccountInput[];
    excludedAccounts: RatioAccountInput[];
    includedCashFlowItems: RatioCashFlowInput[];
  };
}

const annualize = (amount: number, frequency?: string | null) => {
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

const toPercent = (num: number, den: number) => (den > 0 ? (num / den) * 100 : NaN);
const toMultiple = (num: number, den: number) => (den > 0 ? num / den : NaN);

const formatPercent = (value: number) => (Number.isFinite(value) ? `${value.toFixed(0)}%` : "—");
const formatMultiple = (value: number) => (Number.isFinite(value) ? value.toFixed(1) : "—");

const percentageStatus = (value: number, rule: { goodMax?: number; goodMin?: number; warnMax?: number; warnMin?: number }) => {
  if (!Number.isFinite(value)) return "neutral" as const;
  if ((rule.goodMin === undefined || value >= rule.goodMin) && (rule.goodMax === undefined || value <= rule.goodMax)) {
    return "good" as const;
  }
  if ((rule.warnMin === undefined || value >= rule.warnMin) && (rule.warnMax === undefined || value <= rule.warnMax)) {
    return "warn" as const;
  }
  return "bad" as const;
};

export interface RatioCalculationOutput {
  tiles: RatioTile[];
}

export const calculateFinancialRatios = (
  accounts: RatioAccountInput[],
  cashFlowItems: RatioCashFlowInput[],
): RatioCalculationOutput => {
  const annualIncomeItems = cashFlowItems.filter((item) => item.flow_type === "inflow");
  const annualOutflowItems = cashFlowItems.filter((item) => item.flow_type === "outflow");
  const annualSavingsItems = annualOutflowItems.filter((item) => item.outflow_category === "savings");
  const annualExpenseItems = annualOutflowItems.filter((item) => item.outflow_category === "expenses");
  const annualDebtItems = annualOutflowItems.filter((item) => item.outflow_category === "debt_payments");
  const annualTaxItems = annualOutflowItems.filter((item) => item.outflow_category === "taxes");

  const annualIncome = annualIncomeItems.reduce((sum, item) => sum + annualize(Number(item.amount || 0), item.frequency), 0);
  const annualSavings = annualSavingsItems.reduce((sum, item) => sum + annualize(Number(item.amount || 0), item.frequency), 0);
  const annualExpenses = annualExpenseItems.reduce((sum, item) => sum + annualize(Number(item.amount || 0), item.frequency), 0);
  const annualDebt = annualDebtItems.reduce((sum, item) => sum + annualize(Number(item.amount || 0), item.frequency), 0);
  const annualTaxes = annualTaxItems.reduce((sum, item) => sum + annualize(Number(item.amount || 0), item.frequency), 0);

  const sumByBucket = (bucket: FinancialBucket) =>
    accounts
      .filter((account) => account.financial_bucket === bucket)
      .reduce((sum, account) => sum + Number(account.balance || 0), 0);

  const cash = sumByBucket("cash");
  const afterTax = sumByBucket("after_tax");
  const preTax = sumByBucket("pre_tax");
  const realEstate = sumByBucket("real_estate");
  const business = sumByBucket("business");

  const investablePlusCash = cash + afterTax + preTax;
  const equityNumerator = afterTax + preTax;
  const annualExpensesForTerms = annualExpenses;

  const buildPercentTile = (
    key: RatioTile["key"],
    title: string,
    numerator: number,
    denominator: number,
    targetLabel: string,
    themeClass: string,
    numeratorLabel: string,
    denominatorLabel: string,
    flowItems: RatioCashFlowInput[],
    includedAccounts: RatioAccountInput[],
    excludedAccounts: RatioAccountInput[],
    statusRule: Parameters<typeof percentageStatus>[1],
  ): RatioTile => {
    const value = toPercent(numerator, denominator);
    return {
      key,
      title,
      value: Number.isFinite(value) ? value : null,
      valueLabel: formatPercent(value),
      targetLabel,
      themeClass,
      valueType: "percent",
      status: percentageStatus(value, statusRule),
      details: {
        formula: `${numeratorLabel} / ${denominatorLabel}`,
        numeratorLabel,
        denominatorLabel,
        numeratorValue: numerator,
        denominatorValue: denominator,
        includedAccounts,
        excludedAccounts,
        includedCashFlowItems: flowItems,
      },
    };
  };

  const buildTermTile = (
    key: RatioTile["key"],
    title: string,
    numerator: number,
    denominator: number,
    targetLabel: string,
    themeClass: string,
    numeratorLabel: string,
    denominatorLabel: string,
    includedAccounts: RatioAccountInput[],
    excludedAccounts: RatioAccountInput[],
  ): RatioTile => {
    const value = toMultiple(numerator, denominator);
    return {
      key,
      title,
      value: Number.isFinite(value) ? value : null,
      valueLabel: formatMultiple(value),
      targetLabel,
      themeClass,
      valueType: "multiple",
      status: Number.isFinite(value) ? "good" : "neutral",
      details: {
        formula: `${numeratorLabel} / ${denominatorLabel}`,
        numeratorLabel,
        denominatorLabel,
        numeratorValue: numerator,
        denominatorValue: denominator,
        includedAccounts,
        excludedAccounts,
        includedCashFlowItems: annualExpenseItems,
      },
    };
  };

  const includedEquityAccounts = accounts.filter(
    (account) => account.financial_bucket === "cash" || account.financial_bucket === "after_tax" || account.financial_bucket === "pre_tax",
  );
  const excludedEquityAccounts = accounts.filter(
    (account) => account.financial_bucket === "real_estate" || account.financial_bucket === "business" || account.financial_bucket === "debt",
  );

  const tiles: RatioTile[] = [
    buildPercentTile(
      "equity_rate",
      "Equity Rate",
      equityNumerator,
      investablePlusCash,
      "75%-100%",
      "from-green-600 to-green-500",
      "Investments (After-tax + Pre-tax)",
      "Cash + Investable Assets",
      [],
      includedEquityAccounts,
      excludedEquityAccounts,
      { goodMin: 75, warnMin: 50 },
    ),
    buildPercentTile(
      "savings_rate",
      "Savings Rate",
      annualSavings,
      annualIncome,
      "10%-20%",
      "from-teal-600 to-cyan-600",
      "Annual Savings",
      "Annual Income",
      annualSavingsItems,
      [],
      [],
      { goodMin: 10, warnMin: 5 },
    ),
    buildPercentTile(
      "burn_rate",
      "Burn Rate",
      annualExpenses,
      annualIncome,
      "50%",
      "from-purple-600 to-fuchsia-600",
      "Annual Expenses",
      "Annual Income",
      annualExpenseItems,
      [],
      [],
      { goodMax: 50, warnMax: 70 },
    ),
    buildPercentTile(
      "debt_rate",
      "Debt Rate",
      annualDebt,
      annualIncome,
      "0%-10%",
      "from-emerald-700 to-emerald-600",
      "Annual Debt Payments",
      "Annual Income",
      annualDebtItems,
      [],
      [],
      { goodMax: 10, warnMax: 20 },
    ),
    buildPercentTile(
      "tax_rate",
      "Tax Rate",
      annualTaxes,
      annualIncome,
      "30%",
      "from-yellow-500 to-amber-500",
      "Annual Tax Payments",
      "Annual Income",
      annualTaxItems,
      [],
      [],
      { goodMax: 30, warnMax: 40 },
    ),
    buildTermTile(
      "liquid_term",
      "Liquid Term",
      cash,
      annualExpensesForTerms,
      "1.0",
      "from-orange-500 to-amber-500",
      "Cash Assets",
      "Annual Expenses",
      accounts.filter((account) => account.financial_bucket === "cash"),
      accounts.filter((account) => account.financial_bucket !== "cash"),
    ),
    buildTermTile(
      "qualified_term",
      "Qualified Term",
      afterTax + preTax,
      annualExpensesForTerms,
      "0.3",
      "from-violet-600 to-purple-600",
      "Qualified Assets (After-tax + Pre-tax)",
      "Annual Expenses",
      accounts.filter((account) => account.financial_bucket === "after_tax" || account.financial_bucket === "pre_tax"),
      accounts.filter((account) => account.financial_bucket !== "after_tax" && account.financial_bucket !== "pre_tax"),
    ),
    buildTermTile(
      "real_estate_term",
      "Real Estate Term",
      realEstate,
      annualExpensesForTerms,
      "0.0-0.3",
      "from-blue-600 to-indigo-600",
      "Real Estate Assets",
      "Annual Expenses",
      accounts.filter((account) => account.financial_bucket === "real_estate"),
      accounts.filter((account) => account.financial_bucket !== "real_estate"),
    ),
    buildTermTile(
      "business_term",
      "Business Term",
      business,
      annualExpensesForTerms,
      "0.0-0.3",
      "from-rose-600 to-red-500",
      "Business Assets",
      "Annual Expenses",
      accounts.filter((account) => account.financial_bucket === "business"),
      accounts.filter((account) => account.financial_bucket !== "business"),
    ),
    buildTermTile(
      "total_term",
      "Total Term",
      cash + afterTax + preTax + realEstate + business,
      annualExpensesForTerms,
      "0.3",
      "from-lime-600 to-green-500",
      "All Assets (Excluding Debt)",
      "Annual Expenses",
      accounts.filter((account) => account.financial_bucket !== "debt"),
      accounts.filter((account) => account.financial_bucket === "debt"),
    ),
  ];

  return { tiles };
};
