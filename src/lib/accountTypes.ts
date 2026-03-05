export type AccountType =
  | "checking_account"
  | "savings_account"
  | "brokerage_account"
  | "ira"
  | "roth_ira"
  | "traditional_401k"
  | "roth_401k"
  | "primary_residence"
  | "rental_property"
  | "business"
  | "other_asset"
  | "credit_card"
  | "student_loan"
  | "mortgage"
  | "auto_loan"
  | "other_loan";

export const ASSET_ACCOUNT_TYPES: AccountType[] = [
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
];

export const DEBT_ACCOUNT_TYPES: AccountType[] = [
  "credit_card",
  "student_loan",
  "mortgage",
  "auto_loan",
  "other_loan",
];

export const accountTypeLabels: Record<AccountType, string> = {
  checking_account: "Checking Account",
  savings_account: "Savings Account",
  brokerage_account: "Brokerage Account",
  ira: "IRA",
  roth_ira: "Roth IRA",
  traditional_401k: "401(k)",
  roth_401k: "Roth 401(k)",
  primary_residence: "Primary Residence",
  rental_property: "Rental Property",
  business: "Business",
  other_asset: "Other Asset",
  credit_card: "Credit Card",
  student_loan: "Student Loan",
  mortgage: "Mortgage",
  auto_loan: "Auto Loan",
  other_loan: "Other Loan",
};
