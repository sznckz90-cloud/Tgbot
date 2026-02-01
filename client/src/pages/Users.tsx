import { useUsers } from "@/hooks/use-admin";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import { Search, Trophy, User as UserIcon } from "lucide-react";
import { useState } from "react";

export default function Users() {
  const { data: users, isLoading } = useUsers();
  const [search, setSearch] = useState("");

  const filteredUsers = users?.filter(user => 
    user.username?.toLowerCase().includes(search.toLowerCase()) || 
    user.telegramId.includes(search) ||
    user.firstName?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          <PageHeader 
            title="User Management" 
            description="View and manage registered miners."
          >
            <div className="relative w-full sm:w-auto">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input 
                type="text" 
                placeholder="Search users..." 
                className="w-full sm:w-64 pl-10 pr-4 py-2 bg-card border border-white/10 rounded-lg text-sm text-foreground focus:outline-none focus:border-primary"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </PageHeader>

          {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
             </div>
          ) : (
            <>
              <div className="hidden lg:block glass-card rounded-2xl overflow-hidden animate-fade-in">
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-white/5 bg-white/[0.02]">
                        <th className="p-4 pl-6 text-xs font-semibold text-muted-foreground uppercase tracking-wider">User</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Telegram ID</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Balance</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Mining Level</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Joined</th>
                        <th className="p-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5">
                      {filteredUsers?.map((user) => (
                        <tr key={user.id} className="hover:bg-white/[0.02] transition-colors group">
                          <td className="p-4 pl-6">
                            <div className="flex items-center gap-3">
                              <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-xs">
                                {user.firstName ? user.firstName[0].toUpperCase() : <UserIcon className="w-4 h-4" />}
                              </div>
                              <div>
                                <div className="font-medium text-white">{user.firstName || "Unknown"}</div>
                                <div className="text-xs text-muted-foreground">@{user.username || "no_username"}</div>
                              </div>
                            </div>
                          </td>
                          <td className="p-4 text-sm font-mono text-muted-foreground">{user.telegramId}</td>
                          <td className="p-4 text-sm font-bold text-green-400">{user.balance.toFixed(4)} TON</td>
                          <td className="p-4">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-500/10 w-fit">
                              <Trophy className="w-3 h-3 text-amber-500" />
                              <span className="text-xs font-bold text-amber-500">Lvl {user.miningLevel}</span>
                            </div>
                          </td>
                          <td className="p-4 text-sm text-muted-foreground">
                            {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                          </td>
                          <td className="p-4">
                            <span className={`
                              inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                              ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                            `}>
                              {user.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
                {filteredUsers?.length === 0 && (
                  <div className="p-12 text-center text-muted-foreground">
                    No users found matching "{search}"
                  </div>
                )}
              </div>

              <div className="lg:hidden space-y-3 animate-fade-in">
                {filteredUsers?.map((user) => (
                  <div key={user.id} className="glass-card rounded-xl p-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold text-sm">
                          {user.firstName ? user.firstName[0].toUpperCase() : <UserIcon className="w-5 h-5" />}
                        </div>
                        <div>
                          <div className="font-medium text-white">{user.firstName || "Unknown"}</div>
                          <div className="text-xs text-muted-foreground">@{user.username || "no_username"}</div>
                        </div>
                      </div>
                      <span className={`
                        inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium capitalize
                        ${user.status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}
                      `}>
                        {user.status}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-3 text-sm">
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Balance</div>
                        <div className="font-bold text-green-400">{user.balance.toFixed(4)} TON</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Level</div>
                        <div className="flex items-center gap-1.5">
                          <Trophy className="w-3 h-3 text-amber-500" />
                          <span className="font-bold text-amber-500">Lvl {user.miningLevel}</span>
                        </div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Telegram ID</div>
                        <div className="font-mono text-xs text-muted-foreground truncate">{user.telegramId}</div>
                      </div>
                      <div>
                        <div className="text-xs text-muted-foreground mb-1">Joined</div>
                        <div className="text-xs text-muted-foreground">
                          {user.createdAt ? format(new Date(user.createdAt), "MMM d, yyyy") : "-"}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                {filteredUsers?.length === 0 && (
                  <div className="p-8 text-center text-muted-foreground glass-card rounded-xl">
                    No users found matching "{search}"
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  );
}
