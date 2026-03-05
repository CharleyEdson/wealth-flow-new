import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { secureLogger } from "@/lib/secureLogger";
import { Trash2, Eye, UserPlus, FileText } from "lucide-react";
import { TEMPLATE_SYSTEM_ENABLED } from "@/lib/features";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface UserProfile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  created_at: string;
  role?: string;
}

const AdminDashboard = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);
  const [addUserOpen, setAddUserOpen] = useState(false);
  const [creatingUser, setCreatingUser] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");
  const [newUserName, setNewUserName] = useState("");
  const [newUserRole, setNewUserRole] = useState<"client" | "super_admin">("client");

  useEffect(() => {
    checkAdminAccess();
  }, []);

  const checkAdminAccess = async () => {
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

      if (!roleData) {
        toast.error("Access denied. Super admin privileges required.");
        navigate("/home");
        return;
      }

      fetchUsers();
    } catch (error) {
      secureLogger.error(error, 'Admin access check', 'Failed to verify admin access');
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const fetchUsers = async () => {
    try {
      const { data: profiles, error: profilesError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (profilesError) throw profilesError;

      // Fetch roles for each user
      const { data: roles } = await supabase
        .from("user_roles")
        .select("user_id, role");

      const usersWithRoles = profiles?.map(profile => ({
        ...profile,
        role: roles?.find(r => r.user_id === profile.user_id)?.role || "client"
      })) || [];

      setUsers(usersWithRoles);
    } catch (error) {
      secureLogger.error(error, 'Fetch users', 'Failed to load users');
      toast.error("Failed to load users");
    }
  };

  const handleDeleteUser = async (userId: string) => {
    try {
      // Delete user from Supabase Auth (this will cascade to profiles and other tables)
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        toast.error("Session expired");
        return;
      }

      // Note: Deleting users from auth requires admin API or edge function
      // For now, we'll just show a message
      toast.info("User deletion requires backend implementation. Contact system administrator.");
      setDeleteUserId(null);
    } catch (error) {
      secureLogger.error(error, 'Delete user', 'Failed to delete user');
      toast.error("Failed to delete user");
    }
  };

  const handleViewUser = (userId: string) => {
    navigate(`/home?viewAs=${userId}`);
  };

  const handleViewPlan = (userId: string) => {
    navigate(`/plan?viewAs=${userId}`);
  };

  const handleViewPlanV2 = (userId: string) => {
    navigate(`/plan-v2?viewAs=${userId}`);
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreatingUser(true);

    try {
      const { data, error } = await supabase.functions.invoke("admin-create-user", {
        body: {
          email: newUserEmail.trim(),
          password: newUserPassword,
          fullName: newUserName.trim(),
          role: newUserRole,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      toast.success("User created successfully");
      setAddUserOpen(false);
      setNewUserEmail("");
      setNewUserPassword("");
      setNewUserName("");
      setNewUserRole("client");
      fetchUsers();
    } catch (error: any) {
      secureLogger.error(error, "Create user", "Failed to create user");
      toast.error(error?.message || "Failed to create user");
    } finally {
      setCreatingUser(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/");
    toast.success("Logged out successfully");
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
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Super Admin</p>
            <h1 className="text-2xl font-heading font-semibold text-white">User Management Dashboard</h1>
          </div>
          <div className="flex items-center gap-3">
            <Button
              onClick={() => navigate("/home")}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              My Dashboard
            </Button>
            {TEMPLATE_SYSTEM_ENABLED && (
              <Button
                onClick={() => navigate("/plan-templates")}
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
              >
                Templates
              </Button>
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
        <Card className="border-white/10 bg-white/5 text-white backdrop-blur-2xl">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-white">All Users</CardTitle>
                <CardDescription className="text-white/60">
                  Manage and view all users in the system
                </CardDescription>
              </div>
              <Button
                variant="hero"
                onClick={() => setAddUserOpen(true)}
              >
                <UserPlus className="h-4 w-4 mr-2" />
                Add User
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {users.length === 0 ? (
                <p className="text-white/60 text-center py-8">No users found</p>
              ) : (
                <div className="grid gap-4">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="group flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-4 transition-all hover:border-white/20 hover:bg-white/10"
                    >
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-white">
                            {user.full_name || "No name"}
                          </h3>
                          <span className={`rounded-full px-2 py-1 text-xs font-semibold uppercase tracking-wider ${
                            user.role === 'super_admin' 
                              ? 'bg-primary/20 text-primary border border-primary/30' 
                              : 'bg-white/10 text-white/70 border border-white/20'
                          }`}>
                            {user.role === 'super_admin' ? 'Super Admin' : 'Client'}
                          </span>
                        </div>
                        <p className="text-sm text-white/60 mt-1">{user.email}</p>
                        <p className="text-xs text-white/40 mt-1">
                          Joined {new Date(user.created_at).toLocaleDateString()}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewUser(user.user_id)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <Eye className="h-4 w-4 mr-2" />
                          Dashboard
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPlan(user.user_id)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Financial Plan
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleViewPlanV2(user.user_id)}
                          className="text-white/60 hover:text-white hover:bg-white/10"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          Plan V2
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setDeleteUserId(user.user_id)}
                          className="text-white/60 hover:text-red-400 hover:bg-red-500/10"
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
      </main>

      <AlertDialog open={!!deleteUserId} onOpenChange={() => setDeleteUserId(null)}>
        <AlertDialogContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription className="text-white/60">
              This action cannot be undone. This will permanently delete the user
              and all their associated data.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="border-white/20 text-white hover:bg-white/10">
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => deleteUserId && handleDeleteUser(deleteUserId)}
              className="bg-red-500 text-white hover:bg-red-600"
            >
              Delete User
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={addUserOpen} onOpenChange={setAddUserOpen}>
        <DialogContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Create User</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-user-name" className="text-white/70">
                Full Name
              </Label>
              <Input
                id="new-user-name"
                value={newUserName}
                onChange={(e) => setNewUserName(e.target.value)}
                placeholder="Jordan Blake"
                required
                className="border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-email" className="text-white/70">
                Email
              </Label>
              <Input
                id="new-user-email"
                type="email"
                value={newUserEmail}
                onChange={(e) => setNewUserEmail(e.target.value)}
                placeholder="user@example.com"
                required
                className="border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-user-password" className="text-white/70">
                Temporary Password
              </Label>
              <Input
                id="new-user-password"
                type="password"
                value={newUserPassword}
                onChange={(e) => setNewUserPassword(e.target.value)}
                placeholder="At least 8 characters"
                minLength={8}
                required
                className="border-white/15 bg-white/10 text-white placeholder:text-white/50 focus-visible:border-primary/60 focus-visible:ring-4 focus-visible:ring-primary/40 focus-visible:ring-offset-0"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-white/70">Role</Label>
              <Select
                value={newUserRole}
                onValueChange={(value) => setNewUserRole(value as "client" | "super_admin")}
              >
                <SelectTrigger className="border-white/15 bg-white/10 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="border-white/10 bg-slate-950/95 text-white backdrop-blur-xl">
                  <SelectItem value="client">Client</SelectItem>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                onClick={() => setAddUserOpen(false)}
                disabled={creatingUser}
              >
                Cancel
              </Button>
              <Button type="submit" variant="hero" disabled={creatingUser}>
                {creatingUser ? "Creating..." : "Create User"}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminDashboard;
