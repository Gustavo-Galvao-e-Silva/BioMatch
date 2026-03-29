import { Database, Users, MessageSquare, BarChart3 } from "lucide-react";

export function StatsGrid() {
  const stats = [
    { label: "Active Trials", value: "—", icon: Database, color: "text-primary" },
    { label: "Total Matches", value: "—", icon: Users, color: "text-secondary" },
    { label: "Pending Messages", value: "—", icon: MessageSquare, color: "text-accent" },
    { label: "Avg. Match Rate", value: "—", icon: BarChart3, color: "text-primary" },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, i) => (
        <div key={i} className="glass p-4 rounded-xl flex items-center gap-4">
          <div className="p-3 rounded-lg bg-background shadow-sm">
            <stat.icon className={`w-6 h-6 ${stat.color}`} />
          </div>
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wider font-bold">{stat.label}</p>
            <p className="text-xl font-bold">{stat.value}</p>
          </div>
        </div>
      ))}
    </div>
  );
}