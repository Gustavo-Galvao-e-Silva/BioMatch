import type { ReactNode } from "react";
import { LayoutDashboard, FileText, MessageSquare, Settings, Fingerprint, Plus } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { Header } from "../landing/Header";
import { Button } from "../ui/button";

interface LayoutProps {
  children: ReactNode;
  role: "patient" | "doctor" | "researcher";
}

export function DashboardLayout({ children, role }: LayoutProps) {
  const location = useLocation();

  const menuItems = {
    patient: [
      { name: "Overview", icon: LayoutDashboard, path: "/patient" },
      { name: "My Records", icon: FileText, path: "/patient/records" },
      { name: "Messages", icon: MessageSquare, path: "/patient/messages" },
    ],
    doctor: [
      { name: "Patients", icon: LayoutDashboard, path: "/doctor" },
      { name: "Referrals", icon: FileText, path: "/doctor/referrals" },
    ],
    researcher: [
      { name: "My Trials", icon: LayoutDashboard, path: "/researcher" },
      { name: "Analytics", icon: LayoutDashboard, path: "/researcher/stats" },
    ]
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* 1. HEADER NO TOPO (OCUPA 100% DA LARGURA) */}
      <Header />

      <div className="flex flex-1">
        {/* 2. SIDEBAR ABAIXO DO HEADER */}
        <aside className="w-64 border-r border-border bg-card/50 backdrop-blur-xl flex flex-col sticky top-18.25 h-[calc(100vh-73px)]">
          {/* Removido o TrialMatch daqui para evitar duplicidade */}
          
          <nav className="flex-1 px-4 space-y-2 mt-8">
            {role && (
              <div className="px-4 mb-4">
                <span className="text-[10px] uppercase tracking-widest font-bold text-primary/60">
                  {role} Menu
                </span>
              </div>
            )}
            
            {menuItems[role].map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${
                  location.pathname === item.path 
                  ? "bg-primary text-primary-foreground shadow-lg glow" 
                  : "text-muted-foreground hover:bg-primary/10 hover:text-primary"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="px-4 mb-6">
            <Link to="/researcher/claim">
              <Button className="w-full gap-2 shadow-lg glow bg-primary hover:bg-primary/90">
                <Fingerprint className="w-4 h-4" />
                Claim a Research
              </Button>
            </Link>
          </div>

          <div className="p-4 border-t border-border">
            <button className="flex items-center gap-3 px-4 py-3 w-full text-muted-foreground hover:text-primary transition-colors">
              <Settings className="w-5 h-5" />
              <span className="text-sm">Settings</span>
            </button>
          </div>
        </aside>

        {/* 3. CONTEÚDO PRINCIPAL */}
        <main className="flex-1 overflow-y-auto p-8">
          {children}
        </main>
      </div>
    </div>
  );
}