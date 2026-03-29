// TO-DO : deletar mock-data

import { Search, Info, Star } from "lucide-react";
import { Input } from "../ui/input";
import { motion } from "motion/react";

interface TrialSearchProps {
  onSelect: (trial: any) => void;
}

export function TrialSearch({ onSelect }: TrialSearchProps) {
  const recommendations = [
    { id: 1, title: "Immunotherapy for Type 1 Diabetes", match: 98, phase: "Phase III", location: "Miami, FL" },
    { id: 2, title: "Novel Treatment for Hypertension", match: 75, phase: "Phase II", location: "Tampa, FL" },
  ];

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      {/* Search Bar imersiva */}
      <div className="relative group max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground group-focus-within:text-primary transition-colors" />
        <Input 
          className="h-14 pl-12 bg-card border-2 border-border focus:border-primary rounded-2xl shadow-lg glow text-lg"
          placeholder="Search by condition, drug, or location..."
        />
      </div>

      {/* Lista de Recomendados */}
      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Star className="w-5 h-5 text-secondary fill-secondary" />
          Recommended for You
        </h2>
        
        <div className="grid gap-4">
          {recommendations.map((trial) => (
            <div 
              key={trial.id}
              onClick={() => onSelect(trial)}
              className="glass p-5 rounded-2xl flex items-center justify-between group hover:border-secondary/50 transition-all"
              >
              <div className="space-y-1">
                <h3 className="font-bold text-lg group-hover:text-secondary transition-colors">{trial.title}</h3>
                <div className="flex gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1"><Info className="w-4 h-4" /> {trial.phase}</span>
                  <span>📍 {trial.location}</span>
                </div>
              </div>
              
              {/* Badge de Match % */}
              <div className="text-right">
                <div className="text-2xl font-black text-secondary">{trial.match}%</div>
                <div className="text-[10px] uppercase font-bold tracking-tighter text-muted-foreground">Match Score</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}