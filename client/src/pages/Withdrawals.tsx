import { useWithdrawals, useUpdateWithdrawalStatus } from "@/hooks/use-admin";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import { Check, X, Clock, AlertCircle, Copy, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useState } from "react";

export default function Withdrawals() {
  const { data: withdrawals, isLoading } = useWithdrawals();
  const updateStatus = useUpdateWithdrawalStatus();
  const { toast } = useToast();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const filteredWithdrawals = withdrawals?.filter(w => 
    filter === 'all' ? true : w.status === filter
  );

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: "Copied to clipboard", duration: 2000 });
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 ml-64 p-8 overflow-y-auto">
        <div className="max-w-7xl mx-auto space-y-8">
          <PageHeader 
            title="Withdrawal Requests" 
            description="Manage and process TON withdrawal requests."
          >
            <div className="flex bg-card border border-white/10 rounded-lg p-1">
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`
                    px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all
                    ${filter === f ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:text-white'}
                  `}
                >
                  {f}
                </button>
              ))}
            </div>
          </PageHeader>

          {isLoading ? (
             <div className="flex items-center justify-center py-20">
               <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-primary"></div>
             </div>
          ) : (
            <div className="grid gap-4 animate-fade-in">
              {filteredWithdrawals?.length === 0 ? (
                <div className="text-center py-20 text-muted-foreground border border-dashed border-white/10 rounded-2xl">
                  No withdrawal requests found.
                </div>
              ) : (
                filteredWithdrawals?.map((withdrawal) => (
                  <div 
                    key={withdrawal.id} 
                    className="glass-card p-6 rounded-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border-l-4 border-l-transparent hover:border-l-primary transition-all duration-300"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`
                        p-3 rounded-xl flex items-center justify-center shrink-0
                        ${withdrawal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                          withdrawal.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'}
                      `}>
                        {withdrawal.status === 'pending' ? <Clock className="w-6 h-6" /> : 
                         withdrawal.status === 'completed' ? <Check className="w-6 h-6" /> :
                         <AlertCircle className="w-6 h-6" />}
                      </div>
                      
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-white text-lg">{withdrawal.amount.toFixed(4)} TON</h3>
                          <span className={`
                            text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                            ${withdrawal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                              withdrawal.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              'bg-red-500/10 text-red-500'}
                          `}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-sm text-muted-foreground group cursor-pointer" onClick={() => handleCopy(withdrawal.walletAddress)}>
                          <span className="font-mono">{withdrawal.walletAddress}</span>
                          <Copy className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground/60 flex items-center gap-2">
                          Requested by <span className="text-white hover:underline cursor-pointer">@{withdrawal.user?.username || withdrawal.user?.firstName}</span>
                          <span>•</span>
                          {format(new Date(withdrawal.createdAt!), "MMM d, yyyy 'at' h:mm a")}
                        </div>
                      </div>
                    </div>

                    {withdrawal.status === 'pending' && (
                      <div className="flex items-center gap-3 w-full md:w-auto">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex-1 md:flex-none"
                          onClick={() => updateStatus.mutate({ id: withdrawal.id, status: 'rejected' })}
                          disabled={updateStatus.isPending}
                        >
                          <X className="w-4 h-4 mr-2" />
                          Reject
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex-1 md:flex-none bg-green-600 hover:bg-green-700 text-white"
                          onClick={() => updateStatus.mutate({ id: withdrawal.id, status: 'completed' })}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="w-4 h-4 mr-2" />
                          Approve
                        </Button>
                      </div>
                    )}

                    {withdrawal.status !== 'pending' && (
                      <div className="text-xs font-mono text-muted-foreground opacity-50">
                        Processed
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
