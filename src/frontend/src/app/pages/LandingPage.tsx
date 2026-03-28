import { Link } from "react-router";
import { Button } from "../components/ui/button";
import { ArrowRight, UserRound, Stethoscope, FlaskConical, CheckCircle2, Sparkles, Zap, Shield, Database, MessageSquare, TrendingUp } from "lucide-react";
import { motion } from "motion/react";
import { ScrollProgress } from "../components/Effects";

const MotionDiv = motion.div;

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden">
      {/* Scroll Progress Bar */}
      <ScrollProgress />

      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-primary/5 to-secondary/10" />
        <div className="absolute inset-0">
          {[...Array(20)].map((_, i) => (
            <MotionDiv
              key={i}
              className="absolute w-2 h-2 bg-primary/20 rounded-full"
              initial={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
              }}
              animate={{
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                scale: [1, 1.5, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: Math.random() * 10 + 10,
                repeat: Infinity,
                ease: "linear",
              }}
            />
          ))}
        </div>
      </div>

      {/* Header */}
      <MotionDiv
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
      >
        <header className="border-b border-border bg-card/50 backdrop-blur-xl sticky top-0 z-50 shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <motion.div 
              className="flex items-center gap-2"
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg">
                <FlaskConical className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TrialMatch
              </span>
            </motion.div>
            <Link to="/login">
              <Button variant="outline" className="group">
                Sign In
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
          </div>
        </header>
      </MotionDiv>

      {/* Hero Section */}
      <section className="flex-1 flex items-center justify-center px-4 sm:px-6 lg:px-8 py-20 relative">
        <div className="max-w-7xl mx-auto w-full">
          <div className="text-center max-w-4xl mx-auto space-y-8">
            <MotionDiv
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.div
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-6"
                animate={{ y: [0, -5, 0] }}
                transition={{ duration: 2, repeat: Infinity }}
              >
                <Sparkles className="w-4 h-4 text-primary" />
                <span className="text-sm font-semibold text-primary">AI-Powered Clinical Trial Matching</span>
              </motion.div>
            </MotionDiv>

            <MotionDiv
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold text-foreground leading-tight">
                Connecting Patients to{" "}
                <span className="bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
                  Innovative Treatments
                </span>
              </h1>
            </MotionDiv>

            <MotionDiv
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
            >
              <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto">
                Intelligent matching system between patients and clinical trials,
                facilitating access to innovative treatments through AI and medical
                record analysis.
              </p>
            </MotionDiv>

            <MotionDiv
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
            >
              <Link to="/login">
                <Button size="lg" className="gap-2 shadow-xl hover:shadow-2xl transition-shadow group">
                  Get Started Now
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </Button>
              </Link>
              <Button size="lg" variant="outline" className="backdrop-blur-sm">
                Learn More
              </Button>
            </MotionDiv>

            {/* Stats */}
            <MotionDiv
              initial={{ y: 50, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.8 }}
              className="grid grid-cols-3 gap-8 max-w-2xl mx-auto pt-12"
            >
              {[
                { label: "Active Trials", value: "10K+", icon: FlaskConical },
                { label: "Patients Matched", value: "50K+", icon: UserRound },
                { label: "Success Rate", value: "95%", icon: TrendingUp },
              ].map((stat, i) => (
                <motion.div
                  key={i}
                  className="text-center"
                  whileHover={{ scale: 1.1 }}
                  transition={{ type: "spring", stiffness: 300 }}
                >
                  <div className="inline-flex items-center justify-center w-12 h-12 rounded-full bg-primary/10 mb-2">
                    <stat.icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="text-2xl font-bold text-foreground">{stat.value}</div>
                  <div className="text-sm text-muted-foreground">{stat.label}</div>
                </motion.div>
              ))}
            </MotionDiv>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-transparent to-card/30 relative">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-4 text-foreground">
              For Everyone in Clinical Research
            </h2>
            <p className="text-center text-muted-foreground text-lg mb-16 max-w-2xl mx-auto">
              Whether you're a patient seeking treatment, a doctor managing care, or a researcher conducting trials
            </p>
          </MotionDiv>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: UserRound,
                title: "Patients",
                description: "Find clinical trials compatible with your medical profile and access innovative treatments.",
                color: "primary",
                features: [
                  "Upload medical records",
                  "Automatic trial matching",
                  "Direct researcher connection"
                ]
              },
              {
                icon: Stethoscope,
                title: "Doctors",
                description: "Register patients and find treatment opportunities in relevant clinical trials.",
                color: "secondary",
                features: [
                  "Patient management",
                  "Intelligent recommendation system",
                  "Add and manage trials"
                ]
              },
              {
                icon: FlaskConical,
                title: "Researchers",
                description: "Publish your trials and find qualified patients efficiently.",
                color: "accent",
                features: [
                  "Trial management portal",
                  "Automatic patient matching",
                  "Integrated communication system"
                ]
              }
            ].map((card, i) => (
              <MotionDiv
                key={i}
                initial={{ y: 50, opacity: 0 }}
                whileInView={{ y: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                whileHover={{ y: -10, scale: 1.02 }}
              >
                <div className="bg-card rounded-2xl p-8 shadow-xl border border-border h-full backdrop-blur-sm hover:shadow-2xl transition-all duration-300 group relative overflow-hidden">
                  {/* Gradient overlay on hover */}
                  <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  
                  <div className="relative z-10">
                    <motion.div
                      className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300"
                      whileHover={{ rotate: [0, -10, 10, -10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <card.icon className="w-9 h-9 text-primary" />
                    </motion.div>
                    
                    <h3 className="text-2xl font-bold mb-4 text-foreground">{card.title}</h3>
                    <p className="text-muted-foreground mb-6">{card.description}</p>
                    
                    <ul className="space-y-3">
                      {card.features.map((feature, j) => (
                        <motion.li
                          key={j}
                          className="flex items-start gap-2"
                          initial={{ x: -20, opacity: 0 }}
                          whileInView={{ x: 0, opacity: 1 }}
                          viewport={{ once: true }}
                          transition={{ delay: i * 0.2 + j * 0.1 }}
                        >
                          <CheckCircle2 className="w-5 h-5 text-primary shrink-0 mt-0.5" />
                          <span className="text-sm text-foreground">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Tech Features */}
      <section className="px-4 sm:px-6 lg:px-8 py-20">
        <div className="max-w-7xl mx-auto">
          <MotionDiv
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl sm:text-5xl font-bold mb-4 text-foreground">
              Powered by Advanced Technology
            </h2>
            <p className="text-muted-foreground text-lg max-w-2xl mx-auto">
              State-of-the-art AI and machine learning to ensure the best matches
            </p>
          </MotionDiv>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              { icon: Zap, title: "Lightning Fast", description: "Real-time matching with instant results" },
              { icon: Shield, title: "Secure & Private", description: "HIPAA compliant with end-to-end encryption" },
              { icon: Database, title: "Smart Vectorization", description: "AI-powered semantic analysis of medical data" },
              { icon: MessageSquare, title: "Direct Communication", description: "Built-in messaging system for seamless connection" },
              { icon: TrendingUp, title: "Match Scoring", description: "Percentage-based compatibility rating" },
              { icon: Sparkles, title: "Auto Updates", description: "Continuous updates from ClinicalTrials.gov" },
            ].map((feature, i) => (
              <MotionDiv
                key={i}
                initial={{ scale: 0.8, opacity: 0 }}
                whileInView={{ scale: 1, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ scale: 1.05 }}
              >
                <div className="p-6 rounded-xl bg-gradient-to-br from-card to-card/50 border border-border backdrop-blur-sm hover:shadow-lg transition-all duration-300">
                  <feature.icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-lg font-bold mb-2 text-foreground">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground">{feature.description}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 bg-gradient-to-b from-card/30 to-transparent">
        <div className="max-w-5xl mx-auto">
          <MotionDiv
            initial={{ y: 50, opacity: 0 }}
            whileInView={{ y: 0, opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl sm:text-5xl font-bold text-center mb-16 text-foreground">
              How It Works
            </h2>
          </MotionDiv>
          
          <div className="space-y-12">
            {[
              {
                step: "1",
                title: "Intelligent Vectorization",
                description: "Trial data and medical records are processed and vectorized using AI, enabling deep semantic analysis."
              },
              {
                step: "2",
                title: "Precise Matching",
                description: "Recommendation system based on relevance and compatibility, with match percentage for each patient-trial combination."
              },
              {
                step: "3",
                title: "Direct Connection",
                description: "Integrated messaging system allows secure and efficient communication between patients, doctors, and researchers."
              }
            ].map((step, i) => (
              <MotionDiv
                key={i}
                initial={{ x: i % 2 === 0 ? -100 : 100, opacity: 0 }}
                whileInView={{ x: 0, opacity: 1 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: i * 0.2 }}
                className="flex flex-col md:flex-row gap-6 items-start"
              >
                <motion.div
                  className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-2xl font-bold shrink-0 shadow-lg"
                  whileHover={{ scale: 1.1, rotate: 360 }}
                  transition={{ duration: 0.6 }}
                >
                  {step.step}
                </motion.div>
                <div className="flex-1">
                  <h3 className="text-2xl font-bold mb-2 text-foreground">{step.title}</h3>
                  <p className="text-muted-foreground text-lg">{step.description}</p>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="px-4 sm:px-6 lg:px-8 py-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10" />
        <MotionDiv
          className="max-w-4xl mx-auto text-center space-y-6 relative z-10"
          initial={{ scale: 0.9, opacity: 0 }}
          whileInView={{ scale: 1, opacity: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <motion.div
            animate={{ rotate: [0, 360] }}
            transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
            className="inline-block"
          >
            <Sparkles className="w-16 h-16 text-primary mb-4" />
          </motion.div>
          <h2 className="text-4xl sm:text-5xl font-bold text-foreground">
            Ready to Transform Clinical Research?
          </h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Join the platform that's connecting patients to innovative treatments
            and helping researchers find qualified participants.
          </p>
          <Link to="/login">
            <Button size="lg" className="gap-2 shadow-2xl hover:scale-105 transition-transform">
              Create Free Account
              <ArrowRight className="w-5 h-5" />
            </Button>
          </Link>
        </MotionDiv>
      </section>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <FlaskConical className="w-5 h-5 text-primary-foreground" />
              </div>
              <span className="font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TrialMatch
              </span>
            </div>
            <p className="text-sm text-muted-foreground">
              © 2026 TrialMatch. Developed for the Hackathon.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}