import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";
import { ArrowLeft } from "lucide-react";

const Plan = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const viewAsUserId = searchParams.get("viewAs");
  
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [displayUserId, setDisplayUserId] = useState<string>("");
  const [displayUserName, setDisplayUserName] = useState<string>("");

  useEffect(() => {
    checkAccess();
  }, [viewAsUserId]);

  const checkAccess = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session) {
        navigate("/");
        return;
      }

      // Check if user is super admin
      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const isAdmin = !!roleData;
      setIsSuperAdmin(isAdmin);

      // Determine which user's data to display
      let userIdToDisplay = session.user.id;
      
      if (viewAsUserId && isAdmin) {
        userIdToDisplay = viewAsUserId;
      }

      setDisplayUserId(userIdToDisplay);

      // Fetch user profile for display name
      const { data: profileData } = await supabase
        .from("profiles")
        .select("full_name, email")
        .eq("user_id", userIdToDisplay)
        .maybeSingle();

      if (profileData) {
        setDisplayUserName(profileData.full_name || profileData.email);
      }
    } catch (error) {
      secureLogger.error(error, 'Plan access check', 'Failed to verify access');
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
  };

  const handleBack = () => {
    if (viewAsUserId && isSuperAdmin) {
      navigate("/admin");
    } else {
      navigate("/home");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <p className="text-white">Loading...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen text-white bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/70 backdrop-blur-xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBack}
              variant="ghost"
              size="sm"
              className="text-white/60 hover:text-white hover:bg-white/10"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
            <div>
              <p className="text-xs uppercase tracking-[0.35em] text-white/50">Financial Plan</p>
              <h1 className="text-2xl font-heading font-semibold text-white">
                {viewAsUserId && isSuperAdmin ? `${displayUserName}'s Plan` : "Your Financial Plan"}
              </h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isSuperAdmin && (
              <Button
                onClick={() => navigate("/admin")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Admin Dashboard
              </Button>
            )}
            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Home
            </Button>
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
        <Card className="border-white/10 bg-white/5 text-white backdrop-blur-2xl">
          <CardHeader>
            <CardTitle className="text-white">Financial Plan Template</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-white/60">
              {isSuperAdmin 
                ? "Financial plan builder coming soon. You can create and edit plans for your clients here."
                : "Your personalized financial plan will appear here once created by your advisor."}
            </p>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Plan;
