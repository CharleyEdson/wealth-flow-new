import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";

const Auth = () => {
  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const inputStyles =
    "border-white/10 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0";

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session) {
        navigate("/home");
      }
    });

    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        navigate("/home");
      }
    });

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;
      toast.success("Login successful!");
    } catch (error: any) {
      secureLogger.error(error, 'Login', error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
          },
        },
      });

      if (error) throw error;

      if (data?.session) {
        toast.success("Account created. You are now signed in.");
      } else {
        toast.success("Account created. Check your email to confirm your account.");
        setIsLogin(true);
      }

      setPassword("");
    } catch (error: any) {
      secureLogger.error(error, 'Signup', error.message || "Signup failed");
      toast.error(error?.message || "Signup failed. Please verify your details and try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-slate-950" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(99,102,241,0.35),_transparent_55%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_bottom_right,_rgba(56,189,248,0.35),_transparent_50%)]" />
        <div className="absolute -left-24 top-32 h-72 w-72 rounded-full bg-primary/25 blur-3xl" />
        <div className="absolute -right-16 top-10 h-64 w-64 rounded-full bg-accent/20 blur-[90px]" />
      </div>

      <div className="relative z-10 grid min-h-screen items-stretch gap-16 px-6 py-12 lg:grid-cols-[1fr_1fr] lg:gap-20 lg:px-16">
        <div className="flex flex-col justify-between">
          <div>
            <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1 text-sm font-medium uppercase tracking-[0.3em] text-white/70 backdrop-blur-md">
              Wealthflow OS
            </span>
            <h1 className="mt-8 max-w-2xl text-4xl font-heading font-semibold leading-snug text-white md:text-5xl lg:text-6xl">
              High-velocity wealth intelligence for modern advisors.
            </h1>
            <p className="mt-6 max-w-xl text-base leading-relaxed text-white/70 md:text-lg">
              Wealthflow brings every balance sheet, cash flow, and KPI into a unified command center.
              Collaborate with clients in real time, forecast smarter, and automate the busywork with AI-native
              infrastructure.
            </p>
          </div>

          <div className="mt-12 grid gap-6 text-white/80 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Active Assets</p>
              <p className="mt-3 text-3xl font-heading font-semibold text-white">$4.7B+</p>
              <p className="mt-2 text-sm text-white/60">Tracked across hybrid portfolios</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Forecast Accuracy</p>
              <p className="mt-3 text-3xl font-heading font-semibold text-white">98%</p>
              <p className="mt-2 text-sm text-white/60">Powered by adaptive AI models</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg sm:col-span-2">
              <p className="text-xs font-semibold uppercase tracking-wider text-white/50">Trusted by</p>
              <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-white/65">
                <span className="rounded-full border border-white/15 px-4 py-1">Family offices</span>
                <span className="rounded-full border border-white/15 px-4 py-1">Boutique RIAs</span>
                <span className="rounded-full border border-white/15 px-4 py-1">Venture-backed CFOs</span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-center pb-6 lg:pb-0">
          <Card className="w-full max-w-md border-white/10 bg-white/10 text-white shadow-[0_25px_60px_-25px_rgba(15,23,42,0.85)] backdrop-blur-2xl">
            <CardHeader className="space-y-4">
              <div>
                <CardTitle className="text-3xl font-heading text-white">
                  {isLogin ? "Welcome back" : "Create your access"}
                </CardTitle>
                <CardDescription className="text-white/60">
                  {isLogin
                    ? "Sign in to orchestrate every client relationship from a single pane of glass."
                    : "Create your account to unlock the Wealthflow command center."}
                </CardDescription>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/60">
                <span className="inline-flex h-2 w-2 rounded-full bg-gradient-to-r from-primary to-secondary shadow-[0_0_15px_rgba(99,102,241,0.8)]" />
                <span>Zero-knowledge authentication secured by Supabase</span>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <form onSubmit={isLogin ? handleLogin : handleSignup} className="space-y-4">
                {!isLogin && (
                  <div className="space-y-2">
                    <Label htmlFor="fullName" className="text-sm font-medium text-white/70">
                      Full Name
                    </Label>
                    <Input
                      id="fullName"
                      type="text"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      required
                      placeholder="Jordan Blake"
                      className={inputStyles}
                    />
                  </div>
                )}

                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium text-white/70">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="you@wealthflow.ai"
                    className={inputStyles}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium text-white/70">
                    Password
                  </Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••"
                    className={inputStyles}
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-primary to-secondary text-primary-foreground shadow-[0_25px_45px_-20px_rgba(99,102,241,0.65)] transition duration-200 hover:scale-[1.01] hover:shadow-[0_30px_60px_-25px_rgba(56,189,248,0.6)]"
                  disabled={loading}
                >
                  {loading ? "Please wait..." : isLogin ? "Sign in to Wealthflow" : "Activate your workspace"}
                </Button>
              </form>

              <div className="pt-4 text-center text-sm text-white/65">
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="font-medium text-white transition hover:text-white/100"
                >
                  {isLogin
                    ? "Don't have an account? Create one"
                    : "Already onboarded? Log in instead"}
                </button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Auth;
