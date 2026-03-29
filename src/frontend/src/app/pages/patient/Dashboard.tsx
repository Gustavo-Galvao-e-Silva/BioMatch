import { useUser } from "@clerk/clerk-react";
import { motion } from "motion/react";
import { FileUp, Search, MessageCircle } from "lucide-react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";

export default function PatientDashboard() {
  const { user } = useUser();

  return (
    <DashboardLayout role="patient">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="space-y-8"
      >
        {/* Saudação interna */}
        <header>
          <h1 className="text-3xl font-bold text-primary">
            Welcome, {user?.firstName || "Patient"} 👋
          </h1>
          <p className="text-muted-foreground">
            Find the best clinical trials for your condition.
          </p>
        </header>

        {/* Grid de Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card: Upload */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-2xl cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
              <FileUp className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-bold text-lg">Upload Medical Record</h3>
            <p className="text-sm text-muted-foreground">
              Let our AI analyze your data for trials matching.
            </p>
          </motion.div>

          {/* Card: Search */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-2xl cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-secondary" />
            </div>
            <h3 className="font-bold text-lg">Search Trials</h3>
            <p className="text-sm text-muted-foreground">
              Explore available treatments and conditions manually.
            </p>
          </motion.div>

          {/* Card: Messages */}
          <motion.div 
            whileHover={{ y: -5, scale: 1.02 }}
            className="glass p-6 rounded-2xl cursor-pointer"
          >
            <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4">
              <MessageCircle className="w-6 h-6 text-accent" />
            </div>
            <h3 className="font-bold text-lg">My Messages</h3>
            <p className="text-sm text-muted-foreground">
              Connect directly with trial researchers and doctors.
            </p>
          </motion.div>

        </div>
      </motion.div>
    </DashboardLayout>
  );
}