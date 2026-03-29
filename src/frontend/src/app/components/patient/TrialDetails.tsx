import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Beaker, User, Mail, MapPin, ClipboardList, Zap, CheckCircle, Loader2 } from "lucide-react";
import { Button } from "../ui/button";

interface TrialDetailsProps {
  trial: any; 
  onBack: () => void;
}

export function TrialDetails({ trial, onBack }: TrialDetailsProps) {
  const [applied, setApplied] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleApply = async () => {
    setLoading(true);
    // Simulação do POST para o seu backend (Applications table)
    setTimeout(() => {
      setLoading(false);
      setApplied(true);
    }, 1500);
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, x: 50 }} 
      animate={{ opacity: 1, x: 0 }} 
      className="space-y-8 max-w-4xl mx-auto pb-20"
    >
      <Button variant="ghost" onClick={onBack} className="gap-2 text-muted-foreground hover:text-primary">
        <ArrowLeft className="w-4 h-4" /> Back to Search Results
      </Button>

      {/* Header com o Bloco de Match & Apply */}
      <div className="glass p-8 rounded-3xl border-l-8 border-secondary relative overflow-hidden">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <span className="px-3 py-1 rounded-full bg-secondary/10 text-secondary text-xs font-bold uppercase tracking-widest">
              {trial.phase} • {trial.id}
            </span>
            <h1 className="text-3xl font-bold text-foreground">{trial.title}</h1>
            <p className="flex items-center gap-2 text-muted-foreground">
              <MapPin className="w-4 h-4" /> {trial.location}
            </p>
          </div>

          {/* Coluna de Ação (Match + Botão) */}
          <div className="flex flex-col items-center gap-3 bg-card/50 p-4 rounded-2xl border border-border min-w-45">
            <div className="text-center">
              <div className="text-4xl font-black text-secondary">{trial.match}%</div>
              <div className="text-[10px] font-bold text-muted-foreground uppercase tracking-wider">Match Score</div>
            </div>

            <AnimatePresence mode="wait">
              {!applied ? (
                <motion.div
                  key="apply-btn"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full"
                >
                  <Button 
                    onClick={handleApply}
                    disabled={loading}
                    className="w-full bg-secondary hover:bg-secondary/90 text-white font-bold shadow-lg shadow-secondary/20 glow transition-all h-12"
                  >
                    {loading ? <Loader2 className="animate-spin w-5 h-5" /> : "Apply to Participate"}
                  </Button>
                </motion.div>
              ) : (
                <motion.div
                  key="success"
                  initial={{ scale: 0.5, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="flex items-center justify-center gap-2 text-secondary font-bold py-2 px-4 rounded-xl bg-secondary/10 w-full"
                >
                  <CheckCircle className="w-5 h-5" />
                  Applied!
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-2 space-y-6">
          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <ClipboardList className="w-5 h-5 text-primary" /> Study Description
            </h2>
            <div className="text-muted-foreground leading-relaxed bg-card/50 p-6 rounded-xl border border-border">
              {trial.description || "This study evaluates the efficacy and safety of new clinical approaches for your condition. It aims to bridge the gap between experimental research and practical medical application."}
            </div>
          </section>

          <section className="space-y-3">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Beaker className="w-5 h-5 text-primary" /> Interventions
            </h2>
            <div className="flex flex-wrap gap-2">
              {["Drug A", "Placebo Controlled", "Biomarker Testing", "Genomic Analysis"].map((tag) => (
                <span key={tag} className="px-3 py-1 bg-primary/10 text-primary rounded-lg text-sm font-medium border border-primary/20">
                  {tag}
                </span>
              ))}
            </div>
          </section>
        </div>

        <div className="space-y-6">
          <div className="glass p-6 rounded-2xl border-primary/20 bg-primary/5">
            <h3 className="font-bold mb-4 flex items-center gap-2">
              <User className="w-5 h-5 text-primary" /> Researcher Contact
            </h3>
            <div className="space-y-4">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase font-black">Principal Investigator</p>
                <p className="font-bold">Dr. Helena Vance</p>
              </div>
              <Button variant="outline" className="w-full gap-2 border-primary/30 hover:bg-primary/5">
                <Mail className="w-4 h-4" /> Message Researcher
              </Button>
            </div>
          </div>

          <div className="p-6 rounded-2xl border border-dashed border-secondary/30 bg-secondary/5">
            <h4 className="text-sm font-bold flex items-center gap-2 mb-2 text-secondary">
              <Zap className="w-4 h-4 fill-secondary" /> Why this match?
            </h4>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Based on your medical records and AI analysis, your biomarkers align perfectly with the inclusion criteria for this specific phase.
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}