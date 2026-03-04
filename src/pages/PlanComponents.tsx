import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import { planComponentRegistry } from "@/lib/planComponentRegistry";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Template, TemplateComponentDefinition, PlanComponentKey } from "@/types/templateSystem";

const db = supabase as any;

const PlanComponents = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string>("");
  const [libraryItems, setLibraryItems] = useState<TemplateComponentDefinition[]>([]);
  const [selectedRegistryKey, setSelectedRegistryKey] = useState<PlanComponentKey | "">("");
  const [displayName, setDisplayName] = useState("");
  const [creating, setCreating] = useState(false);

  useEffect(() => {
    bootstrap();
  }, []);

  useEffect(() => {
    if (selectedTemplateId) {
      loadLibraryItems(selectedTemplateId).catch((error) =>
        secureLogger.error(error, "Load component library", "Failed to load component library"),
      );
    } else {
      setLibraryItems([]);
    }
  }, [selectedTemplateId]);

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
      if (!roleData) {
        navigate("/home");
        return;
      }

      const { data, error } = await db.from("plan_templates").select("*").order("updated_at", { ascending: false });
      if (error) throw error;
      const loaded = (data || []) as Template[];
      setTemplates(loaded);
      if (loaded.length > 0) {
        setSelectedTemplateId(loaded[0].id);
      }
    } catch (error) {
      secureLogger.error(error, "Plan components bootstrap", "Failed to bootstrap component library");
      navigate("/plan-templates");
    } finally {
      setLoading(false);
    }
  };

  const loadLibraryItems = async (templateId: string) => {
    const { data, error } = await db
      .from("plan_template_components")
      .select("*")
      .eq("template_id", templateId)
      .order("created_at", { ascending: true });
    if (error) throw error;
    setLibraryItems((data || []) as TemplateComponentDefinition[]);
  };

  const selectedRegistryDefinition = useMemo(
    () => planComponentRegistry.find((item) => item.key === selectedRegistryKey),
    [selectedRegistryKey],
  );

  const handleCreate = async (e: FormEvent) => {
    e.preventDefault();
    if (!selectedTemplateId || !selectedRegistryDefinition) return;
    setCreating(true);
    try {
      const defaultManual = selectedRegistryDefinition.manualSchema.reduce<Record<string, unknown>>((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {});
      const defaultConfig = selectedRegistryDefinition.configSchema.reduce<Record<string, unknown>>((acc, field) => {
        acc[field.key] = "";
        return acc;
      }, {});

      const { error } = await db.from("plan_template_components").insert({
        template_id: selectedTemplateId,
        component_key: selectedRegistryDefinition.key,
        display_name: displayName.trim() || selectedRegistryDefinition.label,
        category: selectedRegistryDefinition.category,
        default_config: defaultConfig,
        default_manual_data: defaultManual,
      });
      if (error) throw error;

      setDisplayName("");
      setSelectedRegistryKey("");
      await loadLibraryItems(selectedTemplateId);
      toast.success("Library component created");
    } catch (error: any) {
      secureLogger.error(error, "Create library component", "Failed to create library component");
      toast.error(error?.message || "Failed to create library component");
    } finally {
      setCreating(false);
    }
  };

  const removeLibraryItem = async (id: string) => {
    try {
      const { error } = await db.from("plan_template_components").delete().eq("id", id);
      if (error) throw error;
      await loadLibraryItems(selectedTemplateId);
      toast.success("Component removed from library");
    } catch (error: any) {
      secureLogger.error(error, "Delete library component", "Failed to delete library component");
      toast.error(error?.message || "Failed to delete library component");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading component library...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-white/5">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Template System</p>
            <h1 className="text-2xl font-heading">Component Library</h1>
          </div>
          <Button variant="outline" onClick={() => navigate("/plan-templates")}>
            Back to Templates
          </Button>
        </div>
      </header>

      <main className="container mx-auto grid gap-6 px-4 py-8 lg:grid-cols-[380px_1fr]">
        <Card className="h-fit border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Add Library Component</CardTitle>
            <CardDescription>Create reusable component definitions for a template.</CardDescription>
          </CardHeader>
          <CardContent>
            <form className="space-y-4" onSubmit={handleCreate}>
              <div className="space-y-2">
                <Label>Template</Label>
                <Select value={selectedTemplateId} onValueChange={setSelectedTemplateId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Registry Type</Label>
                <Select
                  value={selectedRegistryKey}
                  onValueChange={(value) => setSelectedRegistryKey(value as PlanComponentKey)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select component type" />
                  </SelectTrigger>
                  <SelectContent>
                    {planComponentRegistry.map((def) => (
                      <SelectItem key={def.key} value={def.key}>
                        {def.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="display-name">Display Name (optional)</Label>
                <Input
                  id="display-name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  placeholder={selectedRegistryDefinition?.label || "Component display name"}
                />
              </div>
              <Button
                type="submit"
                disabled={!selectedTemplateId || !selectedRegistryDefinition || creating}
              >
                <Plus className="mr-2 h-4 w-4" />
                {creating ? "Adding..." : "Add to Library"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="space-y-4">
          {libraryItems.length === 0 ? (
            <Card className="border-white/10 bg-white/5">
              <CardContent className="py-12 text-center text-white/65">
                No library components for this template yet.
              </CardContent>
            </Card>
          ) : (
            libraryItems.map((item) => (
              <Card key={item.id} className="border-white/10 bg-white/5">
                <CardHeader>
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <CardTitle>{item.display_name}</CardTitle>
                      <CardDescription>
                        {item.component_key} · {item.category}
                      </CardDescription>
                    </div>
                    <Button size="icon" variant="ghost" onClick={() => removeLibraryItem(item.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
              </Card>
            ))
          )}
        </div>
      </main>
    </div>
  );
};

export default PlanComponents;
