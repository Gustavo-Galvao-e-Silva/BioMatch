import { SignIn, useUser } from "@clerk/clerk-react";
import { Link, useNavigate } from "react-router";
import { FlaskConical, ArrowLeft, Mail, Lock, Sparkles, Shield, Zap } from "lucide-react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs";
import { useEffect, useState } from "react";
import { motion } from "motion/react";

const MotionDiv = motion.div;

const CLERK_PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY || "";
const HAS_CLERK = CLERK_PUBLISHABLE_KEY && CLERK_PUBLISHABLE_KEY.length > 10;

// Mock Login Component (when Clerk is not configured)
function MockLoginForm() {
  const [userType, setUserType] = useState<"patient" | "doctor" | "researcher">("patient");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const navigate = useNavigate();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Mock login - in production, this would be an API call
    console.log("Mock login:", { userType, email });
    alert(`Mock login successful as ${userType}!\nEmail: ${email}\n\nConfigure Clerk for real authentication.`);
    // TODO: Redirect to dashboard when implemented
  };

  const handleGoogleLogin = () => {
    alert("Configure Clerk to enable Google login");
  };

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <MotionDiv
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="bg-gradient-to-r from-primary/10 to-secondary/10 border-2 border-primary/20 rounded-xl p-4 backdrop-blur-sm"
      >
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <p className="text-sm font-semibold text-primary">Demo Mode Active</p>
        </div>
        <p className="text-sm text-muted-foreground">
          Configure your Clerk key in the <code className="bg-muted px-1 rounded font-mono">.env</code> file to enable real authentication
        </p>
      </MotionDiv>

      <MotionDiv
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
      >
        <Tabs value={userType} onValueChange={(v) => setUserType(v as any)} className="w-full">
          <TabsList className="grid w-full grid-cols-3 bg-muted/50 backdrop-blur-sm">
            <TabsTrigger value="patient" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Patient
            </TabsTrigger>
            <TabsTrigger value="doctor" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Doctor
            </TabsTrigger>
            <TabsTrigger value="researcher" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Researcher
            </TabsTrigger>
          </TabsList>

          <TabsContent value="patient" className="space-y-4 mt-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">For Patients:</span> Access with your email and password to find compatible clinical trials
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="doctor" className="space-y-4 mt-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">For Doctors:</span> Use your institutional email to manage patients
              </p>
            </motion.div>
          </TabsContent>

          <TabsContent value="researcher" className="space-y-4 mt-6">
            <motion.div
              initial={{ x: -20, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm"
            >
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">For Researchers:</span> Sign in with ORCID iD or institutional email
              </p>
            </motion.div>
          </TabsContent>
        </Tabs>
      </MotionDiv>

      <MotionDiv
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSubmit} className="space-y-4 mt-6">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative group">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative group">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 bg-card/50 backdrop-blur-sm border-border hover:border-primary/50 transition-colors"
                required
              />
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button type="submit" className="w-full shadow-lg hover:shadow-xl transition-shadow" size="lg">
              Sign in as {userType === "patient" ? "Patient" : userType === "doctor" ? "Doctor" : "Researcher"}
            </Button>
          </motion.div>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-border"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
            </div>
          </div>

          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Button
              type="button"
              variant="outline"
              className="w-full backdrop-blur-sm hover:bg-card/80 transition-colors"
              size="lg"
              onClick={handleGoogleLogin}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Continue with Google
            </Button>
          </motion.div>

          <p className="text-sm text-muted-foreground text-center">
            Don't have an account? <span className="text-primary font-semibold cursor-pointer hover:underline">Create one now</span>
          </p>
        </form>
      </MotionDiv>
    </div>
  );
}

