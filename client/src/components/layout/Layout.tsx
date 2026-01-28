import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  CreditCard, 
  Sparkles, 
  Settings, 
  LogOut, 
  Menu 
} from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { useState } from "react";
import logo from "@/assets/logo.png";

const SidebarContent = () => {
  const [location] = useLocation();

  const links = [
    { href: "/", label: "Dashboard", icon: LayoutDashboard },
    { href: "/transactions", label: "Transactions", icon: CreditCard },
    { href: "/ai-insights", label: "Gemini Insights", icon: Sparkles },
  ];

  return (
    <div className="flex flex-col h-full bg-sidebar border-r border-sidebar-border text-sidebar-foreground">
      <div className="p-6 flex items-center gap-3">
        <img src={logo} alt="Gemini Spend" className="w-8 h-8 rounded-lg" />
        <span className="font-bold text-xl tracking-tight bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
          Gemini Spend
        </span>
      </div>

      <nav className="flex-1 px-4 py-4 space-y-2">
        {links.map((link) => {
          const Icon = link.icon;
          const isActive = location === link.href;
          return (
            <Link 
              key={link.href} 
              href={link.href}
              className={cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group",
                isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground shadow-lg shadow-sidebar-primary/20"
                  : "hover:bg-sidebar-accent hover:text-sidebar-accent-foreground text-muted-foreground"
              )}
            >
              <Icon className={cn("w-5 h-5", isActive && "animate-pulse")} />
              <span className="font-medium">{link.label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-sidebar-border">
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-foreground">
          <Settings className="w-5 h-5" />
          Settings
        </Button>
        <Button variant="ghost" className="w-full justify-start gap-3 text-muted-foreground hover:text-destructive hover:bg-destructive/10">
          <LogOut className="w-5 h-5" />
          Logout
        </Button>
      </div>
    </div>
  );
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="flex h-screen w-full bg-background overflow-hidden">
      {/* Desktop Sidebar */}
      <div className="hidden md:block w-64 h-full shrink-0">
        <SidebarContent />
      </div>

      {/* Mobile Sidebar */}
      <div className="md:hidden absolute top-4 left-4 z-50">
        <Sheet open={isOpen} onOpenChange={setIsOpen}>
          <SheetTrigger asChild>
            <Button variant="outline" size="icon" className="bg-background/50 backdrop-blur-md">
              <Menu className="w-5 h-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="p-0 w-64 border-r border-sidebar-border">
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>

      {/* Main Content */}
      <main className="flex-1 h-full overflow-y-auto relative scroll-smooth">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-primary/10 via-background to-background pointer-events-none" />
        <div className="container mx-auto p-4 md:p-8 max-w-7xl relative z-10">
          {children}
        </div>
      </main>
    </div>
  );
}
