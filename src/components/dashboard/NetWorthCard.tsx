import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NetWorthCardProps {
  userId: string;
}

export const NetWorthCard = ({ userId }: NetWorthCardProps) => {
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [totals, setTotals] = useState({ assets: 0, liabilities: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetWorth();
  }, [userId]);

  const fetchNetWorth = async () => {
    setLoading(true);

    if (!userId) {
      setNetWorth(0);
      setTotals({ assets: 0, liabilities: 0 });
      setLoading(false);
      return;
    }

    const assetAccountTypes = new Set([
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
    ]);

    const liabilityAccountTypes = new Set([
      "credit_card",
      "student_loan",
      "mortgage",
      "auto_loan",
      "other_loan",
    ]);

    try {
      const { data: accounts, error: accountsError } = await supabase
        .from("accounts")
        .select("account_type, balance")
        .eq("user_id", userId);

      if (accountsError) throw accountsError;

      if (accounts && accounts.length > 0) {
        const { assetsTotal, liabilitiesTotal } = accounts.reduce(
          (acc, account) => {
            const balance = Number(account.balance) || 0;

            if (assetAccountTypes.has(account.account_type)) {
              acc.assetsTotal += balance;
            } else if (liabilityAccountTypes.has(account.account_type)) {
              acc.liabilitiesTotal += balance;
            }

            return acc;
          },
          { assetsTotal: 0, liabilitiesTotal: 0 },
        );

        setTotals({ assets: assetsTotal, liabilities: liabilitiesTotal });
        setNetWorth(assetsTotal - liabilitiesTotal);
        setLoading(false);
        return;
      }
    } catch (error) {
      console.error("Error computing net worth from accounts:", error);
    }

    try {
      const { data: historyData, error: historyError } = await supabase
        .from("net_worth_history")
        .select("net_worth")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (historyError) throw historyError;
      setTotals({ assets: 0, liabilities: 0 });
      setNetWorth(historyData?.net_worth || 0);
    } catch (historyFallbackError) {
      console.error("Error fetching net worth history:", historyFallbackError);
      setNetWorth(0);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card className="border-none bg-transparent p-0 shadow-none">
        <CardHeader className="mb-4 space-y-1 p-0">
          <span className="text-sm font-semibold uppercase tracking-widest text-white/50">
            Current net worth
          </span>
          <CardTitle className="text-3xl font-heading text-white">Net Worth</CardTitle>
          <CardDescription className="text-white/60">
            Live position across all connected accounts
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-2 p-0">
          <p className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-5xl font-heading font-semibold text-transparent">
            Loading...
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-none bg-transparent p-0 shadow-none">
      <CardHeader className="mb-4 space-y-1 p-0">
        <span className="text-sm font-semibold uppercase tracking-widest text-white/50">
          Current net worth
        </span>
        <CardTitle className="text-3xl font-heading text-white">Net Worth</CardTitle>
        <CardDescription className="text-white/60">
          Live position across all connected accounts
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-2 p-0">
        <p className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-6xl font-heading font-semibold tracking-tight text-transparent">
          ${netWorth?.toLocaleString() || "0"}
        </p>
        <div className="flex flex-wrap gap-6 text-sm text-white/60">
          <span>
            Assets:{" "}
            <strong className="text-white">
              ${totals.assets.toLocaleString()}
            </strong>
          </span>
          <span>
            Liabilities:{" "}
            <strong className="text-white">
              ${totals.liabilities.toLocaleString()}
            </strong>
          </span>
        </div>
        <p className="text-sm text-white/60">Auto-refreshed with every sync</p>
      </CardContent>
    </Card>
  );
};