// Clerk Login Component
function ClerkLoginForm() {
  const { isSignedIn } = useUser();

  useEffect(() => {
    if (isSignedIn) {
      console.log("User authenticated!");
      // TODO: Redirect to dashboard when implemented
    }
  }, [isSignedIn]);

  return (
    <div className="w-full max-w-md mx-auto space-y-6">
      <MotionDiv
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="grid gap-4 mb-8"
      >
        <div className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Researchers:</span> Use your ORCID iD or institutional email
          </p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 backdrop-blur-sm">
          <p className="text-sm text-muted-foreground">
            <span className="font-semibold text-foreground">Doctors and Patients:</span> Sign in with your email and password
          </p>
        </div>
      </MotionDiv>

      <MotionDiv
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex justify-center"
      >
        <SignIn
          appearance={{
            elements: {
              rootBox: "w-full",
              card: "bg-card shadow-2xl border border-border backdrop-blur-xl",
              headerTitle: "hidden",
              headerSubtitle: "hidden",
              socialButtonsBlockButton: "bg-card border-border hover:bg-accent/10 transition-colors",
              socialButtonsBlockButtonText: "text-foreground",
              formButtonPrimary: "bg-primary hover:bg-primary/90 text-primary-foreground shadow-lg",
              footerActionLink: "text-primary hover:text-primary/80",
              formFieldInput: "bg-input-background border-border text-foreground",
              formFieldLabel: "text-foreground",
              identityPreviewText: "text-foreground",
              identityPreviewEditButton: "text-primary",
            },
          }}
          routing="path"
          path="/login"
          signUpUrl="/login"
        />
      </MotionDiv>

      <div className="text-center space-y-4">
        <p className="text-sm text-muted-foreground">
          By signing in, you agree to our Terms of Use and Privacy Policy.
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background relative overflow-hidden">
      {/* Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="absolute inset-0">
          {[...Array(15)].map((_, i) => (
            <MotionDiv
              key={i}
              className="absolute w-1 h-1 bg-primary/30 rounded-full"
              initial={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
              }}
              animate={{
                x: Math.random() * (typeof window !== 'undefined' ? window.innerWidth : 1000),
                y: Math.random() * (typeof window !== 'undefined' ? window.innerHeight : 1000),
                scale: [1, 1.5, 1],
                opacity: [0.2, 0.5, 0.2],
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
        transition={{ duration: 0.6 }}
      >
        <header className="border-b border-border bg-card/50 backdrop-blur-xl shadow-lg">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex items-center justify-between">
            <Link to="/" className="flex items-center gap-2 group">
              <motion.div
                className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-lg"
                whileHover={{ rotate: 360, scale: 1.1 }}
                transition={{ duration: 0.6 }}
              >
                <FlaskConical className="w-6 h-6 text-primary-foreground" />
              </motion.div>
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                TrialMatch
              </span>
            </Link>
            <Link to="/">
              <Button variant="ghost" size="sm" className="gap-2 group">
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Back
              </Button>
            </Link>
          </div>
        </header>
      </MotionDiv>

      {/* Main Content */}
      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <MotionDiv
            initial={{ y: 30, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6 }}
            className="text-center space-y-2"
          >
            <motion.div
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/20 mb-4"
              animate={{ y: [0, -5, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
            >
              <Shield className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-primary">Secure Authentication</span>
            </motion.div>
            
            <h1 className="text-4xl font-bold text-foreground">Welcome Back</h1>
            <p className="text-muted-foreground text-lg">
              Sign in to your account to continue
            </p>
          </MotionDiv>

          {HAS_CLERK ? <ClerkLoginForm /> : <MockLoginForm />}

          <MotionDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.3 }}
            className="text-center pt-4 border-t border-border"
          >
            <p className="text-sm text-muted-foreground">
              The platform automatically creates your account on first access.
            </p>
          </MotionDiv>

          {/* Trust Badges */}
          <MotionDiv
            initial={{ y: 20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="flex justify-center gap-8 pt-6"
          >
            {[
              { icon: Shield, label: "HIPAA Compliant" },
              { icon: Zap, label: "Fast & Secure" },
              { icon: Sparkles, label: "AI Powered" },
            ].map((badge, i) => (
              <motion.div
                key={i}
                className="flex flex-col items-center gap-1"
                whileHover={{ scale: 1.1 }}
                transition={{ type: "spring", stiffness: 300 }}
              >
                <badge.icon className="w-6 h-6 text-primary" />
                <span className="text-xs text-muted-foreground">{badge.label}</span>
              </motion.div>
            ))}
          </MotionDiv>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border bg-card/30 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4">
            <p className="text-sm text-muted-foreground">
              © 2026 TrialMatch. Secure platform for clinical trial matching.
            </p>
            <div className="flex gap-6 text-sm text-muted-foreground">
              <a href="#" className="hover:text-primary transition-colors">Privacy</a>
              <a href="#" className="hover:text-primary transition-colors">Terms</a>
              <a href="#" className="hover:text-primary transition-colors">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
