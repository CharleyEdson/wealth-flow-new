export type TemplateStatus = "draft" | "published" | "archived";
export type ClientPlanStatus = "draft" | "active" | "archived";

export type PlanComponentKey =
  | "ratios"
  | "tax_allocation"
  | "portfolio_optimization"
  | "cash_flow_allocation"
  | "account_consolidation"
  | "text_block"
  | "goal_list"
  | "implementation_phase";

export interface Template {
  id: string;
  name: string;
  description: string | null;
  status: TemplateStatus;
  version: number;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface TemplatePage {
  id: string;
  template_id: string;
  page_number: number;
  title: string;
  is_optional: boolean;
  created_at: string;
  updated_at: string;
}

export interface TemplateComponentDefinition {
  id: string;
  template_id: string;
  component_key: PlanComponentKey;
  display_name: string;
  category: string;
  default_config: Record<string, unknown>;
  default_manual_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface TemplatePageComponentInstance {
  id: string;
  template_page_id: string;
  template_component_id: string;
  position: number;
  visibility_default: boolean;
  instance_config: Record<string, unknown>;
  instance_manual_data: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export interface ClientFinancialPlanSnapshot {
  id: string;
  user_id: string;
  source_template_id: string | null;
  source_template_version: number | null;
  snapshot_version: number;
  status: ClientPlanStatus;
  content: ClientPlanSnapshotContent;
  created_at: string;
  updated_at: string;
}

export interface ClientPlanSnapshotContent {
  template: Pick<Template, "id" | "name" | "version">;
  pages: SnapshotPage[];
}

export interface SnapshotPage {
  id: string;
  title: string;
  pageNumber: number;
  isOptional: boolean;
  components: SnapshotComponent[];
}

export interface SnapshotComponent {
  id: string;
  componentKey: PlanComponentKey;
  displayName: string;
  category: string;
  position: number;
  visible: boolean;
  config: Record<string, unknown>;
  manualData: Record<string, unknown>;
}

export interface PlanComponentResolvedData {
  key: PlanComponentKey;
  autoData: Record<string, unknown>;
  manualData: Record<string, unknown>;
  merged: Record<string, unknown>;
}
