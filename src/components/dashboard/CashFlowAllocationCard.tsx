import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import { TrendingUp, PiggyBank, Wallet } from "lucide-react";

interface CashFlowAllocationCardProps {
  userId: string;
}

interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  flow_type: "inflow" | "outflow";
  frequency: string;
  outflow_category?: string;
}

const frequencyToAnnual = (amount: number, frequency?: string | null) => {
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
    case "one-time":
      return amount;
    default:
      return amount * 12;
  }
};

const toCurrency = (value: number) =>
  `$${value.toLocaleString(undefined, {
    minimumFractionDigits: 0,
    maximumFractionDigits: value < 100 ? 2 : 0,
  })}`;

export const CashFlowAllocationCard = ({ userId }: CashFlowAllocationCardProps) => {
  const [loading, setLoading] = useState(true);
  const [metrics, setMetrics] = useState({
    income: 0,
    savings: 0,
    expenses: 0,
    net: 0,
  });

  useEffect(() => {
    const fetchCashFlow = async () => {
      if (!userId) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const { data, error } = await supabase
          .from("cash_flow_items")
          .select("id, name, amount, flow_type, frequency, outflow_category")
          .eq("user_id", userId);

        if (error) throw error;

        const items = (data || []) as CashFlowItem[];

        const inflows = items.filter((item) => item.flow_type === "inflow");
        const outflows = items.filter((item) => item.flow_type === "outflow");
        const savingsOutflows = outflows.filter((item) => item.outflow_category === "savings");
        const expenseOutflows = outflows.filter((item) => item.outflow_category !== "savings");

        const incomeAnnual = inflows.reduce(
          (sum, item) => sum + frequencyToAnnual(Number(item.amount) || 0, item.frequency),
          0,
        );
        const savingsAnnual = savingsOutflows.reduce(
          (sum, item) => sum + frequencyToAnnual(Number(item.amount) || 0, item.frequency),
          0,
        );
        const expensesAnnual = expenseOutflows.reduce(
          (sum, item) => sum + frequencyToAnnual(Number(item.amount) || 0, item.frequency),
          0,
        );

        const incomeMonthly = incomeAnnual / 12;
        const savingsMonthly = savingsAnnual / 12;
        const expensesMonthly = expensesAnnual / 12;
        const netMonthly = incomeMonthly - savingsMonthly - expensesMonthly;

        setMetrics({
          income: incomeMonthly,
          savings: savingsMonthly,
          expenses: expensesMonthly,
          net: netMonthly,
        });
      } catch (error) {
        secureLogger.error(error, "CashFlowAllocation", "Failed to load cash flow allocation");
      } finally {
        setLoading(false);
      }
    };

    fetchCashFlow();
  }, [userId]);

  const segments = useMemo(() => {
    const { income, savings, expenses, net } = metrics;

    if (income <= 0) {
      return [];
    }

    const shortfall = net < 0 ? Math.abs(net) : 0;
    const base = income + shortfall || 1;

    const rawSegments = [
      {
        key: "savings",
        label: "Savings",
        value: savings,
        percent: (savings / base) * 100,
        color: "from-emerald-400/90 to-emerald-500/80",
        icon: PiggyBank,
      },
      {
        key: "expenses",
        label: "Expenses",
        value: expenses,
        percent: (expenses / base) * 100,
        color: "from-rose-400/90 to-rose-500/80",
        icon: Wallet,
      },
      {
        key: net >= 0 ? "available" : "shortfall",
        label: net >= 0 ? "Available" : "Shortfall",
        value: Math.abs(net),
        percent: (Math.abs(net) / base) * 100,
        color:
          net >= 0
            ? "from-sky-400/90 to-cyan-400/80"
            : "from-amber-400/90 to-orange-400/80",
        icon: TrendingUp,
        residual: true,
        isNegative: net < 0,
      },
    ];

    return rawSegments.filter((segment) => segment.value > 0.0001);
  }, [metrics]);

  const { income, savings, expenses, net } = metrics;

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader>
        <CardTitle className="text-white">Cash Flow Allocation</CardTitle>
        <CardDescription className="text-white/60">
          See how your monthly income is flowing into savings and lifestyle
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {loading ? (
          <p className="text-white/60">Loading...</p>
        ) : income <= 0 ? (
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white/70">
            Connect income sources to visualize your allocation.
          </div>
        ) : (
          <>
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Monthly Income
                </p>
                <p className="mt-2 text-3xl font-heading font-semibold text-white">
                  {toCurrency(income)}
                </p>
              </div>
              <div className="text-right">
                <p className="text-xs font-semibold uppercase tracking-wider text-white/50">
                  Net Cash Flow
                </p>
                <p
                  className={`mt-2 text-xl font-heading font-semibold ${
                    net >= 0 ? "text-emerald-400" : "text-rose-400"
                  }`}
                >
                  {net >= 0 ? "+" : "-"}
                  {toCurrency(Math.abs(net))}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              <div className="relative h-4 w-full overflow-hidden rounded-full border border-white/10 bg-white/10">
                {segments.map((segment, index) => {
                  const offset = segments.slice(0, index).reduce((sum, item) => sum + item.percent, 0);
                  return (
                  <div
                    key={segment.key}
                    className={`absolute left-0 top-0 h-full bg-gradient-to-r ${segment.color} transition-all`}
                    style={{
                      width: `${segment.percent}%`,
                      marginLeft: `${offset}%`,
                    }}
                  />
                );
                })}
              </div>
              {net < 0 && (
                <p className="text-sm text-amber-300/80">
                  You&apos;re overspending by {toCurrency(Math.abs(net))} this month.
                </p>
              )}
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {segments.map((segment) => {
                const Icon = segment.icon;
                const ratio = income > 0 ? (segment.value / income) * 100 : 0;

                return (
                  <div
                    key={segment.key}
                    className="rounded-2xl border border-white/10 bg-white/5 p-4"
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className={`flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-r ${segment.color}`}
                      >
                        <Icon className="h-4 w-4 text-slate-900" />
                      </span>
                      <div>
                        <p className="text-xs uppercase tracking-wider text-white/60">
                          {segment.label}
                        </p>
                        <p className="text-lg font-heading font-semibold text-white">
                          {toCurrency(segment.value)}
                        </p>
                      </div>
                    </div>
                    {!segment.residual && (
                      <p className="mt-3 text-xs text-white/60">
                        {ratio.toFixed(1)}% of income
                      </p>
                    )}
                    {segment.residual && segment.isNegative && (
                      <p className="mt-3 text-xs text-white/60">
                        {((segment.value / income) * 100).toFixed(1)}% beyond income
                      </p>
                    )}
                    {segment.residual && !segment.isNegative && (
                      <p className="mt-3 text-xs text-white/60">
                        {ratio.toFixed(1)}% remaining after allocations
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
};
