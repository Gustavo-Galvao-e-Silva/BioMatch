import { Plus } from "lucide-react";
import { Button } from "../../ui/button";

export function ResearcherHeader() {
  return (
    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">Researcher Portal</h1>
        <p className="text-muted-foreground">Manage clinical trials and recruitment.</p>
      </div>
      <Button className="gap-2 shadow-lg glow">
        <Plus className="w-5 h-5" /> Create New Trial
      </Button>
    </div>
  );
}