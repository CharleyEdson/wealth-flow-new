import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";

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

export interface Account {
  id: string;
  type: AccountType;
  name: string;
  balance: number;
  savingsAmount?: number;
}

interface AddAccountModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: (account: Omit<Account, "id">) => void;
}

const assetTypes: { value: AccountType; label: string }[] = [
  { value: "checking_account", label: "Checking Account" },
  { value: "savings_account", label: "Savings Account" },
  { value: "brokerage_account", label: "Brokerage Account" },
  { value: "ira", label: "IRA" },
  { value: "roth_ira", label: "Roth IRA" },
  { value: "traditional_401k", label: "401(k)" },
  { value: "roth_401k", label: "Roth 401(k)" },
  { value: "primary_residence", label: "Primary Residence" },
  { value: "rental_property", label: "Rental Property" },
  { value: "business", label: "Business" },
  { value: "other_asset", label: "Other Asset" },
];

const debtTypes: { value: AccountType; label: string }[] = [
  { value: "credit_card", label: "Credit Card" },
  { value: "student_loan", label: "Student Loan" },
  { value: "mortgage", label: "Mortgage" },
  { value: "auto_loan", label: "Auto Loan" },
  { value: "other_loan", label: "Other Loan" },
];

export const AddAccountModal = ({ open, onOpenChange, onAdd }: AddAccountModalProps) => {
  const [category, setCategory] = useState<"asset" | "debt">("asset");
  const [accountType, setAccountType] = useState<AccountType | "">("");
  const [name, setName] = useState("");
  const [balance, setBalance] = useState("");
  const [savingsAmount, setSavingsAmount] = useState("");
  const inputStyles =
    "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

  const handleAdd = () => {
    if (!accountType || !name || !balance) return;
    
    onAdd({
      type: accountType as AccountType,
      name,
      balance: parseFloat(balance),
      savingsAmount: savingsAmount ? parseFloat(savingsAmount) : 0,
    });

    // Reset form
    setAccountType("");
    setName("");
    setBalance("");
    setSavingsAmount("");
    onOpenChange(false);
  };

  const accountTypes = category === "asset" ? assetTypes : debtTypes;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] border-white/10 bg-white/10 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-white">Add Account</DialogTitle>
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
                category === "asset"
                  ? ""
                  : "border-white/20 text-white hover:bg-white/10 hover:text-white"
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
              }}
              className={cn(
                "flex-1",
                category === "debt"
                  ? ""
                  : "border-white/20 text-white hover:bg-white/10 hover:text-white"
              )}
            >
              Debt
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type" className="text-sm font-medium text-white/70">
              Account Type
            </Label>
            <Select value={accountType} onValueChange={(value) => setAccountType(value as AccountType)}>
              <SelectTrigger id="account-type" className="border-white/15 bg-white/10 text-white">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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

          <div className="flex gap-2 justify-end">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="border-white/20 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!accountType || !name || !balance}
              variant="hero"
            >
              Add Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
