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

export function CashFlowCard() {
  const [cashFlowItems, setCashFlowItems] = useState<CashFlowItem[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Fetch cash flow items
      const { data: itemsData, error: itemsError } = await supabase
        .from("cash_flow_items")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (itemsError) throw itemsError;

      // Fetch accounts
      const { data: accountsData, error: accountsError } = await supabase
        .from("accounts")
        .select("id, name, savings_amount")
        .eq("user_id", user.id);

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
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase.from("cash_flow_items").insert({
        ...item,
        user_id: user.id,
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
  
  const totalInflow = inflows.reduce((sum, item) => sum + Number(item.amount), 0);
  const totalOutflow = outflows.reduce((sum, item) => sum + Number(item.amount), 0);
  const netCashFlow = totalInflow - totalOutflow;

  const totalSavings = accounts.reduce((sum, account) => sum + Number(account.savings_amount || 0), 0);
  const savingsOutflows = outflows.filter((item) => item.outflow_category === "savings");
  const totalSavingsOutflow = savingsOutflows.reduce((sum, item) => sum + Number(item.amount), 0);

  if (loading) {
    return (
      <Card>
        <CardContent className="pt-6">Loading...</CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>Cash Flow</CardTitle>
        <AddCashFlowModal onAdd={handleAddItem} accounts={accounts} />
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Summary */}
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Total Inflow</div>
            <div className="text-2xl font-bold text-green-600">${totalInflow.toLocaleString()}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Total Outflow</div>
            <div className="text-2xl font-bold text-red-600">${totalOutflow.toLocaleString()}</div>
          </div>
          <div className="text-center p-4 rounded-lg bg-muted/50">
            <div className="text-sm text-muted-foreground mb-1">Net Cash Flow</div>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? "text-green-600" : "text-red-600"}`}>
              ${netCashFlow.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Savings Summary */}
        {(totalSavings > 0 || totalSavingsOutflow > 0) && (
          <>
            <Separator />
            <div className="space-y-2">
              <h3 className="font-semibold text-sm text-muted-foreground">Savings Overview</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Account Savings Targets</div>
                  <div className="text-xl font-bold">${totalSavings.toLocaleString()}</div>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <div className="text-xs text-muted-foreground mb-1">Monthly Savings</div>
                  <div className="text-xl font-bold">${totalSavingsOutflow.toLocaleString()}</div>
                </div>
              </div>
            </div>
          </>
        )}

        <Separator />

        {/* Inflows */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-green-600" />
            <h3 className="font-semibold">Inflows</h3>
          </div>
          {inflows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No inflows added yet</p>
          ) : (
            <div className="space-y-2">
              {inflows.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.inflow_category && formatCategory(item.inflow_category)} • {formatCategory(item.frequency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-green-600">
                      ${Number(item.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <Separator />

        {/* Outflows */}
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <TrendingDown className="h-5 w-5 text-red-600" />
            <h3 className="font-semibold">Outflows</h3>
          </div>
          {outflows.length === 0 ? (
            <p className="text-sm text-muted-foreground">No outflows added yet</p>
          ) : (
            <div className="space-y-2">
              {outflows.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div className="flex-1">
                    <div className="font-medium">{item.name}</div>
                    <div className="text-xs text-muted-foreground">
                      {item.outflow_category && formatCategory(item.outflow_category)} • {formatCategory(item.frequency)}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-red-600">
                      ${Number(item.amount).toLocaleString()}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteItem(item.id)}
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