import { motion, useMotionValue, useTransform, animate } from "motion/react";
import { useEffect } from "react";
import type { ReactNode } from "react";

interface FloatingCardProps {
  children: ReactNode;
  delay?: number;
  className?: string;
}

export function FloatingCard({ children, delay = 0, className = "" }: FloatingCardProps) {
  return (
    <motion.div
      initial={{ y: 20, opacity: 0 }}
      whileInView={{ y: 0, opacity: 1 }}
      viewport={{ once: true }}
      transition={{ duration: 0.6, delay }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

interface GradientTextProps {
  children: ReactNode;
  className?: string;
  animate?: boolean;
}

export function GradientText({ children, className = "", animate = false }: GradientTextProps) {
  return (
    <span
      className={`bg-gradient-to-r from-primary via-secondary to-primary bg-clip-text text-transparent ${
        animate ? "animate-gradient" : ""
      } ${className}`}
    >
      {children}
    </span>
  );
}

interface PulsingDotProps {
  className?: string;
}

export function PulsingDot({ className = "" }: PulsingDotProps) {
  return (
    <span className={`relative flex h-3 w-3 ${className}`}>
      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
      <span className="relative inline-flex rounded-full h-3 w-3 bg-primary"></span>
    </span>
  );
}

interface ShineButtonProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function ShineButton({ children, className = "", onClick }: ShineButtonProps) {
  return (
    <motion.button
      className={`relative overflow-hidden ${className}`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
    >
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent"
        initial={{ x: "-100%" }}
        whileHover={{ x: "100%" }}
        transition={{ duration: 0.6 }}
      />
      {children}
    </motion.button>
  );
}

interface AnimatedCounterProps {
  from: number;
  to: number;
  duration?: number;
  suffix?: string;
}

export function AnimatedCounter({ from, to, duration = 2, suffix = "" }: AnimatedCounterProps) {
  const count = useMotionValue(from);

  const rounded = useTransform(count, (latest) =>
    Math.round(latest).toLocaleString() + suffix
  );

  useEffect(() => {
    const controls = animate(count, to, {
      duration,
      ease: "easeOut",
    });

    return controls.stop;
  }, [count, to, duration]);

  return (
    <motion.span
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
    >
      <motion.span>{rounded}</motion.span>
    </motion.span>
  );
}

interface GlowCardProps {
  children: ReactNode;
  className?: string;
  glowColor?: string;
}

export function GlowCard({ children, className = "", glowColor = "primary" }: GlowCardProps) {
  return (
    <motion.div
      className={`relative group ${className}`}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div
        className={`absolute -inset-0.5 bg-gradient-to-r from-${glowColor} to-secondary rounded-2xl opacity-0 group-hover:opacity-75 blur transition duration-300`}
      />
      <div className="relative">{children}</div>
    </motion.div>
  );
}

interface ParticleFieldProps {
  count?: number;
  className?: string;
}

export function ParticleField({ count = 30, className = "" }: ParticleFieldProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 bg-primary/30 rounded-full"
          initial={{
            x: Math.random() * 100 + "%",
            y: Math.random() * 100 + "%",
          }}
          animate={{
            x: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
            y: [
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
              Math.random() * 100 + "%",
            ],
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
  );
}

interface FadeInWhenVisibleProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right";
}

export function FadeInWhenVisible({
  children,
  delay = 0,
  direction = "up",
}: FadeInWhenVisibleProps) {
  const directions = {
    up: { y: 50 },
    down: { y: -50 },
    left: { x: 50 },
    right: { x: -50 },
  };

  return (
    <motion.div
      initial={{ ...directions[direction], opacity: 0 }}
      whileInView={{ x: 0, y: 0, opacity: 1 }}
      viewport={{ once: true, margin: "-100px" }}
      transition={{ duration: 0.6, delay }}
    >
      {children}
    </motion.div>
  );
}

interface RotatingBorderProps {
  children: ReactNode;
  className?: string;
}

export function RotatingBorder({ children, className = "" }: RotatingBorderProps) {
  return (
    <div className={`relative ${className}`}>
      <motion.div
        className="absolute inset-0 rounded-2xl"
        style={{
          background: "linear-gradient(90deg, #0a7f8a, #2fced6, #0a7f8a)",
          backgroundSize: "200% 100%",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "200% 0%"],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "linear",
        }}
      />
      <div className="relative bg-background rounded-2xl m-[2px]">{children}</div>
    </div>
  );
}
