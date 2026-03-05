import { useEffect, useMemo, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { defaultBucketByAccountType, financialBucketLabel, type FinancialBucket } from "@/lib/accountBuckets";
import { calculateFinancialRatios, type RatioAccountInput, type RatioCashFlowInput, type RatioTile } from "@/lib/ratioCalculations";
import type { AccountType } from "@/lib/accountTypes";

interface RatiosCardProps {
  userId: string;
  title?: string;
  description?: string;
  compact?: boolean;
}

const currency = (value: number) =>
  value.toLocaleString("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  });

const tileStatusEmoji = (tile: RatioTile) => {
  if (tile.status === "bad") return "🙁";
  if (tile.status === "warn") return "😐";
  return "🙂";
};

const prettyFlowType = (item: RatioCashFlowInput) => {
  if (item.flow_type === "inflow") return "Income";
  return item.outflow_category ? item.outflow_category.split("_").join(" ") : "Outflow";
};

export function RatiosCard({
  userId,
  title = "Financial Ratios",
  description = "Click a tile to see exactly what is included in the calculation.",
  compact = false,
}: RatiosCardProps) {
  const [loading, setLoading] = useState(true);
  const [ratioTiles, setRatioTiles] = useState<RatioTile[]>([]);
  const [selectedRatio, setSelectedRatio] = useState<RatioTile | null>(null);

  useEffect(() => {
    fetchDataAndCalculate();
  }, [userId]);

  const fetchDataAndCalculate = async () => {
    try {
      setLoading(true);

      const [{ data: cashFlowItems, error: cashFlowError }, { data: accounts, error: accountsError }] = await Promise.all([
        supabase
          .from("cash_flow_items")
          .select("id, name, amount, flow_type, outflow_category, frequency")
          .eq("user_id", userId),
        supabase
          .from("accounts")
          .select("id, name, balance, account_type, financial_bucket")
          .eq("user_id", userId),
      ]);

      if (cashFlowError) throw cashFlowError;
      if (accountsError) throw accountsError;

      const accountInputs: RatioAccountInput[] = (accounts || []).map((account: any) => ({
        id: account.id,
        name: account.name,
        balance: Number(account.balance || 0),
        financial_bucket: (account.financial_bucket || defaultBucketByAccountType[account.account_type as AccountType]) as FinancialBucket,
      }));

      const cashFlowInputs: RatioCashFlowInput[] = (cashFlowItems || []).map((item: any) => ({
        id: item.id,
        name: item.name,
        amount: Number(item.amount || 0),
        flow_type: item.flow_type,
        outflow_category: item.outflow_category,
        frequency: item.frequency,
      }));

      const result = calculateFinancialRatios(accountInputs, cashFlowInputs);
      setRatioTiles(result.tiles);
    } catch (error) {
      secureLogger.error(error, "Calculate ratios", "Failed to calculate financial ratios");
    } finally {
      setLoading(false);
    }
  };

  const rowClass = useMemo(
    () => (compact ? "grid-cols-2 md:grid-cols-3 lg:grid-cols-5" : "grid-cols-2 md:grid-cols-3 lg:grid-cols-5"),
    [compact],
  );

  if (loading) {
    return (
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
          <CardDescription className="text-white/60">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="text-center text-white/60">Loading ratios...</div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card className="border-white/10 bg-white/5">
        <CardHeader>
          <CardTitle className="text-white">{title}</CardTitle>
          <CardDescription className="text-white/60">{description}</CardDescription>
        </CardHeader>
        <CardContent>
          <div className={`grid gap-3 ${rowClass}`}>
            {ratioTiles.map((tile) => (
              <button
                key={tile.key}
                onClick={() => setSelectedRatio(tile)}
                className={`relative min-h-[140px] rounded-2xl bg-gradient-to-br ${tile.themeClass} p-4 text-left text-white shadow-lg transition hover:-translate-y-0.5`}
              >
                <div className="flex items-center justify-end">
                  <span className="rounded-full bg-black/30 px-2 py-1 text-xs font-semibold">
                    {tileStatusEmoji(tile)} {tile.targetLabel}
                  </span>
                </div>
                <p className="mt-2 text-2xl leading-none font-semibold text-white">{tile.title}</p>
                <p className="mt-4 text-5xl font-black tracking-tight text-white">{tile.valueLabel}</p>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedRatio} onOpenChange={() => setSelectedRatio(null)}>
        <DialogContent className="max-h-[85vh] max-w-3xl overflow-y-auto border-white/10 bg-slate-950/95 text-white">
          {selectedRatio && (
            <>
              <DialogHeader>
                <DialogTitle className="text-white">{selectedRatio.title} Details</DialogTitle>
                <DialogDescription className="text-white/60">
                  {selectedRatio.details.formula} · Target {selectedRatio.targetLabel}
                </DialogDescription>
              </DialogHeader>

              <div className="space-y-5">
                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/60">Numerator</p>
                      <p className="text-sm text-white/70">{selectedRatio.details.numeratorLabel}</p>
                      <p className="text-2xl font-semibold text-white">{currency(selectedRatio.details.numeratorValue)}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-white/60">Denominator</p>
                      <p className="text-sm text-white/70">{selectedRatio.details.denominatorLabel}</p>
                      <p className="text-2xl font-semibold text-white">{currency(selectedRatio.details.denominatorValue)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-white">Included Accounts</p>
                    {selectedRatio.details.includedAccounts.length === 0 ? (
                      <p className="text-sm text-white/60">No account rows used directly for this ratio.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedRatio.details.includedAccounts.map((account) => (
                          <div key={account.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white">{account.name}</span>
                              <span className="text-sm font-semibold text-white">{currency(account.balance)}</span>
                            </div>
                            <p className="text-xs text-white/60">{financialBucketLabel[account.financial_bucket]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                    <p className="mb-2 text-sm font-semibold text-white">Excluded Accounts</p>
                    {selectedRatio.details.excludedAccounts.length === 0 ? (
                      <p className="text-sm text-white/60">No excluded account rows for this ratio.</p>
                    ) : (
                      <div className="space-y-2">
                        {selectedRatio.details.excludedAccounts.map((account) => (
                          <div key={account.id} className="rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-white">{account.name}</span>
                              <span className="text-sm font-semibold text-white">{currency(account.balance)}</span>
                            </div>
                            <p className="text-xs text-white/60">{financialBucketLabel[account.financial_bucket]}</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="rounded-xl border border-white/10 bg-white/5 p-4">
                  <p className="mb-2 text-sm font-semibold text-white">Cash Flow Rows Used</p>
                  {selectedRatio.details.includedCashFlowItems.length === 0 ? (
                    <p className="text-sm text-white/60">No cash flow rows used directly for this ratio.</p>
                  ) : (
                    <div className="space-y-2">
                      {selectedRatio.details.includedCashFlowItems.map((item) => (
                        <div key={item.id} className="flex items-center justify-between rounded-lg border border-white/10 bg-black/20 px-3 py-2">
                          <div>
                            <p className="text-sm text-white">{item.name}</p>
                            <p className="text-xs text-white/60">
                              {prettyFlowType(item)} · {item.frequency}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-white">{currency(item.amount)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
