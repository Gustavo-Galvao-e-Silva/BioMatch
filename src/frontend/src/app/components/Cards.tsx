import { motion } from "motion/react";
import type { LucideIcon } from "lucide-react";
import { AnimatedCounter } from "./AnimatedComponents";

interface StatCardProps {
  icon: LucideIcon;
  value: string;
  label: string;
  delay?: number;
  prefix?: string;
  suffix?: string;
}

export function StatCard({ icon: Icon, value, label, delay = 0, prefix = "", suffix = "" }: StatCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay }}
      whileHover={{ scale: 1.05, y: -5 }}
      className="relative group"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 to-secondary/20 rounded-2xl opacity-0 group-hover:opacity-100 blur-xl transition-opacity duration-300" />
      <div className="relative bg-card/80 backdrop-blur-sm border border-border rounded-2xl p-6 text-center">
        <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-primary/10 to-secondary/10 mb-4 group-hover:scale-110 transition-transform duration-300">
          <Icon className="w-7 h-7 text-primary" />
        </div>
        <div className="text-3xl font-bold text-foreground mb-1">
            {prefix}
            <AnimatedCounter
              from={0}
              to={parseInt(value)}
              duration={1.5}
              suffix={suffix}
            />
        </div>
        <div className="text-sm text-muted-foreground">{label}</div>
      </div>
    </motion.div>
  );
}

interface FeatureCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  delay?: number;
}

export function FeatureCard({ icon: Icon, title, description, delay = 0 }: FeatureCardProps) {
  return (
    <motion.div
      initial={{ y: 50, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -5, scale: 1.02 }}
      className="group"
    >
      <div className="relative h-full p-6 rounded-2xl bg-gradient-to-br from-card to-card/50 border border-border backdrop-blur-sm hover:shadow-2xl transition-all duration-300 overflow-hidden">
        {/* Animated gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Content */}
        <div className="relative z-10">
          <motion.div
            className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-primary/20 to-secondary/20 mb-4"
            whileHover={{ rotate: [0, -10, 10, -10, 0] }}
            transition={{ duration: 0.5 }}
          >
            <Icon className="w-6 h-6 text-primary" />
          </motion.div>
          
          <h3 className="text-lg font-bold mb-2 text-foreground group-hover:text-primary transition-colors">
            {title}
          </h3>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>

        {/* Decorative element */}
        <div className="absolute -bottom-2 -right-2 w-24 h-24 bg-gradient-to-br from-primary/10 to-secondary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      </div>
    </motion.div>
  );
}

interface TestimonialCardProps {
  quote: string;
  author: string;
  role: string;
  avatar?: string;
  delay?: number;
}

export function TestimonialCard({ quote, author, role, avatar, delay = 0 }: TestimonialCardProps) {
  return (
    <motion.div
      initial={{ scale: 0.9, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ scale: 1.02 }}
      className="group"
    >
      <div className="relative h-full p-6 rounded-2xl bg-card border border-border backdrop-blur-sm hover:shadow-xl transition-all duration-300">
        {/* Quote mark */}
        <div className="text-6xl text-primary/20 font-serif leading-none mb-2">"</div>
        
        {/* Quote text */}
        <p className="text-muted-foreground mb-6 italic">{quote}</p>
        
        {/* Author info */}
        <div className="flex items-center gap-3">
          {avatar ? (
            <img src={avatar} alt={author} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center text-primary-foreground font-bold">
              {author.charAt(0)}
            </div>
          )}
          <div>
            <div className="font-semibold text-foreground">{author}</div>
            <div className="text-sm text-muted-foreground">{role}</div>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 -z-10" />
      </div>
    </motion.div>
  );
}

interface ProcessStepProps {
  step: string;
  title: string;
  description: string;
  delay?: number;
  isLast?: boolean;
}

export function ProcessStep({ step, title, description, delay = 0, isLast = false }: ProcessStepProps) {
  return (
    <div className="relative">
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        whileInView={{ x: 0, opacity: 1 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay }}
        className="flex gap-6 items-start"
      >
        {/* Step number */}
        <motion.div
          className="relative flex-shrink-0"
          whileHover={{ scale: 1.1, rotate: 360 }}
          transition={{ duration: 0.6 }}
        >
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary to-secondary text-primary-foreground flex items-center justify-center text-2xl font-bold shadow-lg z-10 relative">
            {step}
          </div>
          {/* Connecting line */}
          {!isLast && (
            <motion.div
              initial={{ height: 0 }}
              whileInView={{ height: "100%" }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: delay + 0.3 }}
              className="absolute left-1/2 top-16 w-0.5 h-full -translate-x-1/2 bg-gradient-to-b from-primary to-transparent"
            />
          )}
        </motion.div>

        {/* Content */}
        <div className="flex-1 pb-12">
          <h3 className="text-2xl font-bold mb-2 text-foreground">{title}</h3>
          <p className="text-muted-foreground text-lg">{description}</p>
        </div>
      </motion.div>
    </div>
  );
}

interface BadgeProps {
  icon: LucideIcon;
  text: string;
  delay?: number;
}

export function Badge({ icon: Icon, text, delay = 0 }: BadgeProps) {
  return (
    <motion.div
      initial={{ scale: 0, opacity: 0 }}
      whileInView={{ scale: 1, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5, delay, type: "spring", stiffness: 200 }}
      whileHover={{ scale: 1.1, rotate: [0, -5, 5, 0] }}
      className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-secondary/10 border border-primary/20 backdrop-blur-sm"
    >
      <Icon className="w-4 h-4 text-primary" />
      <span className="text-sm font-semibold text-primary">{text}</span>
    </motion.div>
  );
}
