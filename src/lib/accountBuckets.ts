import type { AccountType } from "@/lib/accountTypes";

export type FinancialBucket =
  | "cash"
  | "after_tax"
  | "pre_tax"
  | "real_estate"
  | "business"
  | "debt";

export const defaultBucketByAccountType: Record<AccountType, FinancialBucket> = {
  checking_account: "cash",
  savings_account: "cash",
  brokerage_account: "after_tax",
  ira: "pre_tax",
  roth_ira: "after_tax",
  traditional_401k: "pre_tax",
  roth_401k: "pre_tax",
  primary_residence: "real_estate",
  rental_property: "real_estate",
  business: "business",
  other_asset: "after_tax",
  credit_card: "debt",
  student_loan: "debt",
  mortgage: "debt",
  auto_loan: "debt",
  other_loan: "debt",
};

export const financialBucketLabel: Record<FinancialBucket, string> = {
  cash: "Cash Accounts",
  after_tax: "After-tax Investments",
  pre_tax: "Pre-tax Investments",
  real_estate: "Real Estate",
  business: "Business",
  debt: "Debts",
};

export const financialBucketDescription: Record<FinancialBucket, string> = {
  cash: "Cash-only assets, treated as 0% equity in equity ratio.",
  after_tax: "Taxable or post-tax investments used in investable/equity calculations.",
  pre_tax: "Tax-advantaged retirement investments used in investable/equity calculations.",
  real_estate: "Property assets excluded from equity rate but included in real estate term.",
  business: "Business equity excluded from equity rate but included in business term.",
  debt: "Liabilities that are excluded from asset-side term/equity ratios.",
};
