import { useState } from "react";
import { motion } from "motion/react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import { Button } from "../../components/ui/button";

// Novos Imports
import { StudyIdentification } from "../../components/researcher/claim/StudyIdentification";
import { ClinicalDetails } from "../../components/researcher/claim/ClinicalDetails";
import { GlobalReach } from "../../components/researcher/claim/GlobalReach";

export default function ClaimResearch() {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nct_id: "",
    brief_title: "",
    official_title: "",
    status: "RECRUITING",
    study_type: "INTERVENTIONAL",
    phase: [],
    conditions: "",
    sponsor: "",
    countries: ""
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const payload = {
      ...formData,
      conditions: formData.conditions.split(",").map(s => s.trim()).filter(Boolean),
      countries: formData.countries.split(",").map(s => s.trim()).filter(Boolean),
    };

    console.log("Payload para o Axios:", payload);
    setTimeout(() => setLoading(false), 1500);
  };

  return (
    <DashboardLayout role="researcher">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-primary">Claim Your Research</h1>
          <p className="text-muted-foreground">Attach an existing study to your profile.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6 pb-20">
          <StudyIdentification formData={formData} setFormData={setFormData} />
          <ClinicalDetails formData={formData} setFormData={setFormData} />
          <GlobalReach formData={formData} setFormData={setFormData} />

          <div className="flex justify-end gap-4">
            <Button variant="ghost" type="button">Cancel</Button>
            <Button type="submit" className="glow px-8" disabled={loading}>
              {loading ? "Processing..." : "Claim and Attach Study"}
            </Button>
          </div>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}