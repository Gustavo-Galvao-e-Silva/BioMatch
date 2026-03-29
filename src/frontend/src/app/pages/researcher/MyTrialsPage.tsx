import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import axios from "axios";
import { motion, AnimatePresence } from "motion/react";
import { DashboardLayout } from "../../components/shared/DashboardLayout";
import {
  Database,
  X,
  User,
  ChevronRight,
  Loader2,
  AlertCircle,
} from "lucide-react";

const API_BASE = "http://localhost:8000";

interface Study {
  id: number;
  nct_id: string;
  brief_title: string;
  status: string | null;
  conditions: string[];
  phase: string[];
  sponsor: string | null;
  eligibility: {
    min_age?: number | string | null;
    max_age?: number | string | null;
    sex?: string;
  } | null;
}

interface PatientMatch {
  patient: {
    id: number;
    user_id: number;
    age: number | null;
    sex: string | null;
    location: string | null;
    medical_summary: string | null;
    conditions: string[];
    symptoms: string[];
    drugs: string[];
  };
  score: number;
}

function statusBadgeClass(status: string | null) {
  if (!status) return "bg-muted text-muted-foreground";
  const s = status.toUpperCase();
  if (s === "RECRUITING") return "bg-secondary/20 text-secondary";
  if (s === "ACTIVE_NOT_RECRUITING") return "bg-primary/20 text-primary";
  return "bg-muted text-muted-foreground";
}

function scoreColor(score: number) {
  if (score >= 7) return "text-secondary";
  if (score >= 5) return "text-primary";
  return "text-muted-foreground";
}

