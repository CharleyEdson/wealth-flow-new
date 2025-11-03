import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { TrendingUp } from "lucide-react";
import { secureLogger } from "@/lib/secureLogger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  flow_type: string;
  inflow_category?: string;
  outflow_category?: string;
  frequency: string;
}

export function RatiosCard({ userId }: { userId: string }) {
  const [savingsRatio, setSavingsRatio] = useState<number>(0);
  const [savingsItems, setSavingsItems] = useState<CashFlowItem[]>([]);
  const [inflowItems, setInflowItems] = useState<CashFlowItem[]>([]);
  const [totalInflow, setTotalInflow] = useState<number>(0);
  const [totalSavings, setTotalSavings] = useState<number>(0);
  const [burnRate, setBurnRate] = useState<number>(0);
  const [expenseItems, setExpenseItems] = useState<CashFlowItem[]>([]);
  const [debtPaymentItems, setDebtPaymentItems] = useState<CashFlowItem[]>([]);
  const [totalExpenses, setTotalExpenses] = useState<number>(0);
  const [totalDebtPayments, setTotalDebtPayments] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [selectedRatio, setSelectedRatio] = useState<string | null>(null);

  useEffect(() => {
    fetchDataAndCalculate();
  }, [userId]);

  const fetchDataAndCalculate = async () => {
    try {
      setLoading(true);

      const { data: cashFlowItems, error } = await supabase
        .from("cash_flow_items")
        .select("*")
        .eq("user_id", userId);

      if (error) throw error;

      // Get inflow items
      const inflows = (cashFlowItems || []).filter(
        (item: CashFlowItem) => item.flow_type === "inflow"
      );
      setInflowItems(inflows);

      // Calculate total inflow (annualized)
      const inflowTotal = inflows.reduce((sum, item) => {
        const amount = Number(item.amount);
        // Convert to annual based on frequency
        switch (item.frequency) {
          case "monthly": return sum + (amount * 12);
          case "bi-weekly": return sum + (amount * 26);
          case "weekly": return sum + (amount * 52);
          case "quarterly": return sum + (amount * 4);
          case "annual": return sum + amount;
          default: return sum + (amount * 12); // default to monthly
        }
      }, 0);
      setTotalInflow(inflowTotal);

      // Get savings items (outflows with savings category)
      const savings = (cashFlowItems || []).filter(
        (item: CashFlowItem) =>
          item.flow_type === "outflow" && item.outflow_category === "savings"
      );
      setSavingsItems(savings);

      // Calculate total savings (annualized)
      const savingsTotal = savings.reduce((sum, item) => {
        const amount = Number(item.amount);
        switch (item.frequency) {
          case "monthly": return sum + (amount * 12);
          case "bi-weekly": return sum + (amount * 26);
          case "weekly": return sum + (amount * 52);
          case "quarterly": return sum + (amount * 4);
          case "annual": return sum + amount;
          default: return sum + (amount * 12);
        }
      }, 0);
      setTotalSavings(savingsTotal);

      // Calculate savings ratio
      const ratio = inflowTotal > 0 ? (savingsTotal / inflowTotal) * 100 : 0;
      setSavingsRatio(ratio);

      // Get expense items
      const expenses = (cashFlowItems || []).filter(
        (item: CashFlowItem) =>
          item.flow_type === "outflow" && item.outflow_category === "expenses"
      );
      setExpenseItems(expenses);

      // Calculate total expenses (annualized)
      const expensesTotal = expenses.reduce((sum, item) => {
        const amount = Number(item.amount);
        switch (item.frequency) {
          case "monthly": return sum + (amount * 12);
          case "bi-weekly": return sum + (amount * 26);
          case "weekly": return sum + (amount * 52);
          case "quarterly": return sum + (amount * 4);
          case "annual": return sum + amount;
          default: return sum + (amount * 12);
        }
      }, 0);
      setTotalExpenses(expensesTotal);

      // Get debt payment items
      const debtPayments = (cashFlowItems || []).filter(
        (item: CashFlowItem) =>
          item.flow_type === "outflow" && item.outflow_category === "debt_payments"
      );
      setDebtPaymentItems(debtPayments);

      // Calculate total debt payments (annualized)
      const debtPaymentsTotal = debtPayments.reduce((sum, item) => {
        const amount = Number(item.amount);
        switch (item.frequency) {
          case "monthly": return sum + (amount * 12);
          case "bi-weekly": return sum + (amount * 26);
          case "weekly": return sum + (amount * 52);
          case "quarterly": return sum + (amount * 4);
          case "annual": return sum + amount;
          default: return sum + (amount * 12);
        }
      }, 0);
      setTotalDebtPayments(debtPaymentsTotal);

      // Calculate burn rate: (Annual Expenses - Debt Payments) / Annual Income
      const burnRateCalc = inflowTotal > 0 ? ((expensesTotal - debtPaymentsTotal) / inflowTotal) * 100 : 0;
      setBurnRate(burnRateCalc);
    } catch (error) {
      secureLogger.error(error, 'Calculate ratios', 'Failed to calculate financial ratios');
    } finally {
      setLoading(false);
    }
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios</CardTitle>
          <CardDescription>Key financial health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-muted-foreground">Loading ratios...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <CardTitle>Financial Ratios</CardTitle>
          <CardDescription>Click on any ratio to see calculation details</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {/* Savings Ratio Square */}
            <button
              onClick={() => setSelectedRatio("savings")}
              className="aspect-square p-6 rounded-lg border-2 border-border bg-card hover:bg-accent hover:border-primary transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
            >
              <TrendingUp className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-3xl font-bold">{savingsRatio.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Savings Ratio</div>
              </div>
            </button>

            {/* Burn Rate Square */}
            <button
              onClick={() => setSelectedRatio("burnRate")}
              className="aspect-square p-6 rounded-lg border-2 border-border bg-card hover:bg-accent hover:border-primary transition-all duration-200 flex flex-col items-center justify-center gap-3 group"
            >
              <TrendingUp className="h-8 w-8 text-primary group-hover:scale-110 transition-transform" />
              <div className="text-center">
                <div className="text-3xl font-bold">{burnRate.toFixed(1)}%</div>
                <div className="text-sm text-muted-foreground mt-1">Burn Rate</div>
              </div>
            </button>
          </div>
        </CardContent>
      </Card>

      {/* Savings Ratio Details Dialog */}
      <Dialog open={selectedRatio === "savings"} onOpenChange={() => setSelectedRatio(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Savings Ratio Calculation
            </DialogTitle>
            <DialogDescription>
              Shows how much of your income you're saving
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formula */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm font-medium mb-2">Calculation Formula:</div>
              <div className="font-mono text-sm">
                Savings Ratio = (Total Savings / Total Inflow) × 100
              </div>
              <div className="font-mono text-sm mt-2">
                = (${totalSavings.toLocaleString()} / ${totalInflow.toLocaleString()}) × 100
              </div>
              <div className="font-mono text-sm font-bold mt-2 text-primary">
                = {savingsRatio.toFixed(1)}%
              </div>
            </div>

            {/* Interpretation */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-2">What this means:</div>
              <p className="text-sm text-muted-foreground">
                {savingsRatio >= 20
                  ? "Excellent! You're saving a healthy portion of your income. This puts you in a strong position for financial goals."
                  : savingsRatio >= 10
                  ? "Good start! You're saving a reasonable amount. Consider gradually increasing to 20% or more for stronger financial health."
                  : savingsRatio > 0
                  ? "You're saving something, which is great! Try to gradually increase to at least 10-20% of your income for better financial security."
                  : "No savings detected yet. Consider allocating at least 10-20% of your income to savings for financial stability."}
              </p>
            </div>

            {/* Savings Items */}
            <div className="space-y-3">
              <div className="font-medium">Savings Items (${totalSavings.toLocaleString()}):</div>
              {savingsItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No savings items found. Add cash flow items with "Savings" category.</p>
              ) : (
                <div className="space-y-2">
                  {savingsItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCategory(item.frequency)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inflow Items */}
            <div className="space-y-3">
              <div className="font-medium">Total Inflow (${totalInflow.toLocaleString()}):</div>
              {inflowItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No inflow items found. Add income sources to calculate ratios.</p>
              ) : (
                <div className="space-y-2">
                  {inflowItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.inflow_category && formatCategory(item.inflow_category)} • {formatCategory(item.frequency)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Burn Rate Details Dialog */}
      <Dialog open={selectedRatio === "burnRate"} onOpenChange={() => setSelectedRatio(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-primary" />
              Burn Rate Calculation
            </DialogTitle>
            <DialogDescription>
              Shows what percentage of income is spent on expenses (excluding debt payments)
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Formula */}
            <div className="p-4 rounded-lg bg-muted">
              <div className="text-sm font-medium mb-2">Calculation Formula:</div>
              <div className="font-mono text-sm">
                Burn Rate = ((Annual Expenses - Debt Payments) / Annual Income) × 100
              </div>
              <div className="font-mono text-sm mt-2">
                = ((${totalExpenses.toLocaleString()} - ${totalDebtPayments.toLocaleString()}) / ${totalInflow.toLocaleString()}) × 100
              </div>
              <div className="font-mono text-sm mt-2">
                = (${(totalExpenses - totalDebtPayments).toLocaleString()} / ${totalInflow.toLocaleString()}) × 100
              </div>
              <div className="font-mono text-sm font-bold mt-2 text-primary">
                = {burnRate.toFixed(1)}%
              </div>
            </div>

            {/* Interpretation */}
            <div className="p-4 rounded-lg bg-muted/50">
              <div className="text-sm font-medium mb-2">What this means:</div>
              <p className="text-sm text-muted-foreground">
                {burnRate <= 50
                  ? "Excellent! You're living well below your means with strong financial flexibility."
                  : burnRate <= 70
                  ? "Good! You have a healthy balance between spending and saving."
                  : burnRate <= 85
                  ? "Your expenses are taking up most of your income. Consider ways to reduce spending or increase income."
                  : "High burn rate - most of your income goes to expenses. Focus on reducing costs or increasing income to improve financial health."}
              </p>
            </div>

            {/* Expense Items */}
            <div className="space-y-3">
              <div className="font-medium">Annual Expenses (${totalExpenses.toLocaleString()}):</div>
              {expenseItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No expense items found.</p>
              ) : (
                <div className="space-y-2">
                  {expenseItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCategory(item.frequency)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Debt Payment Items */}
            <div className="space-y-3">
              <div className="font-medium">Annual Debt Payments (${totalDebtPayments.toLocaleString()}):</div>
              {debtPaymentItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No debt payment items found.</p>
              ) : (
                <div className="space-y-2">
                  {debtPaymentItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {formatCategory(item.frequency)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Inflow Items */}
            <div className="space-y-3">
              <div className="font-medium">Annual Income (${totalInflow.toLocaleString()}):</div>
              {inflowItems.length === 0 ? (
                <p className="text-sm text-muted-foreground">No income items found.</p>
              ) : (
                <div className="space-y-2">
                  {inflowItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between p-3 rounded-lg bg-muted/30"
                    >
                      <div>
                        <div className="font-medium text-sm">{item.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {item.inflow_category && formatCategory(item.inflow_category)} • {formatCategory(item.frequency)}
                        </div>
                      </div>
                      <div className="text-sm font-semibold">
                        ${Number(item.amount).toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
