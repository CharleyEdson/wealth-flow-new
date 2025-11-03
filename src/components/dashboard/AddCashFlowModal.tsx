import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";
import { cn } from "@/lib/utils";

export type FlowType = "inflow" | "outflow";
export type InflowCategory = "salary" | "investment_income" | "interest_income" | "business_income" | "other_income";
export type OutflowCategory = "savings" | "transfers" | "expenses" | "debt_payments";

interface AddCashFlowModalProps {
  onAdd: (item: {
    name: string;
    amount: number;
    flow_type: FlowType;
    inflow_category?: InflowCategory;
    outflow_category?: OutflowCategory;
    frequency: string;
    linked_account_id?: string;
    notes?: string;
  }) => void;
  accounts: Array<{ id: string; name: string }>;
}

export function AddCashFlowModal({ onAdd, accounts }: AddCashFlowModalProps) {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [flowType, setFlowType] = useState<FlowType>("inflow");
  const [inflowCategory, setInflowCategory] = useState<InflowCategory>("salary");
  const [outflowCategory, setOutflowCategory] = useState<OutflowCategory>("expenses");
  const [frequency, setFrequency] = useState("monthly");
  const [linkedAccountId, setLinkedAccountId] = useState<string>("");
  const [notes, setNotes] = useState("");
  const inputStyles =
    "border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    onAdd({
      name,
      amount: parseFloat(amount),
      flow_type: flowType,
      inflow_category: flowType === "inflow" ? inflowCategory : undefined,
      outflow_category: flowType === "outflow" ? outflowCategory : undefined,
      frequency,
      linked_account_id: linkedAccountId || undefined,
      notes: notes || undefined,
    });

    // Reset form
    setName("");
    setAmount("");
    setFlowType("inflow");
    setInflowCategory("salary");
    setOutflowCategory("expenses");
    setFrequency("monthly");
    setLinkedAccountId("");
    setNotes("");
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="hero">
          <Plus className="mr-2 h-4 w-4" />
          Add Cash Flow Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md border-white/10 bg-white/10 text-white backdrop-blur-2xl">
        <DialogHeader>
          <DialogTitle className="text-xl font-heading text-white">Add Cash Flow Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name" className="text-sm font-medium text-white/70">
              Name
            </Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Salary"
              required
              className={inputStyles}
            />
          </div>

          <div>
            <Label htmlFor="amount" className="text-sm font-medium text-white/70">
              Amount
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
              className={inputStyles}
            />
          </div>

          <div>
            <Label htmlFor="flowType" className="text-sm font-medium text-white/70">
              Flow Type
            </Label>
            <Select value={flowType} onValueChange={(value) => setFlowType(value as FlowType)}>
              <SelectTrigger id="flowType" className="border-white/15 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                <SelectItem value="inflow" className="focus:bg-primary/20 focus:text-white">
                  Inflow
                </SelectItem>
                <SelectItem value="outflow" className="focus:bg-primary/20 focus:text-white">
                  Outflow
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {flowType === "inflow" && (
            <div>
              <Label htmlFor="inflowCategory" className="text-sm font-medium text-white/70">
                Category
              </Label>
              <Select value={inflowCategory} onValueChange={(value) => setInflowCategory(value as InflowCategory)}>
                <SelectTrigger id="inflowCategory" className="border-white/15 bg-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                  <SelectItem value="salary" className="focus:bg-primary/20 focus:text-white">
                    Salary
                  </SelectItem>
                  <SelectItem value="investment_income" className="focus:bg-primary/20 focus:text-white">
                    Investment Income
                  </SelectItem>
                  <SelectItem value="interest_income" className="focus:bg-primary/20 focus:text-white">
                    Interest Income
                  </SelectItem>
                  <SelectItem value="business_income" className="focus:bg-primary/20 focus:text-white">
                    Business Income
                  </SelectItem>
                  <SelectItem value="other_income" className="focus:bg-primary/20 focus:text-white">
                    Other Income
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {flowType === "outflow" && (
            <div>
              <Label htmlFor="outflowCategory" className="text-sm font-medium text-white/70">
                Category
              </Label>
              <Select value={outflowCategory} onValueChange={(value) => setOutflowCategory(value as OutflowCategory)}>
                <SelectTrigger id="outflowCategory" className="border-white/15 bg-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                  <SelectItem value="savings" className="focus:bg-primary/20 focus:text-white">
                    Savings
                  </SelectItem>
                  <SelectItem value="transfers" className="focus:bg-primary/20 focus:text-white">
                    Transfers
                  </SelectItem>
                  <SelectItem value="expenses" className="focus:bg-primary/20 focus:text-white">
                    Expenses
                  </SelectItem>
                  <SelectItem value="debt_payments" className="focus:bg-primary/20 focus:text-white">
                    Debt Payments
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="frequency" className="text-sm font-medium text-white/70">
              Frequency
            </Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency" className="border-white/15 bg-white/10 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                <SelectItem value="monthly" className="focus:bg-primary/20 focus:text-white">
                  Monthly
                </SelectItem>
                <SelectItem value="bi-weekly" className="focus:bg-primary/20 focus:text-white">
                  Bi-weekly
                </SelectItem>
                <SelectItem value="weekly" className="focus:bg-primary/20 focus:text-white">
                  Weekly
                </SelectItem>
                <SelectItem value="annual" className="focus:bg-primary/20 focus:text-white">
                  Annual
                </SelectItem>
                <SelectItem value="quarterly" className="focus:bg-primary/20 focus:text-white">
                  Quarterly
                </SelectItem>
                <SelectItem value="one-time" className="focus:bg-primary/20 focus:text-white">
                  One-time
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="linkedAccount" className="text-sm font-medium text-white/70">
              Linked Account (Optional)
            </Label>
            <Select value={linkedAccountId || undefined} onValueChange={setLinkedAccountId}>
              <SelectTrigger id="linkedAccount" className="border-white/15 bg-white/10 text-white">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id} className="focus:bg-primary/20 focus:text-white">
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes" className="text-sm font-medium text-white/70">
              Notes (Optional)
            </Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
              className={cn(
                inputStyles,
                "min-h-[100px]"
              )}
            />
          </div>

          <Button type="submit" className="w-full" variant="hero">
            Add Item
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
