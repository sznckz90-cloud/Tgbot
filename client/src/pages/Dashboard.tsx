import { useAdminStats } from "@/hooks/use-admin";
import { Sidebar } from "@/components/Sidebar";
import { StatCard } from "@/components/StatCard";
import { PageHeader } from "@/components/PageHeader";
import { Users, Wallet, Activity, TrendingUp } from "lucide-react";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";

// Mock data for the chart since we don't have historical data endpoint yet
const data = [
  { name: 'Mon', value: 400 },
  { name: 'Tue', value: 300 },
  { name: 'Wed', value: 550 },
  { name: 'Thu', value: 450 },
  { name: 'Fri', value: 650 },
  { name: 'Sat', value: 500 },
  { name: 'Sun', value: 700 },
];

export default function Dashboard() {
  const { data: stats, isLoading, error } = useAdminStats();

  if (isLoading) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-8 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex h-screen bg-background">
        <Sidebar />
        <main className="flex-1 ml-64 p-8">
          <div className="text-destructive">Failed to load stats</div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <PageHeader 
            title="Dashboard Overview" 
            description="Real-time monitoring of mining activities."
          >
            <button className="px-4 py-2 bg-primary/10 text-primary hover:bg-primary/20 rounded-lg text-sm font-medium transition-colors">
              Refresh Data
            </button>
          </PageHeader>

          <div className="grid gap-6 md:grid-cols-3 animate-fade-in">
            <StatCard
              title="Total Users"
              value={stats?.totalUsers || 0}
              icon={<Users className="w-6 h-6" />}
              trend="+12.5%"
              trendUp={true}
            />
            <StatCard
              title="Total Withdrawals"
              value={stats?.totalWithdrawals || 0}
              icon={<Wallet className="w-6 h-6" />}
              trend="+5.2%"
              trendUp={true}
            />
            <StatCard
              title="Circulating Supply"
              value={`${stats?.totalBalance.toFixed(2)} TON`}
              icon={<Activity className="w-6 h-6" />}
              trend="-2.1%"
              trendUp={false}
            />
          </div>

          <div className="grid gap-6 md:grid-cols-3 mt-8">
            <div className="col-span-2 glass-card rounded-2xl p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-bold text-white">Activity Overview</h3>
                <TrendingUp className="text-primary w-5 h-5" />
              </div>
              <div className="h-[300px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis 
                      dataKey="name" 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                    />
                    <YAxis 
                      stroke="#888888" 
                      fontSize={12} 
                      tickLine={false} 
                      axisLine={false} 
                      tickFormatter={(value) => `${value}`} 
                    />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                      cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                    />
                    <Bar 
                      dataKey="value" 
                      fill="hsl(var(--primary))" 
                      radius={[4, 4, 0, 0]} 
                      barSize={32}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-6">
              <h3 className="text-lg font-bold text-white mb-4">Quick Actions</h3>
              <div className="space-y-3">
                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <span className="text-sm font-medium">Export User Data</span>
                  <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Users className="w-4 h-4 text-primary" />
                  </div>
                </button>
                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <span className="text-sm font-medium">Pending Approvals</span>
                  <div className="w-8 h-8 rounded-lg bg-yellow-500/10 flex items-center justify-center group-hover:bg-yellow-500/20 transition-colors">
                    <Activity className="w-4 h-4 text-yellow-500" />
                  </div>
                </button>
                <button className="w-full p-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors flex items-center justify-between group">
                  <span className="text-sm font-medium">System Settings</span>
                  <div className="w-8 h-8 rounded-lg bg-purple-500/10 flex items-center justify-center group-hover:bg-purple-500/20 transition-colors">
                    <Users className="w-4 h-4 text-purple-500" />
                  </div>
                </button>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5">
                <h4 className="text-sm font-medium text-muted-foreground mb-3">System Status</h4>
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-white">Bot API: Operational</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500"></div>
                  <span className="text-xs text-white">Database: Connected</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
