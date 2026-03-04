import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowUp, ArrowDown, Plus, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { secureLogger } from "@/lib/secureLogger";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Template, TemplateComponentDefinition, TemplatePage, TemplatePageComponentInstance } from "@/types/templateSystem";

const db = supabase as any;

interface InstanceWithComponent extends TemplatePageComponentInstance {
  component?: TemplateComponentDefinition;
}

const PlanTemplateBuilder = () => {
  const { templateId } = useParams<{ templateId: string }>();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [template, setTemplate] = useState<Template | null>(null);
  const [pages, setPages] = useState<TemplatePage[]>([]);
  const [components, setComponents] = useState<TemplateComponentDefinition[]>([]);
  const [instances, setInstances] = useState<TemplatePageComponentInstance[]>([]);

  const [newPageTitle, setNewPageTitle] = useState("");
  const [selectedPageId, setSelectedPageId] = useState("");
  const [selectedComponentId, setSelectedComponentId] = useState("");

  useEffect(() => {
    bootstrap();
  }, [templateId]);

  const bootstrap = async () => {
    if (!templateId) return;
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

      await Promise.all([loadTemplate(), loadPages(), loadComponents(), loadInstances()]);
    } catch (error) {
      secureLogger.error(error, "Template builder bootstrap", "Failed to load template builder");
      navigate("/plan-templates");
    } finally {
      setLoading(false);
    }
  };

  const loadTemplate = async () => {
    const { data, error } = await db.from("plan_templates").select("*").eq("id", templateId).single();
    if (error) throw error;
    setTemplate(data as Template);
  };

  const loadPages = async () => {
    const { data, error } = await db
      .from("plan_template_pages")
      .select("*")
      .eq("template_id", templateId)
      .order("page_number", { ascending: true });
    if (error) throw error;
    setPages((data || []) as TemplatePage[]);
  };

  const loadComponents = async () => {
    const { data, error } = await db.from("plan_template_components").select("*").eq("template_id", templateId);
    if (error) throw error;
    setComponents((data || []) as TemplateComponentDefinition[]);
  };

  const loadInstances = async () => {
    const pageIds = pages.map((page) => page.id);
    const ids = pageIds.length > 0 ? pageIds : ["00000000-0000-0000-0000-000000000000"];
    const { data, error } = await db
      .from("plan_template_page_components")
      .select("*")
      .in("template_page_id", ids)
      .order("position", { ascending: true });
    if (error) throw error;
    setInstances((data || []) as TemplatePageComponentInstance[]);
  };

  useEffect(() => {
    if (pages.length > 0) {
      loadInstances().catch((error) => secureLogger.error(error, "Load instances", "Failed to load instances"));
    } else {
      setInstances([]);
    }
  }, [pages]);

  const instancesByPage = useMemo(() => {
    const map: Record<string, InstanceWithComponent[]> = {};
    const componentMap = new Map(components.map((component) => [component.id, component]));
    for (const instance of instances) {
      if (!map[instance.template_page_id]) map[instance.template_page_id] = [];
      map[instance.template_page_id].push({
        ...instance,
        component: componentMap.get(instance.template_component_id),
      });
    }
    for (const pageId of Object.keys(map)) {
      map[pageId].sort((a, b) => a.position - b.position);
    }
    return map;
  }, [instances, components]);

  const addPage = async () => {
    if (!templateId || !newPageTitle.trim()) return;
    try {
      const nextPageNumber = pages.length + 1;
      const { error } = await db.from("plan_template_pages").insert({
        template_id: templateId,
        title: newPageTitle.trim(),
        page_number: nextPageNumber,
      });
      if (error) throw error;
      setNewPageTitle("");
      await loadPages();
      toast.success("Page added");
    } catch (error: any) {
      secureLogger.error(error, "Add page", "Failed to add page");
      toast.error(error?.message || "Failed to add page");
    }
  };

  const deletePage = async (pageId: string) => {
    try {
      const { error } = await db.from("plan_template_pages").delete().eq("id", pageId);
      if (error) throw error;
      await loadPages();
      toast.success("Page removed");
    } catch (error: any) {
      secureLogger.error(error, "Delete page", "Failed to delete page");
      toast.error(error?.message || "Failed to delete page");
    }
  };

  const movePage = async (page: TemplatePage, direction: -1 | 1) => {
    const target = pages.find((candidate) => candidate.page_number === page.page_number + direction);
    if (!target) return;
    try {
      await db.from("plan_template_pages").update({ page_number: -1 }).eq("id", page.id);
      await db.from("plan_template_pages").update({ page_number: page.page_number }).eq("id", target.id);
      await db.from("plan_template_pages").update({ page_number: target.page_number }).eq("id", page.id);
      await loadPages();
    } catch (error: any) {
      secureLogger.error(error, "Move page", "Failed to reorder page");
      toast.error(error?.message || "Failed to move page");
    }
  };

  const addComponentToPage = async () => {
    if (!selectedPageId || !selectedComponentId) return;
    try {
      const pageInstances = instancesByPage[selectedPageId] || [];
      const { error } = await db.from("plan_template_page_components").insert({
        template_page_id: selectedPageId,
        template_component_id: selectedComponentId,
        position: pageInstances.length + 1,
      });
      if (error) throw error;
      setSelectedComponentId("");
      await loadInstances();
      toast.success("Component added to page");
    } catch (error: any) {
      secureLogger.error(error, "Add component instance", "Failed to add component to page");
      toast.error(error?.message || "Failed to add component to page");
    }
  };

  const removeInstance = async (instanceId: string) => {
    try {
      const { error } = await db.from("plan_template_page_components").delete().eq("id", instanceId);
      if (error) throw error;
      await loadInstances();
      toast.success("Component removed");
    } catch (error: any) {
      secureLogger.error(error, "Remove instance", "Failed to remove component");
      toast.error(error?.message || "Failed to remove component");
    }
  };

  const moveInstance = async (instance: InstanceWithComponent, direction: -1 | 1) => {
    const pageInstances = instancesByPage[instance.template_page_id] || [];
    const target = pageInstances.find((candidate) => candidate.position === instance.position + direction);
    if (!target) return;
    try {
      await db.from("plan_template_page_components").update({ position: -1 }).eq("id", instance.id);
      await db.from("plan_template_page_components").update({ position: instance.position }).eq("id", target.id);
      await db.from("plan_template_page_components").update({ position: target.position }).eq("id", instance.id);
      await loadInstances();
    } catch (error: any) {
      secureLogger.error(error, "Move instance", "Failed to reorder component");
      toast.error(error?.message || "Failed to reorder component");
    }
  };

  const toggleVisibility = async (instance: InstanceWithComponent) => {
    try {
      const { error } = await db
        .from("plan_template_page_components")
        .update({ visibility_default: !instance.visibility_default })
        .eq("id", instance.id);
      if (error) throw error;
      await loadInstances();
    } catch (error: any) {
      secureLogger.error(error, "Toggle component visibility", "Failed to toggle component visibility");
      toast.error(error?.message || "Failed to toggle visibility");
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p>Loading template builder...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen">
      <header className="border-b border-white/10 bg-white/5">
        <div className="container mx-auto flex flex-wrap items-center justify-between gap-3 px-4 py-5">
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Template Builder</p>
            <h1 className="text-2xl font-heading">{template?.name || "Template"}</h1>
            <p className="text-sm text-white/65">{template?.description || "No description"}</p>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={() => navigate("/plan-components")}>
              Manage Library
            </Button>
            <Button variant="outline" onClick={() => navigate("/plan-templates")}>
              Back to Templates
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto space-y-6 px-4 py-8">
        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Pages</CardTitle>
            <CardDescription>Add and order pages in this template.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex gap-2">
              <Input
                value={newPageTitle}
                onChange={(e) => setNewPageTitle(e.target.value)}
                placeholder="Page title"
              />
              <Button onClick={addPage}>
                <Plus className="mr-2 h-4 w-4" />
                Add Page
              </Button>
            </div>
            <div className="grid gap-3">
              {pages.map((page) => (
                <div key={page.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="font-medium">Page {page.page_number}: {page.title}</p>
                    <p className="text-sm text-white/60">{(instancesByPage[page.id] || []).length} components</p>
                  </div>
                  <div className="flex gap-1">
                    <Button size="icon" variant="ghost" onClick={() => movePage(page, -1)}>
                      <ArrowUp className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => movePage(page, 1)}>
                      <ArrowDown className="h-4 w-4" />
                    </Button>
                    <Button size="icon" variant="ghost" onClick={() => deletePage(page.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-white/10 bg-white/5">
          <CardHeader>
            <CardTitle>Place Components</CardTitle>
            <CardDescription>Add library components to pages and control order/visibility.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2 md:grid-cols-[1fr_1fr_auto]">
              <div className="space-y-2">
                <Label>Page</Label>
                <Select value={selectedPageId} onValueChange={setSelectedPageId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select page" />
                  </SelectTrigger>
                  <SelectContent>
                    {pages.map((page) => (
                      <SelectItem key={page.id} value={page.id}>
                        Page {page.page_number}: {page.title}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Component</Label>
                <Select value={selectedComponentId} onValueChange={setSelectedComponentId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select component" />
                  </SelectTrigger>
                  <SelectContent>
                    {components.map((component) => (
                      <SelectItem key={component.id} value={component.id}>
                        {component.display_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-end">
                <Button onClick={addComponentToPage} disabled={!selectedPageId || !selectedComponentId}>
                  Add to Page
                </Button>
              </div>
            </div>

            <div className="space-y-5">
              {pages.map((page) => (
                <div key={page.id} className="space-y-2">
                  <p className="font-semibold">Page {page.page_number}: {page.title}</p>
                  {(instancesByPage[page.id] || []).length === 0 ? (
                    <p className="text-sm text-white/60">No components on this page yet.</p>
                  ) : (
                    <div className="space-y-2">
                      {(instancesByPage[page.id] || []).map((instance) => (
                        <div key={instance.id} className="flex items-center justify-between rounded-xl border border-white/10 bg-white/5 p-3">
                          <div>
                            <p className="font-medium">{instance.component?.display_name || "Unknown component"}</p>
                            <p className="text-sm text-white/60">
                              Position {instance.position} · {instance.visibility_default ? "Visible by default" : "Hidden by default"}
                            </p>
                          </div>
                          <div className="flex gap-1">
                            <Button size="icon" variant="ghost" onClick={() => moveInstance(instance, -1)}>
                              <ArrowUp className="h-4 w-4" />
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => moveInstance(instance, 1)}>
                              <ArrowDown className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => toggleVisibility(instance)}>
                              {instance.visibility_default ? "Hide" : "Show"}
                            </Button>
                            <Button size="icon" variant="ghost" onClick={() => removeInstance(instance.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default PlanTemplateBuilder;
