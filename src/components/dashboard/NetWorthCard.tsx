import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface NetWorthCardProps {
  userId: string;
}

export const NetWorthCard = ({ userId }: NetWorthCardProps) => {
  const [netWorth, setNetWorth] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNetWorth();
  }, [userId]);

  const fetchNetWorth = async () => {
    try {
      const { data, error } = await supabase
        .from("net_worth_history")
        .select("net_worth")
        .eq("user_id", userId)
        .order("recorded_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) throw error;
      setNetWorth(data?.net_worth || 0);
    } catch (error) {
      console.error("Error fetching net worth:", error);
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
        <p className="text-sm text-white/60">Auto-refreshed with every sync</p>
      </CardContent>
    </Card>
  );
};
