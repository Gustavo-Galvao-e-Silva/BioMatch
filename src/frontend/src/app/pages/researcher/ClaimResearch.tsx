// TO-DO : 
//    chamada da API que realmente pega do clininicaltrials.gov
//    checar se email do pesquisador realmente bate com o que esta como dono da pesquisa

import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Search, ShieldCheck, Loader2, AlertCircle } from "lucide-react";

export default function ClaimResearch() {
  const [nctId, setNctId] = useState("");
  const [status, setStatus] = useState<"idle" | "verifying" | "success" | "error">("idle");

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("verifying");

    // Simulação da chamada de API que checa o e-mail do Clerk vs ClinicalTrials Data
    setTimeout(() => {
      // Aqui você decidiria se deu match ou não
      setStatus("success"); 
    }, 2000);
  };

  return (
    <DashboardLayout role="researcher">
      <div className="max-w-2xl mx-auto pt-12 text-center space-y-8">
        <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <ShieldCheck className="w-10 h-10 text-primary" />
          </div>
          <h1 className="text-4xl font-bold text-foreground">Verify Research Ownership</h1>
          <p className="text-muted-foreground mt-2">
            Enter the NCT ID. We will match your verified email with the study's official contact.
          </p>
        </motion.div>

        <form onSubmit={handleVerify} className="relative">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-6 h-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            <Input 
              placeholder="NCT01234567" 
              value={nctId}
              onChange={(e) => setNctId(e.target.value.toUpperCase())}
              className="pl-12 h-16 text-xl bg-card border-2 border-border focus:border-primary rounded-2xl shadow-sm glow"
              required
              disabled={status === "verifying"}
            />
          </div>
          <Button 
            type="submit" 
            size="lg"
            className="mt-6 w-full h-14 text-lg font-bold"
            disabled={status === "verifying" || !nctId}
          >
            {status === "verifying" ? <Loader2 className="animate-spin mr-2" /> : null}
            {status === "verifying" ? "Verifying Credentials..." : "Claim Research (s)"}
          </Button>
        </form>

        <AnimatePresence>
          {status === "success" && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="p-6 rounded-2xl bg-secondary/10 border border-secondary/30 text-secondary-foreground"
            >
              <h3 className="font-bold text-lg flex items-center justify-center gap-2">
                <ShieldCheck className="w-6 h-6" /> Ownership Verified!
              </h3>
              <p className="text-sm mt-1">This study has been successfully linked to your profile.</p>
              <Button variant="outline" className="mt-4 border-secondary text-secondary hover:bg-secondary/10">
                Go to Research Panel
              </Button>
            </motion.div>
          )}

          {status === "error" && (
            <motion.div 
              initial={{ y: 20, opacity: 0 }} 
              animate={{ y: 0, opacity: 1 }}
              className="p-6 rounded-2xl bg-destructive/10 border border-destructive/30 text-destructive"
            >
              <h3 className="font-bold flex items-center justify-center gap-2">
                <AlertCircle className="w-6 h-6" /> Verification Failed
              </h3>
              <p className="text-sm">Your email does not match the official contact for this NCT ID.</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}