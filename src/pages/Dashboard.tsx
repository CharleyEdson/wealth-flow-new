import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
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
import { CashFlowAllocationCard } from "@/components/dashboard/CashFlowAllocationCard";
import { RatiosCard } from "@/components/dashboard/RatiosCard";

const Dashboard = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<any>(null);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [viewingUserId, setViewingUserId] = useState<string | null>(null);
  const [viewingUserEmail, setViewingUserEmail] = useState<string | null>(null);

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

      const isAdmin = !!roleData;
      setIsSuperAdmin(isAdmin);

      // Check if viewing as another user (super admin only)
      const viewAsParam = searchParams.get("viewAs");
      if (viewAsParam && isAdmin) {
        setViewingUserId(viewAsParam);
        
        // Fetch the user's email for display
        const { data: profileData } = await supabase
          .from("profiles")
          .select("email")
          .eq("user_id", viewAsParam)
          .maybeSingle();
        
        setViewingUserEmail(profileData?.email || null);
      }
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

  const displayUserId = viewingUserId || user?.id;
  const isViewingAsAnother = !!viewingUserId;

  return (
    <div className="min-h-screen text-white">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Wealthflow OS</p>
            <h1 className="text-2xl font-heading font-semibold text-white">Client Command Center</h1>
            {isViewingAsAnother && (
              <p className="text-sm text-primary mt-1">
                Viewing as: {viewingUserEmail}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <>
                <Button
                  onClick={() => navigate("/admin")}
                  variant="outline"
                  className="border-white/20 text-white hover:bg-white/10"
                >
                  Admin Dashboard
                </Button>
                <span className="hidden rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wider text-white/80 sm:inline-flex">
                  Super Admin
                </span>
              </>
            )}
            {user?.email && (
              <span className="hidden rounded-full border border-white/10 bg-white/5 px-4 py-1 text-sm text-white/70 sm:inline-flex">
                {user.email}
              </span>
            )}
            <Button
              onClick={handleLogout}
              className="bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_20px_45px_-20px_rgba(99,102,241,0.8)] transition-transform hover:scale-[1.03]"
            >
              Logout
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="space-y-12">
          <section className="overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 shadow-[0_40px_90px_-40px_rgba(15,23,42,0.9)] backdrop-blur-2xl">
            <div className="flex flex-col gap-10 lg:flex-row lg:items-start">
              <div className="flex-1">
                <h2 className="text-3xl font-heading font-semibold text-white md:text-4xl">
                  Your real-time financial cockpit.
                </h2>
                <p className="mt-4 max-w-2xl text-base text-white/70 md:text-lg">
                  Monitor live net worth trajectories, cash flow dynamics, and risk ratios from a single workspace.
                  Wealthflow keeps every stakeholder aligned with automated alerts and collaborative playbooks.
                </p>
                <div className="mt-8 grid gap-6 sm:grid-cols-3">
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Connected Accounts</p>
                    <p className="mt-3 text-2xl font-heading text-white">28</p>
                    <p className="mt-2 text-sm text-white/60">Banking, credit, investment, & private equity</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">AI Alerts</p>
                    <p className="mt-3 text-2xl font-heading text-white">12</p>
                    <p className="mt-2 text-sm text-white/60">Insights waiting for advisor action</p>
                  </div>
                  <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
                    <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Forecast Horizon</p>
                    <p className="mt-3 text-2xl font-heading text-white">36 mo</p>
                    <p className="mt-2 text-sm text-white/60">Scenario models refreshed each week</p>
                  </div>
                </div>
              </div>

              <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-white/10 bg-gradient-to-br from-primary/25 via-primary/10 to-transparent p-6">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-wider text-white/60">Active Client Session</p>
                  <h3 className="mt-2 text-xl font-heading text-white">
                    {user?.email ?? "Loading profile"}
                  </h3>
                  <p className="mt-2 text-sm text-white/60">
                    Session secured · Synchronized moments ago
                  </p>
                </div>
                <div className="space-y-4 text-sm text-white/70">
                  <div className="flex items-center justify-between">
                    <span>Access level</span>
                    <span className="font-medium text-white">
                      {isSuperAdmin ? "Super Admin" : "Client"}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Workspace status</span>
                    <span className="font-medium text-white">Optimal</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Data freshness</span>
                    <span className="font-medium text-white">Real-time</span>
                  </div>
                </div>
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-sm text-white/65">
                  Tip: Connect treasury and venture accounts to unlock 360° risk coverage.
                </div>
              </div>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="grid gap-6">
              <NetWorthCard userId={displayUserId} />
              <NetWorthChart userId={displayUserId} />
            </div>
            <div className="grid gap-6">
              <RatiosCard userId={displayUserId} />
            </div>
          </div>

          <div className="grid gap-6 xl:grid-cols-2">
            <BalanceSheetCard userId={displayUserId} isSuperAdmin={isSuperAdmin} />
            <CashFlowAllocationCard userId={displayUserId} />
            <CashFlowCard userId={displayUserId} />
            <StatementOfPurposeCard userId={displayUserId} isSuperAdmin={isSuperAdmin} />
            <BusinessInfoCard userId={displayUserId} isSuperAdmin={isSuperAdmin} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default Dashboard;
