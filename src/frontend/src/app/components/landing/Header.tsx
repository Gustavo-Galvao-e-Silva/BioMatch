import { motion } from "motion/react";
import { FlaskConical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "../ui/button";
import { SignedIn, SignedOut, UserButton } from "@clerk/clerk-react";

export function Header() {
  return (
    <>
    <motion.header
      initial={{ y: -20, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      className="fixed top-6 inset-x-0 z-[100] flex justify-center px-4 pointer-events-none"
    >
      {/* Container: Usa o background do tema com opacidade para o blur */}
      <div className="w-full max-w-5xl bg-background/80 backdrop-blur-xl border border-border px-6 py-2.5 rounded-2xl flex items-center justify-between shadow-2xl pointer-events-auto relative overflow-hidden group">
        
        {/* Linha de brilho superior usando sua cor Primary real */}
        <div className="absolute top-0 inset-x-0 h-px bg-linear-to-r from-transparent via-primary to-transparent opacity-30" />

        {/* Logo: Agora usando a cor Foreground do seu tema */}
        <Link to="/" className="flex items-center gap-2 group/logo">
          <div className="w-9 h-9 rounded-xl bg-primary flex items-center justify-center shadow-lg transition-all group-hover/logo:scale-110 group-hover/logo:rotate-6">
            <FlaskConical className="w-5 h-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-sm font-black tracking-tighter text-foreground leading-none">
              Trial<span className="text-primary">Match</span>
            </span>
            <span className="text-[9px] text-muted-foreground font-bold tracking-[0.2em] uppercase">
              Precision AI
            </span>
          </div>
        </Link>

        {/* Nav Central: Cores Muted/Foreground do tema */}
        <nav className="hidden md:flex items-center gap-8">
          {["Network", "Protocol", "Security"].map((item) => (
            <Link 
              key={item} 
              to="#" 
              className="text-[10px] font-bold text-muted-foreground hover:text-primary transition-all uppercase tracking-[0.2em]"
            >
              {item}
            </Link>
          ))}
        </nav>

        {/* Ações: Usando Primary e Secondary do tema */}
        <div className="flex items-center gap-5">
          <SignedOut>
            <Link to="/login" className="text-[10px] font-bold text-muted-foreground hover:text-foreground transition-colors uppercase tracking-widest">
              Portal
            </Link>
            <Button asChild className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-full px-6 h-9 text-[10px] font-black uppercase tracking-widest shadow-lg shadow-primary/20 transition-all active:scale-95">
              <Link to="/login">Join Study</Link>
            </Button>
          </SignedOut>

          <SignedIn>
            <div className="flex items-center gap-4 border-l border-border pl-4">
              <div className="flex flex-col items-end">
                <span className="text-[9px] text-primary font-black uppercase tracking-tighter">System Active</span>
                <span className="text-[8px] text-muted-foreground uppercase font-bold tracking-tight">Node_042</span>
              </div>
              <UserButton 
                appearance={{
                  elements: {
                    userButtonAvatarBox: "w-9 h-9 border-2 border-primary/20 hover:border-primary transition-colors"
                  }
                }}
                afterSignOutUrl="/" 
              />
            </div>
          </SignedIn>
        </div>
      </div>
    </motion.header>
    <div className="h-24 md:h-32 w-full block" />
    </>
  );
}