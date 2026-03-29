import { useState } from "react";
import { useUser } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "motion/react";
import { Search, MessageCircle, ArrowLeft } from "lucide-react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { TrialSearch } from "../../components/patient/TrialSearch";
import { Button } from "../../components/ui/button";
import { TrialDetails } from "../../components/patient/TrialDetails";

export default function PatientDashboard() {
  const { user } = useUser();
  // Estado para controlar o que está visível
  const [view, setView] = useState<"menu" | "search" | "details">("menu");
  const [selectedTrial, setSelectedTrial] = useState<any>(null);

  const handleSelectTrial = (trial: any) => {
    setSelectedTrial(trial);
    setView("details");
  };

  return (
    <DashboardLayout role="patient">
      <AnimatePresence mode="wait">
        {view === "menu" && (
          <motion.div 
            key="menu"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="space-y-8"
          >
            <header>
              <h1 className="text-3xl font-bold text-primary">
                Welcome, {user?.firstName || "Patient"} 👋
              </h1>
              <p className="text-muted-foreground">Find the best clinical trials for your condition.</p>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Card Search - Agora com onClick */}
              <motion.div 
                whileHover={{ y: -5, scale: 1.02 }}
                onClick={() => setView("search")}
                className="glass p-6 rounded-2xl cursor-pointer border-2 border-transparent hover:border-secondary/50 transition-all"
              >
                <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
                  <Search className="w-6 h-6 text-secondary" />
                </div>
                <h3 className="font-bold text-lg">Search Trials</h3>
                <p className="text-sm text-muted-foreground">Explore available treatments manually.</p>
              </motion.div>

              <motion.div whileHover={{ y: -5, scale: 1.02 }} className="glass p-6 rounded-2xl cursor-pointer">
                <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
                  <MessageCircle className="w-6 h-6 text-accent" />
                </div>
                <h3 className="font-bold text-lg">My Messages</h3>
                <p className="text-sm text-muted-foreground">Connect with researchers.</p>
              </motion.div>
            </div>
          </motion.div>
        )}

        {view === "search" && (
          <motion.div 
            key="search"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            className="space-y-6"
          >
            <Button 
              variant="ghost" 
              onClick={() => setView("menu")}
              className="gap-2 text-muted-foreground hover:text-primary"
            >
              <ArrowLeft className="w-4 h-4" /> Back to Dashboard
            </Button>
            
            <TrialSearch onSelect={handleSelectTrial}/>
          </motion.div>
        )}

        {view === "details" && (
          <TrialDetails
              trial={selectedTrial}
              onBack={() => setView("search")}
              />
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}