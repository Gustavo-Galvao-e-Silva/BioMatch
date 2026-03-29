import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Database, ArrowRight, Loader2 } from "lucide-react";
import { Button } from "../../ui/button";
import { Link } from "react-router-dom";

interface Study {
  id: number;
  brief_title: string;
  status: string | null;
}

export function TrialsList({ className }: { className?: string }) {
  const { user } = useUser();
  const [trials, setTrials] = useState<Study[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios
      .get("http://localhost:8000/research/my_studies", {
        params: { clerk_user_id: user.id },
      })
      .then((res) => setTrials(res.data.slice(0, 3)))
      .catch(() => setTrials([]))
      .finally(() => setLoading(false));
  }, [user]);

  const statusClass = (status: string | null) =>
    status?.toUpperCase() === "RECRUITING"
      ? "bg-secondary/20 text-secondary"
      : "bg-muted text-muted-foreground";

  return (
    <div className={className}>
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Database className="w-5 h-5 text-primary" /> Manage My Research
        </h2>
        <div className="space-y-3">
          {loading ? (
            <div className="flex justify-center py-10">
              <Loader2 className="w-6 h-6 text-primary animate-spin" />
            </div>
          ) : trials.length > 0 ? (
            trials.map((trial) => (
              <Link
                key={trial.id}
                to="/researcher/manage"
                className="glass p-4 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors"
              >
                <div className="space-y-1 flex-1 min-w-0 pr-3">
                  <h3 className="font-bold group-hover:text-primary transition-colors truncate">
                    {trial.brief_title}
                  </h3>
                  <div className="flex gap-3 text-xs">
                    <span className={`px-2 py-0.5 rounded-full ${statusClass(trial.status)}`}>
                      {trial.status ?? "Unknown"}
                    </span>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </Link>
            ))
          ) : (
            <div className="glass p-8 rounded-xl text-center">
              <Database className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground text-sm">No trials yet. Claim one to get started.</p>
            </div>
          )}
          <Link to="/researcher/manage">
            <Button variant="link" className="text-primary p-0 h-auto font-bold">View all trials</Button>
          </Link>
        </div>
      </div>
    </div>
  );
}
