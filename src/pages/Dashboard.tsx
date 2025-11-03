import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";
import { NetWorthCard } from "@/components/dashboard/NetWorthCard";
import { BalanceSheetCard } from "@/components/dashboard/BalanceSheetCard";
import { StatementOfPurposeCard } from "@/components/dashboard/StatementOfPurposeCard";
import { BusinessInfoCard } from "@/components/dashboard/BusinessInfoCard";
import { NetWorthChart } from "@/components/dashboard/NetWorthChart";
import { CashFlowCard } from "@/components/dashboard/CashFlowCard";
import { RatiosCard } from "@/components/dashboard/RatiosCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      setUser(session.user);

      // Check if user is super admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      setIsSuperAdmin(!!roleData);
    } catch (error) {
      secureLogger.error(error, 'Auth check', 'Failed to verify authentication');
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">Client Dashboard</h1>
          <div className="flex items-center gap-4">
            {isSuperAdmin && (
              <span className="text-sm bg-primary text-primary-foreground px-3 py-1 rounded-full">
                Super Admin
              </span>
            )}
            <Button onClick={handleLogout} variant="outline">
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="grid gap-6">
          {/* Net Worth Section */}
          <NetWorthCard userId={user?.id} />

          {/* Net Worth Chart */}
          <NetWorthChart userId={user?.id} />

          {/* Balance Sheet */}
          <BalanceSheetCard userId={user?.id} isSuperAdmin={isSuperAdmin} />

          {/* Cash Flow */}
          <CashFlowCard />

          {/* Ratios */}
          <RatiosCard userId={user?.id} />

          {/* Statement of Purpose */}
          <StatementOfPurposeCard userId={user?.id} isSuperAdmin={isSuperAdmin} />

          {/* Business Information */}
          <BusinessInfoCard userId={user?.id} isSuperAdmin={isSuperAdmin} />
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
