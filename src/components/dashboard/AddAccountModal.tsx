import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

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
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Account</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          <div className="flex gap-2">
            <Button
              type="button"
              variant={category === "asset" ? "default" : "outline"}
              onClick={() => {
                setCategory("asset");
                setAccountType("");
              }}
              className="flex-1"
            >
              Asset
            </Button>
            <Button
              type="button"
              variant={category === "debt" ? "default" : "outline"}
              onClick={() => {
                setCategory("debt");
                setAccountType("");
              }}
              className="flex-1"
            >
              Debt
            </Button>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-type">Account Type</Label>
            <Select value={accountType} onValueChange={(value) => setAccountType(value as AccountType)}>
              <SelectTrigger id="account-type">
                <SelectValue placeholder="Select account type" />
              </SelectTrigger>
              <SelectContent>
                {accountTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-name">Account Name</Label>
            <Input
              id="account-name"
              placeholder="e.g., Chase Checking"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="account-balance">
              {category === "asset" ? "Balance/Value" : "Balance Owed"}
            </Label>
            <Input
              id="account-balance"
              type="number"
              placeholder="0.00"
              value={balance}
              onChange={(e) => setBalance(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="savings-amount">Monthly Savings Amount (Optional)</Label>
            <Input
              id="savings-amount"
              type="number"
              placeholder="0.00"
              value={savingsAmount}
              onChange={(e) => setSavingsAmount(e.target.value)}
              step="0.01"
            />
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              onClick={handleAdd}
              disabled={!accountType || !name || !balance}
            >
              Add Account
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