export default function MyTrialsPage() {
  const { user } = useUser();

  const [trials, setTrials] = useState<Study[]>([]);
  const [trialsLoading, setTrialsLoading] = useState(true);
  const [trialsError, setTrialsError] = useState<string | null>(null);

  const [selectedTrial, setSelectedTrial] = useState<Study | null>(null);
  const [matches, setMatches] = useState<PatientMatch[]>([]);
  const [matchLoading, setMatchLoading] = useState(false);
  const [matchError, setMatchError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    setTrialsLoading(true);
    setTrialsError(null);
    axios
      .get(`${API_BASE}/research/my_studies`, {
        params: { clerk_user_id: user.id },
      })
      .then((res) => setTrials(res.data))
      .catch(() => setTrialsError("Failed to load your trials."))
      .finally(() => setTrialsLoading(false));
  }, [user]);

  const openModal = (trial: Study) => {
    setSelectedTrial(trial);
    setMatches([]);
    setMatchError(null);
    setMatchLoading(true);
    axios
      .get(`${API_BASE}/matching/study/${trial.id}`)
      .then((res) => setMatches(res.data))
      .catch(() => setMatchError("Failed to fetch patient matches."))
      .finally(() => setMatchLoading(false));
  };

  const closeModal = () => {
    setSelectedTrial(null);
    setMatches([]);
  };

  return (
    <DashboardLayout role="researcher">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="space-y-6 max-w-3xl"
      >
        {/* Page Header */}
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Database className="w-6 h-6 text-primary" />
            My Clinical Trials
          </h1>
          <p className="text-muted-foreground text-sm mt-1">
            Click a trial to see matching patients from the database
          </p>
        </div>

        {/* Trials list */}
        {trialsLoading ? (
          <div className="flex items-center justify-center py-24">
            <Loader2 className="w-8 h-8 text-primary animate-spin" />
          </div>
        ) : trialsError ? (
          <div className="glass p-5 rounded-xl flex items-center gap-3 text-destructive border border-destructive/20">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            <p className="text-sm">{trialsError}</p>
          </div>
        ) : trials.length === 0 ? (
          <div className="glass p-14 rounded-xl text-center space-y-3">
            <Database className="w-12 h-12 text-muted-foreground mx-auto" />
            <h3 className="font-bold text-lg">No trials yet</h3>
            <p className="text-sm text-muted-foreground">
              Use "Claim a Research" in the sidebar to link a ClinicalTrials.gov study to your account.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {trials.map((trial, i) => (
              <motion.button
                key={trial.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.06 }}
                onClick={() => openModal(trial)}
                className="w-full glass p-5 rounded-xl flex items-center justify-between group hover:border-primary/50 transition-colors text-left"
              >
                <div className="flex-1 min-w-0 pr-4 space-y-1.5">
                  <h3 className="font-bold group-hover:text-primary transition-colors truncate">
                    {trial.brief_title}
                  </h3>
                  <div className="flex gap-2 flex-wrap text-xs">
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(trial.status)}`}
                    >
                      {trial.status ?? "Unknown"}
                    </span>
                    {trial.phase?.length > 0 && (
                      <span className="px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium">
                        {trial.phase.join(" / ")}
                      </span>
                    )}
                    {trial.conditions?.slice(0, 2).map((c) => (
                      <span
                        key={c}
                        className="px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                      >
                        {c}
                      </span>
                    ))}
                  </div>
                  {trial.sponsor && (
                    <p className="text-xs text-muted-foreground">{trial.sponsor}</p>
                  )}
                </div>
                <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0" />
              </motion.button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Patient match modal */}
      <AnimatePresence>
        {selectedTrial && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
            style={{
              backgroundColor: "rgba(0,0,0,0.6)",
              backdropFilter: "blur(4px)",
            }}
            onClick={(e) => e.target === e.currentTarget && closeModal()}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="bg-card border border-border rounded-2xl w-full max-w-2xl max-h-[80vh] flex flex-col shadow-2xl"
            >
              {/* Modal header */}
              <div className="p-6 border-b border-border flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <h2 className="font-bold text-lg leading-tight">
                    {selectedTrial.brief_title}
                  </h2>
                  <div className="flex gap-2 mt-2 flex-wrap">
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusBadgeClass(selectedTrial.status)}`}
                    >
                      {selectedTrial.status ?? "Unknown"}
                    </span>
                    <span className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-mono">
                      {selectedTrial.nct_id}
                    </span>
                  </div>
                </div>
                <button
                  onClick={closeModal}
                  className="text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-muted rounded-lg flex-shrink-0"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal body */}
              <div className="flex-1 overflow-y-auto p-6">
                {matchLoading ? (
                  <div className="flex flex-col items-center justify-center py-16 gap-3">
                    <Loader2 className="w-8 h-8 text-primary animate-spin" />
                    <p className="text-sm text-muted-foreground">
                      Running matching algorithm…
                    </p>
                  </div>
                ) : matchError ? (
                  <div className="flex items-center gap-3 text-destructive p-4 rounded-xl border border-destructive/20 bg-destructive/5">
                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                    <p className="text-sm">{matchError}</p>
                  </div>
                ) : matches.length === 0 ? (
                  <div className="text-center py-16 space-y-2">
                    <User className="w-10 h-10 text-muted-foreground mx-auto" />
                    <p className="font-medium">No matching patients found</p>
                    <p className="text-sm text-muted-foreground">
                      There are no eligible patients in the database yet.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-sm text-muted-foreground">
                      {matches.length} compatible patient
                      {matches.length !== 1 ? "s" : ""} found
                    </p>
                    {matches.map((match, i) => (
                      <motion.div
                        key={match.patient.id}
                        initial={{ opacity: 0, y: 8 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.04 }}
                        className="glass p-4 rounded-xl space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                              <User className="w-4 h-4 text-primary" />
                            </div>
                            <div>
                              <p className="font-semibold text-sm">
                                Patient #{match.patient.user_id}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {[
                                  match.patient.age && `${match.patient.age}y`,
                                  match.patient.sex,
                                  match.patient.location,
                                ]
                                  .filter(Boolean)
                                  .join(" · ")}
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p
                              className={`text-2xl font-bold leading-none ${scoreColor(match.score)}`}
                            >
                              {match.score.toFixed(1)}
                            </p>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              / 10
                            </p>
                          </div>
                        </div>

                        {match.patient.medical_summary && (
                          <p className="text-xs text-muted-foreground line-clamp-2 pl-12">
                            {match.patient.medical_summary}
                          </p>
                        )}

                        {(match.patient.conditions?.length > 0 ||
                          match.patient.symptoms?.length > 0) && (
                          <div className="pl-12 flex gap-1.5 flex-wrap">
                            {match.patient.conditions?.slice(0, 3).map((c) => (
                              <span
                                key={c}
                                className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary"
                              >
                                {c}
                              </span>
                            ))}
                            {match.patient.symptoms?.slice(0, 2).map((s) => (
                              <span
                                key={s}
                                className="text-xs px-2 py-0.5 rounded-full bg-muted text-muted-foreground"
                              >
                                {s}
                              </span>
                            ))}
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
