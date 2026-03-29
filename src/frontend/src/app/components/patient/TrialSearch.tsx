import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { Search, Star, Loader2, MapPin, Info } from "lucide-react";
import { Input } from "../ui/input";
import { motion, AnimatePresence } from "motion/react";

interface TrialSearchProps {
  onSelect: (trial: any) => void;
}

export function TrialSearch({ onSelect }: TrialSearchProps) {
  const { user } = useUser();
  const [loading, setLoading] = useState(true);
  const [matches, setMatches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => {
    async function fetchMatches() {
      if (!user) return;
      try {
        setLoading(true);
        const matchRes = await axios.get(`http://localhost:8000/matching/patient/${user.id}`);
        setMatches(matchRes.data);
      } catch (error) {
        console.error("Failed to fetch matches", error);
      } finally {
        setLoading(false);
      }
    }
    fetchMatches();
  }, [user]);

  const filteredMatches = matches.filter(m =>
    m.study.brief_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.study.conditions.some((c: string) => c.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      {/* Barra de Pesquisa */}
      <div className="relative max-w-2xl mx-auto">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <Input 
          className="h-14 pl-12 bg-card border-2 border-border focus:border-primary rounded-2xl shadow-lg glow text-lg"
          placeholder="Search conditions or keywords..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold flex items-center gap-2 text-foreground">
          <Star className="w-5 h-5 text-secondary fill-secondary" />
          AI-Powered Recommendations
        </h2>

        {loading ? (
          <div className="flex flex-col items-center py-20 gap-4">
            <Loader2 className="w-10 h-10 text-primary animate-spin" />
            <p className="text-muted-foreground animate-pulse tracking-widest text-xs font-bold uppercase">
              Analyzing medical profile & cross-referencing trials...
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            <AnimatePresence>
              {filteredMatches.map((match) => (
                <motion.div
                  key={match.study.id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  onClick={() => onSelect(match.study)}
                  className="glass p-6 rounded-3xl flex items-center justify-between group hover:border-primary/50 transition-all cursor-pointer border border-border/50"
                >
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-bold uppercase">
                        {match.study.phase[0] || "Phase N/A"}
                      </span>
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                        {match.study.nct_id}
                      </span>
                    </div>
                    <h3 className="font-bold text-lg text-foreground group-hover:text-primary transition-colors">
                      {match.study.brief_title}
                    </h3>
                    <div className="flex gap-4 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {match.study.countries[0] || "Global"}</span>
                      <span className="flex items-center gap-1"><Info className="w-3 h-3" /> {match.study.status}</span>
                    </div>
                  </div>

                  <div className="text-right pl-6 border-l border-border ml-4">
                    <div className="text-3xl font-black text-primary">
                      {Math.round(match.score * 10)}%
                    </div>
                    <div className="text-[9px] uppercase font-black tracking-widest text-muted-foreground">
                      Match Score
                    </div>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
    </div>
  );
}