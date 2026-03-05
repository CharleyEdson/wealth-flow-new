import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { accountTypeLabels, ASSET_ACCOUNT_TYPES, DEBT_ACCOUNT_TYPES, type AccountType } from "@/lib/accountTypes";
import {
  defaultBucketByAccountType,
  financialBucketDescription,
  financialBucketLabel,
  type FinancialBucket,
} from "@/lib/accountBuckets";

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  savingsAmount?: number;
  financialBucket: FinancialBucket;
}

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: Omit<Account, "id">) => void;
  editAccount?: Account;
  onEdit?: (account: Account) => void;
}

const assetTypes = ASSET_ACCOUNT_TYPES.map((value) => ({ value, label: accountTypeLabels[value] }));
const debtTypes = DEBT_ACCOUNT_TYPES.map((value) => ({ value, label: accountTypeLabels[value] }));

const bucketGroups: Array<{ label: string; value: FinancialBucket; types: AccountType[] }> = [
  { label: "Cash", value: "cash", types: ["checking_account", "savings_account"] },
  {
    label: "After-tax Investments",
    value: "after_tax",
    types: ["brokerage_account", "roth_ira", "other_asset"],
  },
  { label: "Pre-tax Investments", value: "pre_tax", types: ["ira", "traditional_401k", "roth_401k"] },
  { label: "Real Estate", value: "real_estate", types: ["primary_residence", "rental_property"] },
  { label: "Business", value: "business", types: ["business"] },
  { label: "Debt", value: "debt", types: ["credit_card", "student_loan", "mortgage", "auto_loan", "other_loan"] },
];

export const AddAccountModal = ({ open, onOpenChange, onAdd, editAccount, onEdit }: AddAccountModalProps) => {
  const isEditing = !!editAccount;

  const [category, setCategory] = useState<"asset" | "debt">("asset");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const [financialBucket, setFinancialBucket] = useState<FinancialBucket>("after_tax");

  const inputStyles =
    "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

  useEffect(() => {
    const isDebt = !!editAccount && DEBT_ACCOUNT_TYPES.includes(editAccount.type);
    setCategory(isDebt ? "debt" : "asset");
    setAccountType(editAccount?.type || "");
    setName(editAccount?.name || "");
    setBalance(editAccount?.balance?.toString() || "");
    setSavingsAmount(editAccount?.savingsAmount?.toString() || "");
    setFinancialBucket(editAccount?.financialBucket || (editAccount?.type ? defaultBucketByAccountType[editAccount.type] : "after_tax"));
  }, [editAccount, open]);

  const accountTypes = category === "asset" ? assetTypes : debtTypes;

  const recommendedBucket = useMemo(
    () => (accountType ? defaultBucketByAccountType[accountType as AccountType] : null),
    [accountType],
  );

  const handleAccountTypeChange = (value: AccountType) => {
    setAccountType(value);
    setFinancialBucket(defaultBucketByAccountType[value]);
  };

  const resetForm = () => {
    setCategory("asset");
    setAccountType("");
    setName("");
    setBalance("");
    setSavingsAmount("");
    setFinancialBucket("after_tax");
  };

  const handleSubmit = () => {
    if (!accountType || !name || !balance) return;

    const payload = {
      type: accountType as AccountType,
      name,
      balance: parseFloat(balance),
      savingsAmount: savingsAmount ? parseFloat(savingsAmount) : 0,
      financialBucket,
    };

    if (isEditing && onEdit && editAccount) {
      onEdit({
        id: editAccount.id,
        ...payload,
      });
    } else {
      onAdd(payload);
    }

    resetForm();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-white/10 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-white">{isEditing ? "Edit Account" : "Add Account"}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={category === "asset" ? "hero" : "outline"}
              onClick={() => {
                setCategory("asset");
                setAccountType("");
              }}
              className={cn(
                "flex-1",
                category === "asset" ? "" : "border-white/20 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Asset
            </Button>
            <Button
              type="button"
              variant={category === "debt" ? "hero" : "outline"}
              onClick={() => {
                setCategory("debt");
                setAccountType("");
                setFinancialBucket("debt");
              }}
              className={cn(
                "flex-1",
                category === "debt" ? "" : "border-white/20 text-white hover:bg-white/10 hover:text-white",
              )}
            >
              Debt
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type" className="text-sm font-medium text-white/70">
              Account Type
            </Label>
            <Select value={accountType} onValueChange={(value) => handleAccountTypeChange(value as AccountType)}>
              <SelectTrigger id="account-type" className="border-white/15 bg-white/10 text-white">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                {bucketGroups.map((group) => {
                  const options = group.types.filter((type) => accountTypes.some((item) => item.value === type));
                  if (options.length === 0) return null;
                  return (
                    <SelectGroup key={group.value}>
                      <SelectLabel>{group.label}</SelectLabel>
                      {options.map((type) => (
                        <SelectItem key={type} value={type}>
                          {accountTypeLabels[type]}
                        </SelectItem>
                      ))}
                    </SelectGroup>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="financial-bucket" className="text-sm font-medium text-white/70">
              Financial Bucket
            </Label>
            <Select value={financialBucket} onValueChange={(value) => setFinancialBucket(value as FinancialBucket)}>
              <SelectTrigger id="financial-bucket" className="border-white/15 bg-white/10 text-white">
                <SelectValue placeholder="Select bucket" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                {(category === "debt"
                  ? (["debt"] as FinancialBucket[])
                  : (["cash", "after_tax", "pre_tax", "real_estate", "business"] as FinancialBucket[])
                ).map((bucket) => (
                  <SelectItem key={bucket} value={bucket}>
                    {financialBucketLabel[bucket]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <p className="text-xs text-white/60">{financialBucketDescription[financialBucket]}</p>
            {recommendedBucket && recommendedBucket !== financialBucket && (
              <p className="text-xs text-amber-300">
                Suggested for this account type: {financialBucketLabel[recommendedBucket]}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-name" className="text-sm font-medium text-white/70">
              Account Name
            </Label>
            <Input
              id="account-name"
              placeholder="e.g., Chase Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className={inputStyles}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-balance" className="text-sm font-medium text-white/70">
              {category === "asset" ? "Balance/Value" : "Balance Owed"}
            </Label>
            <Input
              id="account-balance"
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              step="0.01"
              className={inputStyles}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-amount" className="text-sm font-medium text-white/70">
              Monthly Savings Amount (Optional)
            </Label>
            <Input
              id="savings-amount"
              type="number"
              placeholder="0.00"
              value={savingsAmount}
              onChange={(e) => setSavingsAmount(e.target.value)}
              step="0.01"
              className={inputStyles}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </Button>
            <Button onClick={handleSubmit} disabled={!accountType || !name || !balance} variant="hero">
              {isEditing ? "Save Changes" : "Add Account"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
