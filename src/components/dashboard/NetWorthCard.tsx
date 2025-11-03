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
      <Card>
        <CardHeader>
          <CardTitle>Net Worth</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Loading...</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth</CardTitle>
        <CardDescription>Your current financial position</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-4xl font-bold text-primary">
          ${netWorth?.toLocaleString() || "0"}
        </p>
      </CardContent>
    </Card>
  );
};
