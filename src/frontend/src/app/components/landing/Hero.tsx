import { motion } from "motion/react";
import { Link } from "react-router";
import { Button } from "../ui/button";
import { ArrowRight, Sparkles, FlaskConical, UserRound, TrendingUp } from "lucide-react";
import { DecryptText } from "../shared/DecryptText";

const MotionDiv = motion.div;

export function Hero() {
    return (

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
                <span className="bg-linear-to-r from-primary via-secondary to-primary bg-clip-text text-transparent animate-gradient">
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
                <DecryptText text="Intelligent matching system between patients and clinical trials,
                facilitating access to innovative treatments through AI and medical
                record analysis." />
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

          </div>
        </div>
      </section>
    
    );
}