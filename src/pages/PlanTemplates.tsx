import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { secureLogger } from "@/lib/secureLogger";
import type { Template } from "@/types/templateSystem";

interface ProfileOption {
  user_id: string;
  full_name: string | null;
  email: string;
}

const db = supabase as any;

const PlanTemplates = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [profiles, setProfiles] = useState<ProfileOption[]>([]);
  const [newTemplateName, setNewTemplateName] = useState("");
  const [newTemplateDescription, setNewTemplateDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [applyOpen, setApplyOpen] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [applying, setApplying] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  const bootstrap = async () => {
    setLoading(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) {
        navigate("/");
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", session.user.id)
        .eq("role", "super_admin")
        .maybeSingle();

      const admin = !!roleData;
      setIsSuperAdmin(admin);
      if (!admin) {
        toast.error("Access denied. Super admin privileges required.");
        navigate("/home");
        return;
      }

      await Promise.all([loadTemplates(), loadProfiles()]);
    } catch (error) {
      secureLogger.error(error, "PlanTemplates bootstrap", "Failed to load template system");
      navigate("/home");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplates = async () => {
    const { data, error } = await db
      .from("plan_templates")
      .select("*")
      .order("updated_at", { ascending: false });
    if (error) throw error;
    setTemplates((data || []) as Template[]);
  };

  const loadProfiles = async () => {
    const { data, error } = await supabase.from("profiles").select("user_id, full_name, email").order("created_at");
    if (error) throw error;
    setProfiles((data || []) as ProfileOption[]);
  };

  const handleCreateTemplate = async (e: FormEvent) => {
    e.preventDefault();
    if (!newTemplateName.trim()) return;
    setCreating(true);
    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const session = sessionData.session;
      if (!session) throw new Error("Session expired");

      const { data, error } = await db
        .from("plan_templates")
        .insert({
          name: newTemplateName.trim(),
          description: newTemplateDescription.trim() || null,
          status: "draft",
          version: 1,
          created_by: session.user.id,
        })
        .select("*")
        .single();
      if (error) throw error;

      setNewTemplateName("");
      setNewTemplateDescription("");
      toast.success("Template created");
      await loadTemplates();
      navigate(`/plan-templates/${data.id}`);
    } catch (error: any) {
      secureLogger.error(error, "Create template", "Failed to create template");
      toast.error(error?.message || "Failed to create template");
    } finally {
      setCreating(false);
    }
  };

  const profileLabelMap = useMemo(() => {
    const map: Record<string, string> = {};
    for (const profile of profiles) {
      map[profile.user_id] = profile.full_name || profile.email;
    }
    return map;
  }, [profiles]);

  const buildSnapshotFromTemplate = async (templateId: string) => {
    const { data: template, error: templateError } = await db
      .from("plan_templates")
      .select("*")
      .eq("id", templateId)
      .single();
    if (templateError) throw templateError;

    const { data: pages, error: pagesError } = await db
      .from("plan_template_pages")
      .select("*")
      .eq("template_id", templateId)
      .order("page_number", { ascending: true });
    if (pagesError) throw pagesError;

    const { data: components, error: componentsError } = await db
      .from("plan_template_components")
      .select("*")
      .eq("template_id", templateId);
    if (componentsError) throw componentsError;

    const pageIds = (pages || []).map((p: any) => p.id);
    const { data: pageComponents, error: pageComponentsError } = await db
      .from("plan_template_page_components")
      .select("*")
      .in("template_page_id", pageIds.length > 0 ? pageIds : ["00000000-0000-0000-0000-000000000000"]);
    if (pageComponentsError) throw pageComponentsError;

    const componentMap = new Map<string, any>((components || []).map((comp: any) => [comp.id, comp]));
    const instancesByPage: Record<string, any[]> = {};
    for (const instance of (pageComponents || []) as any[]) {
      if (!instancesByPage[instance.template_page_id]) instancesByPage[instance.template_page_id] = [];
      instancesByPage[instance.template_page_id].push(instance);
    }

    const snapshotPages = (pages || []).map((page: any) => ({
      id: page.id,
      title: page.title,
      pageNumber: page.page_number,
      isOptional: page.is_optional,
      components: (instancesByPage[page.id] || [])
        .sort((a, b) => a.position - b.position)
        .map((instance) => {
          const base = componentMap.get(instance.template_component_id);
          return {
            id: instance.id,
            componentKey: base?.component_key,
            displayName: base?.display_name,
            category: base?.category,
            position: instance.position,
            visible: instance.visibility_default,
            config: {
              ...(base?.default_config || {}),
              ...(instance.instance_config || {}),
            },
            manualData: {
              ...(base?.default_manual_data || {}),
              ...(instance.instance_manual_data || {}),
            },
          };
        }),
    }));

    return {
      template: {
        id: template.id,
        name: template.name,
        version: template.version,
      },
      pages: snapshotPages,
    };
  };

  const handleApplyTemplate = async () => {
    if (!selectedTemplateId || !selectedUserId) return;
    setApplying(true);
    try {
      const snapshot = await buildSnapshotFromTemplate(selectedTemplateId);
      const template = templates.find((item) => item.id === selectedTemplateId);

      const { data, error } = await db
        .from("client_financial_plans")
        .insert({
          user_id: selectedUserId,
          source_template_id: selectedTemplateId,
          source_template_version: template?.version || 1,
          status: "draft",
          content: snapshot,
        })
        .select("*")
        .single();

      if (error) throw error;

      toast.success("Template applied to client");
      setApplyOpen(false);
      setSelectedTemplateId("");
      setSelectedUserId("");
      navigate(`/client-plans/${data.id}`);
    } catch (error: any) {
      secureLogger.error(error, "Apply template", "Failed to apply template");
      toast.error(error?.message || "Failed to apply template");
    } finally {
      setApplying(false);
    }
  };

  const updateStatus = async (templateId: string, status: Template["status"]) => {
    try {
      const { error } = await db.from("plan_templates").update({ status }).eq("id", templateId);
      if (error) throw error;
      await loadTemplates();
      toast.success(`Template marked as ${status}`);
    } catch (error: any) {
      secureLogger.error(error, "Update template status", "Failed to update template status");
      toast.error(error?.message || "Failed to update status");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading template system...</p>
      </div>
    );
  }

  if (!isSuperAdmin) return null;

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Template System</p>
            <h1 className="text-2xl font-heading">Financial Plan Templates</h1>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/plan-components")}>
              Component Library
            </Button>
            <Button variant="outline" onClick={() => setApplyOpen(true)}>
              <Wand2 className="mr-2 h-4 w-4" />
              Apply Template
            </Button>
            <Button variant="outline" onClick={() => navigate("/admin")}>
              Back to Admin
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[360px_1fr]">
        <Card className="h-fit border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Create Template</CardTitle>
            <CardDescription>Start a new multi-page plan template.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreateTemplate}>
              <div className="space-y-2">
                <Label htmlFor="template-name">Name</Label>
                <Input
                  id="template-name"
                  value={newTemplateName}
                  onChange={(e) => setNewTemplateName(e.target.value)}
                  placeholder="Core Financial Plan"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="template-description">Description</Label>
                <Input
                  id="template-description"
                  value={newTemplateDescription}
                  onChange={(e) => setNewTemplateDescription(e.target.value)}
                  placeholder="Template for comprehensive client plan"
                />
              </div>
              <Button type="submit" disabled={creating}>
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Creating..." : "Create"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {templates.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-12 text-center text-white/65">No templates yet. Create your first one.</CardContent>
            </Card>
          ) : (
            templates.map((template) => (
              <Card key={template.id} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <CardTitle>{template.name}</CardTitle>
                      <CardDescription>{template.description || "No description"}</CardDescription>
                    </div>
                    <span className="rounded-full border border-white/15 px-3 py-1 text-xs uppercase tracking-wider">
                      {template.status}
                    </span>
                  </div>
                </CardHeader>
                <CardContent className="flex flex-wrap items-center gap-2">
                  <Button onClick={() => navigate(`/plan-templates/${template.id}`)}>Open Builder</Button>
                  <Button
                    variant="outline"
                    onClick={() => updateStatus(template.id, template.status === "published" ? "draft" : "published")}
                  >
                    {template.status === "published" ? "Unpublish" : "Publish"}
                  </Button>
                  <Button variant="outline" onClick={() => {
                    setSelectedTemplateId(template.id);
                    setApplyOpen(true);
                  }}>
                    Apply to Client
                  </Button>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </main>

      <Dialog open={applyOpen} onOpenChange={setApplyOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Apply Template to Client</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Template</Label>
              <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template" />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      {template.name} ({template.status})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Client</Label>
              <Select value={selectedUserId} onValueChange={setSelectedUserId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select client" />
                </SelectTrigger>
                <SelectContent>
                  {profiles.map((profile) => (
                    <SelectItem key={profile.user_id} value={profile.user_id}>
                      {profileLabelMap[profile.user_id]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setApplyOpen(false)}>
                Cancel
              </Button>
              <Button
                onClick={handleApplyTemplate}
                disabled={!selectedTemplateId || !selectedUserId || applying}
              >
                {applying ? "Applying..." : "Create Client Snapshot"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PlanTemplates;
