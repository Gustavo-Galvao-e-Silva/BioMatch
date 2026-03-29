import { ScrollProgress } from "../components/Effects";
import { Hero } from "../components/landing/Hero";
import { AnimatedBackground } from "../components/landing/AnimatedBackground";
import { Header } from "../components/landing/Header";
import { Features } from "../components/landing/Features";
import { TechFeatures } from "../components/landing/TechFeatures";
import { HowItWorks } from "../components/landing/HowItWorks";
import { CallToAction } from "../components/landing/CallToAction";
import { Footer } from "../components/landing/Footer";

export default function LandingPage() {
  return (
    <div className="min-h-screen flex flex-col overflow-hidden cursor-none">
      <ScrollProgress />
      <AnimatedBackground />
      <Header />
      <Hero />
      <Features />
      <TechFeatures />
      <HowItWorks />
      <CallToAction />
      <Footer />
      
    </div>
  );
}