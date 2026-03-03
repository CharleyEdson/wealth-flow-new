import { ArrowLeft, Edit3, Eye, Printer, Save } from "lucide-react";
import { Button } from "@/components/ui/button";

interface PlanV2HeaderProps {
  title: string;
  isEditMode: boolean;
  onBack: () => void;
  onToggleMode: () => void;
  onSave: () => void;
  onPrint: () => void;
  saving: boolean;
  showAdminButton?: boolean;
  onAdminNavigate?: () => void;
  onHomeNavigate: () => void;
  onLogout: () => void;
}

export const PlanV2Header = ({
  title,
  isEditMode,
  onBack,
  onToggleMode,
  onSave,
  onPrint,
  saving,
  showAdminButton,
  onAdminNavigate,
  onHomeNavigate,
  onLogout,
}: PlanV2HeaderProps) => {
  return (
    <header className="sticky top-0 z-30 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl plan-v2-no-print">
      <div className="container mx-auto flex flex-wrap items-center justify-between gap-4 px-4 py-5">
        <div className="flex items-center gap-4">
          <Button
            onClick={onBack}
            variant="ghost"
            size="sm"
            className="text-white/60 hover:text-white hover:bg-white/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <div>
            <p className="text-xs uppercase tracking-[0.35em] text-white/50">Financial Plan V2</p>
            <h1 className="text-2xl font-heading font-semibold text-white">{title}</h1>
          </div>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            onClick={onToggleMode}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            {isEditMode ? <Eye className="mr-2 h-4 w-4" /> : <Edit3 className="mr-2 h-4 w-4" />}
            {isEditMode ? "Presentation" : "Edit"}
          </Button>
          <Button
            onClick={onSave}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
            disabled={saving}
          >
            <Save className="mr-2 h-4 w-4" />
            {saving ? "Saving..." : "Save"}
          </Button>
          <Button
            onClick={onPrint}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            <Printer className="mr-2 h-4 w-4" />
            Print PDF
          </Button>
          {showAdminButton && onAdminNavigate && (
            <Button
              onClick={onAdminNavigate}
              variant="outline"
              className="border-white/20 text-white hover:bg-white/10"
            >
              Admin
            </Button>
          )}
          <Button
            onClick={onHomeNavigate}
            variant="outline"
            className="border-white/20 text-white hover:bg-white/10"
          >
            Home
          </Button>
          <Button
            onClick={onLogout}
            className="bg-gradient-to-r from-primary to-secondary text-primary-foreground"
          >
            Logout
          </Button>
        </div>
      </div>
    </header>
  );
};
