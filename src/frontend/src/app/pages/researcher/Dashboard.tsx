import { motion } from "motion/react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { ResearcherHeader } from "../../components/researcher/dashboard/ResearcherHeader";
import { StatsGrid } from "../../components/researcher/dashboard/StatsGrid";
import { TrialsList } from "../../components/researcher/dashboard/TrialsList";
import { MiniInbox } from "../../components/researcher/dashboard/MiniInbox";

export default function ResearcherDashboard() {
  return (
    <DashboardLayout role="researcher">
      <motion.div 
        initial={{ opacity: 0, y: 20 }} 
        animate={{ opacity: 1, y: 0 }} 
        className="space-y-8"
      >
        <ResearcherHeader />
        <StatsGrid />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <TrialsList className="lg:col-span-2" />
          <MiniInbox />
        </div>
      </motion.div>
    </DashboardLayout>
  );
}