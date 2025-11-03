import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Plus } from "lucide-react";

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
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Cash Flow Item
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>Add Cash Flow Item</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Monthly Salary"
              required
            />
          </div>

          <div>
            <Label htmlFor="amount">Amount</Label>
            <Input
              id="amount"
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              required
            />
          </div>

          <div>
            <Label htmlFor="flowType">Flow Type</Label>
            <Select value={flowType} onValueChange={(value) => setFlowType(value as FlowType)}>
              <SelectTrigger id="flowType">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="inflow">Inflow</SelectItem>
                <SelectItem value="outflow">Outflow</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {flowType === "inflow" && (
            <div>
              <Label htmlFor="inflowCategory">Category</Label>
              <Select value={inflowCategory} onValueChange={(value) => setInflowCategory(value as InflowCategory)}>
                <SelectTrigger id="inflowCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="salary">Salary</SelectItem>
                  <SelectItem value="investment_income">Investment Income</SelectItem>
                  <SelectItem value="interest_income">Interest Income</SelectItem>
                  <SelectItem value="business_income">Business Income</SelectItem>
                  <SelectItem value="other_income">Other Income</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {flowType === "outflow" && (
            <div>
              <Label htmlFor="outflowCategory">Category</Label>
              <Select value={outflowCategory} onValueChange={(value) => setOutflowCategory(value as OutflowCategory)}>
                <SelectTrigger id="outflowCategory">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="savings">Savings</SelectItem>
                  <SelectItem value="transfers">Transfers</SelectItem>
                  <SelectItem value="expenses">Expenses</SelectItem>
                  <SelectItem value="debt_payments">Debt Payments</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          <div>
            <Label htmlFor="frequency">Frequency</Label>
            <Select value={frequency} onValueChange={setFrequency}>
              <SelectTrigger id="frequency">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="monthly">Monthly</SelectItem>
                <SelectItem value="bi-weekly">Bi-weekly</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="annual">Annual</SelectItem>
                <SelectItem value="quarterly">Quarterly</SelectItem>
                <SelectItem value="one-time">One-time</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="linkedAccount">Linked Account (Optional)</Label>
            <Select value={linkedAccountId || undefined} onValueChange={setLinkedAccountId}>
              <SelectTrigger id="linkedAccount">
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                {accounts.map((account) => (
                  <SelectItem key={account.id} value={account.id}>
                    {account.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Additional notes..."
            />
          </div>

          <Button type="submit" className="w-full">Add Item</Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}