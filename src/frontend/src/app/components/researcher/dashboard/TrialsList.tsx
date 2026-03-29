import { Database, ArrowRight } from "lucide-react";
import { Button } from "../../ui/button";

export function TrialsList({ className }: { className?: string }) {
  const trials = [
    // Mock data removed - will be populated from API
  ];

  return (
    <div className={className}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" /> Manage My Research
        </h2>
        <div className="space-y-3">
          {trials.length > 0 ? (
            trials.map((trial, i) => (
              <div key={i} className="glass p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors">
                <div className="space-y-1">
                  <h3 className="font-bold group-hover:text-primary transition-colors">{trial.title}</h3>
                  <div className="flex gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${trial.status === 'Active' ? 'bg-secondary/20 text-secondary' : 'bg-muted text-muted-foreground'}`}>
                      {trial.status}
                    </span>
                    <span className="text-muted-foreground font-medium">{trial.matches} compatible patients</span>
                  </div>
                </div>
                <Button variant="ghost" size="sm"><ArrowRight className="w-4 h-4" /></Button>
              </div>
            ))
          ) : (
            <div className="glass p-8 rounded-xl text-center">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No trials available yet. Data will be loaded from API.</p>
            </div>
          )}
          <Button variant="link" className="text-primary p-0 h-auto font-bold">View all trials</Button>
        </div>
      </div>
    </div>
  );
}