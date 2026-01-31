import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { api, buildUrl } from "@shared/routes";
import { useToast } from "@/hooks/use-toast";

// GET /api/admin/stats
export function useAdminStats() {
  return useQuery({
    queryKey: [api.admin.stats.path],
    queryFn: async () => {
      const res = await fetch(api.admin.stats.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch stats");
      return api.admin.stats.responses[200].parse(await res.json());
    },
    refetchInterval: 30000, // Refresh every 30s
  });
}

// GET /api/admin/users
export function useUsers() {
  return useQuery({
    queryKey: [api.admin.users.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.users.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch users");
      return api.admin.users.list.responses[200].parse(await res.json());
    },
  });
}

// GET /api/admin/withdrawals
export function useWithdrawals() {
  return useQuery({
    queryKey: [api.admin.withdrawals.list.path],
    queryFn: async () => {
      const res = await fetch(api.admin.withdrawals.list.path, { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch withdrawals");
      return api.admin.withdrawals.list.responses[200].parse(await res.json());
    },
    refetchInterval: 15000, // Refresh withdrawals often
  });
}

// PATCH /api/admin/withdrawals/:id/status
export function useUpdateWithdrawalStatus() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async ({ id, status }: { id: number; status: 'pending' | 'processing' | 'completed' | 'rejected' }) => {
      const validated = api.admin.withdrawals.updateStatus.input.parse({ status });
      const url = buildUrl(api.admin.withdrawals.updateStatus.path, { id });
      
      const res = await fetch(url, {
        method: api.admin.withdrawals.updateStatus.method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(validated),
        credentials: "include",
      });

      if (!res.ok) {
        if (res.status === 404) throw new Error("Withdrawal not found");
        throw new Error("Failed to update status");
      }
      return api.admin.withdrawals.updateStatus.responses[200].parse(await res.json());
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: [api.admin.withdrawals.list.path] });
      queryClient.invalidateQueries({ queryKey: [api.admin.stats.path] });
      toast({
        title: "Status Updated",
        description: `Withdrawal marked as ${variables.status}`,
        variant: variables.status === "rejected" ? "destructive" : "default",
      });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
    },
  });
}
