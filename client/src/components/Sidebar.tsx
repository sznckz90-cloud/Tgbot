import { Link, useLocation } from "wouter";
import { LayoutDashboard, Users, Wallet, CreditCard, Settings, Gem } from "lucide-react";

export function Sidebar() {
  const [location] = useLocation();

  const navItems = [
    { icon: LayoutDashboard, label: "Overview", href: "/" },
    { icon: Users, label: "Users", href: "/users" },
    { icon: Wallet, label: "Withdrawals", href: "/withdrawals" },
  ];

  return (
    <div className="w-64 border-r border-white/5 bg-card/30 backdrop-blur-xl h-screen flex flex-col fixed left-0 top-0 z-50">
      <div className="p-6 flex items-center gap-3 border-b border-white/5">
        <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-primary to-blue-600 flex items-center justify-center shadow-lg shadow-primary/20">
          <Gem className="text-white w-6 h-6" />
        </div>
        <div>
          <h1 className="font-display font-bold text-lg leading-tight">TON Miner</h1>
          <p className="text-xs text-muted-foreground font-medium">Admin Panel</p>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = location === item.href;
          return (
            <Link key={item.href} href={item.href}>
              <div
                className={`
                  flex items-center gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all duration-200 group
                  ${isActive 
                    ? "bg-primary text-primary-foreground shadow-lg shadow-primary/25 font-semibold" 
                    : "text-muted-foreground hover:text-foreground hover:bg-white/5"}
                `}
              >
                <item.icon className={`w-5 h-5 ${isActive ? "text-primary-foreground" : "text-muted-foreground group-hover:text-foreground transition-colors"}`} />
                <span>{item.label}</span>
              </div>
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-white/5">
        <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-4 border border-white/5">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-medium text-green-400">System Online</span>
          </div>
          <p className="text-xs text-muted-foreground">Server running smoothly. v1.0.2</p>
        </div>
      </div>
    </div>
  );
}
