import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { AddCashFlowModal, FlowType, InflowCategory, OutflowCategory } from "./AddCashFlowModal";
import { Trash2, TrendingUp, TrendingDown } from "lucide-react";
import { Separator } from "@/components/ui/separator";
import { secureLogger } from "@/lib/secureLogger";

interface CashFlowItem {
  id: string;
  name: string;
  amount: number;
  flow_type: FlowType;
  inflow_category?: InflowCategory;
  outflow_category?: OutflowCategory;
  frequency: string;
  linked_account_id?: string;
  notes?: string;
}

interface Account {
  id: string;
  name: string;
  savings_amount?: number;
}

interface CashFlowCardProps {
  userId: string;
}

export function CashFlowCard({ userId }: CashFlowCardProps) {
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) {
      fetchData();
    }
  }, [userId]);

  const fetchData = async () => {
    try {
      // Fetch cash flow items
      const { data: itemsData, error: itemsError } = await supabase
        .from("cash_flow_items")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("id, name, savings_amount")
        .eq("user_id", userId);

      if (accountsError) throw accountsError;

      setCashFlowItems(itemsData || []);
      setAccounts(accountsData || []);
    } catch (error) {
      secureLogger.error(error, 'Fetch cash flow', 'Failed to load cash flow data');
    } finally {
      setLoading(false);
    }
  };

  const handleAddItem = async (item: Omit<CashFlowItem, "id">) => {
    try {
      const { error } = await supabase.from("cash_flow_items").insert({
        ...item,
        user_id: userId,
      });

      if (error) throw error;

      toast.success("Cash flow item added");
      fetchData();
    } catch (error) {
      secureLogger.error(error, 'Add cash flow item', 'Failed to add cash flow item');
    }
  };

  const handleDeleteItem = async (id: string) => {
    try {
      const { error } = await supabase
        .from("cash_flow_items")
        .delete()
        .eq("id", id);

      if (error) throw error;

      toast.success("Item deleted");
      fetchData();
    } catch (error) {
      secureLogger.error(error, 'Delete cash flow item', 'Failed to delete item');
    }
  };

  const formatCategory = (category: string) => {
    return category
      .split("_")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  const inflows = cashFlowItems.filter((item) => item.flow_type === "inflow");
  const outflows = cashFlowItems.filter((item) => item.flow_type === "outflow");

  const normalize = (amount: number, frequency?: string) => {
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

  const totalInflow = inflows.reduce(
    (sum, item) => sum + normalize(Number(item.amount), item.frequency),
    0,
  );
  const totalOutflow = outflows.reduce(
    (sum, item) => sum + normalize(Number(item.amount), item.frequency),
    0,
  );
  const netCashFlow = totalInflow - totalOutflow;

  const totalSavings = accounts.reduce((sum, account) => sum + Number(account.savings_amount || 0), 0);
  const savingsOutflows = outflows.filter((item) => item.outflow_category === "savings");
  const totalSavingsOutflow = savingsOutflows.reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5 text-white">
        <CardContent className="pt-6 text-white/60">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-white/10 bg-white/5 text-white">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="text-white">Cash Flow</CardTitle>
        <AddCashFlowModal onAdd={handleAddItem} accounts={accounts} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="mb-1 text-sm text-white/60">Total Inflow</div>
            <div className="text-2xl font-heading font-semibold text-emerald-400">
              ${totalInflow.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="mb-1 text-sm text-white/60">Total Outflow</div>
            <div className="text-2xl font-heading font-semibold text-rose-400">
              ${totalOutflow.toLocaleString()}
            </div>
          </div>
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 text-center">
            <div className="mb-1 text-sm text-white/60">Net Cash Flow</div>
            <div
              className={`text-2xl font-heading font-semibold ${
                netCashFlow >= 0 ? "text-emerald-400" : "text-rose-400"
              }`}
            >
              ${netCashFlow.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {(totalSavings > 0 || totalSavingsOutflow > 0) && (
          <>
            <Separator className="bg-white/10" />
            <div className="space-y-2">
              <h3 className="text-sm font-semibold text-white/60">Savings Overview</h3>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-white/50">
                    Account Savings Targets
                  </div>
                  <div className="text-xl font-heading font-semibold text-white">
                    ${totalSavings.toLocaleString()}
                  </div>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                  <div className="mb-1 text-xs uppercase tracking-wide text-white/50">
                    Monthly Savings
                  </div>
                  <div className="text-xl font-heading font-semibold text-white">
                    ${totalSavingsOutflow.toLocaleString()}
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator className="bg-white/10" />

        {/* Inflows */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Inflows</h3>
          </div>
          {inflows.length === 0 ? (
            <p className="text-sm text-white/60">No inflows added yet</p>
          ) : (
            <div className="space-y-2">
              {inflows.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-white/60">
                      {item.inflow_category && formatCategory(item.inflow_category)} •{" "}
                      {formatCategory(item.frequency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-emerald-400">
                      ${Number(item.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-white/60 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator className="bg-white/10" />

        {/* Outflows */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-rose-400" />
            <h3 className="font-semibold text-white">Outflows</h3>
          </div>
          {outflows.length === 0 ? (
            <p className="text-sm text-white/60">No outflows added yet</p>
          ) : (
            <div className="space-y-2">
              {outflows.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3"
                >
                  <div className="flex-1">
                    <div className="font-medium text-white">{item.name}</div>
                    <div className="text-xs text-white/60">
                      {item.outflow_category && formatCategory(item.outflow_category)} •{" "}
                      {formatCategory(item.frequency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-rose-400">
                      ${Number(item.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                      className="text-white/60 hover:text-white"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
