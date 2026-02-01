import { useWithdrawals, useUpdateWithdrawalStatus } from "@/hooks/use-admin";
import { Sidebar } from "@/components/Sidebar";
import { PageHeader } from "@/components/PageHeader";
import { format } from "date-fns";
import { Check, X, Clock, AlertCircle, Copy } from "lucide-react";
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
      <main className="flex-1 lg:ml-64 p-4 sm:p-6 lg:p-8 overflow-y-auto pt-16 lg:pt-8">
        <div className="max-w-7xl mx-auto space-y-6 lg:space-y-8">
          <PageHeader 
            title="Withdrawal Requests" 
            description="Manage and process TON withdrawal requests."
          >
            <div className="flex bg-card border border-white/10 rounded-lg p-1 w-full sm:w-auto">
              {['all', 'pending', 'completed'].map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f as any)}
                  className={`
                    flex-1 sm:flex-none px-3 sm:px-4 py-1.5 rounded-md text-xs font-medium capitalize transition-all
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
            <div className="grid gap-3 sm:gap-4 animate-fade-in">
              {filteredWithdrawals?.length === 0 ? (
                <div className="text-center py-16 sm:py-20 text-muted-foreground border border-dashed border-white/10 rounded-xl sm:rounded-2xl">
                  No withdrawal requests found.
                </div>
              ) : (
                filteredWithdrawals?.map((withdrawal) => (
                  <div 
                    key={withdrawal.id} 
                    className="glass-card p-4 sm:p-6 rounded-xl flex flex-col gap-4 border-l-4 border-l-transparent hover:border-l-primary transition-all duration-300"
                  >
                    <div className="flex items-start gap-3 sm:gap-4">
                      <div className={`
                        p-2 sm:p-3 rounded-xl flex items-center justify-center shrink-0
                        ${withdrawal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                          withdrawal.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                          'bg-red-500/10 text-red-500'}
                      `}>
                        {withdrawal.status === 'pending' ? <Clock className="w-5 h-5 sm:w-6 sm:h-6" /> : 
                         withdrawal.status === 'completed' ? <Check className="w-5 h-5 sm:w-6 sm:h-6" /> :
                         <AlertCircle className="w-5 h-5 sm:w-6 sm:h-6" />}
                      </div>
                      
                      <div className="space-y-1 flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="font-bold text-white text-base sm:text-lg">{withdrawal.amount.toFixed(4)} TON</h3>
                          <span className={`
                            text-[10px] font-bold uppercase px-2 py-0.5 rounded-full
                            ${withdrawal.status === 'pending' ? 'bg-yellow-500/10 text-yellow-500' : 
                              withdrawal.status === 'completed' ? 'bg-green-500/10 text-green-500' :
                              'bg-red-500/10 text-red-500'}
                          `}>
                            {withdrawal.status}
                          </span>
                        </div>
                        <div 
                          className="flex items-center gap-2 text-xs sm:text-sm text-muted-foreground group cursor-pointer" 
                          onClick={() => handleCopy(withdrawal.walletAddress)}
                        >
                          <span className="font-mono truncate max-w-[150px] sm:max-w-none">{withdrawal.walletAddress}</span>
                          <Copy className="w-3 h-3 shrink-0 opacity-50 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <div className="text-xs text-muted-foreground/60 flex flex-wrap items-center gap-1 sm:gap-2">
                          <span>Requested by</span>
                          <span className="text-white">@{withdrawal.user?.username || withdrawal.user?.firstName}</span>
                          <span className="hidden sm:inline">•</span>
                          <span className="w-full sm:w-auto">{format(new Date(withdrawal.createdAt!), "MMM d, yyyy 'at' h:mm a")}</span>
                        </div>
                      </div>
                    </div>

                    {withdrawal.status === 'pending' && (
                      <div className="flex items-center gap-2 sm:gap-3 ml-0 sm:ml-14">
                        <Button 
                          variant="destructive" 
                          size="sm"
                          className="flex-1 sm:flex-none text-xs sm:text-sm"
                          onClick={() => updateStatus.mutate({ id: withdrawal.id, status: 'rejected' })}
                          disabled={updateStatus.isPending}
                        >
                          <X className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Reject
                        </Button>
                        <Button 
                          variant="default" 
                          size="sm"
                          className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 text-white text-xs sm:text-sm"
                          onClick={() => updateStatus.mutate({ id: withdrawal.id, status: 'completed' })}
                          disabled={updateStatus.isPending}
                        >
                          <Check className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2" />
                          Approve
                        </Button>
                      </div>
                    )}

                    {withdrawal.status !== 'pending' && (
                      <div className="text-xs font-mono text-muted-foreground opacity-50 ml-0 sm:ml-14">
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
