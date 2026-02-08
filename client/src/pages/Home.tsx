import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function Home() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<"home" | "loading" | "verification" | "result">("home");
  const [status, setStatus] = useState<"success" | "failed">("success");
  const [verification, setVerification] = useState<{ question: string; options: string[]; answer: string } | null>(null);
  const queryClient = useQueryClient();
  
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId");
  const token = queryParams.get("token");
  const deviceId = "device_" + (userId || "unknown");

  const { data: userStats, isLoading: isStatsLoading } = useQuery({
    queryKey: ["/api/user/stats", userId],
    queryFn: async () => {
      if (!userId) return null;
      const res = await fetch(`/api/user/stats?userId=${userId}`);
      if (!res.ok) throw new Error("Failed to fetch stats");
      return res.json();
    },
    enabled: !!userId
  });

  const completeAdMutation = useMutation({
    mutationFn: async (passed: boolean) => {
      const res = await fetch("/api/ads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, deviceId, verificationPassed: passed })
      });
      if (!res.ok) throw new Error("Failed to complete ad");
      return res.json();
    },
    onSuccess: (data) => {
      if (data.success) {
        setStatus("success");
        queryClient.invalidateQueries({ queryKey: ["/api/user/stats", userId] });
      } else {
        setStatus("failed");
      }
      setScreen("result");
    },
    onError: () => {
      setStatus("failed");
      setScreen("result");
    }
  });

  useEffect(() => {
    if (!userId || !token) {
      console.warn("No userId or token provided in URL. Accessing in demo mode.");
    }
  }, [userId, token]);

  const handleWatchAd = () => {
    if (userStats?.dailyAdsCount >= 50) {
      alert("Daily limit of 50 ads reached!");
      return;
    }

    // @ts-ignore
    if (typeof show_8818815 === 'function') {
      // @ts-ignore
      show_8818815().then(() => {
        setScreen("loading");
        setTimeout(() => {
          setScreen("verification");
          generateVerification();
        }, 2000);
      }).catch(() => {
        // Even if ad fails to show, we continue for demo/safety
        setScreen("loading");
        setTimeout(() => {
          setScreen("verification");
          generateVerification();
        }, 2000);
      });
    } else {
      setScreen("loading");
      setTimeout(() => {
        setScreen("verification");
        generateVerification();
      }, 2000);
    }
  };

  const generateVerification = () => {
    const emojis = ["🍌", "❤️", "🦍", "⭐", "🍕", "🍎", "🚗", "🏀"];
    const target = emojis[Math.floor(Math.random() * 3)];
    const options = [...emojis].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.includes(target)) options[Math.floor(Math.random() * 4)] = target;
    
    setVerification({
      question: `Select ${target}`,
      options,
      answer: target
    });
  };

  const handleVerify = (selected: string) => {
    const passed = selected === verification?.answer;
    completeAdMutation.mutate(passed);
  };

  if (screen === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-center text-white">
        <Loader2 className="w-12 h-12 animate-spin text-blue-500 mb-4" />
        <h2 className="text-xl font-bold mb-2">Preparing ad...</h2>
        <p className="text-gray-400">Please wait...</p>
      </div>
    );
  }

  if (screen === "verification") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6">
        <Card className="w-full max-w-sm p-6 text-center bg-[#1a1a1a] border-none text-white shadow-2xl">
          <h2 className="text-2xl font-bold mb-6">🧠 Human Check</h2>
          <p className="text-lg mb-8 text-gray-300">{verification?.question}</p>
          <div className="grid grid-cols-2 gap-4">
            {verification?.options.map((opt) => (
              <Button 
                key={opt} 
                variant="outline" 
                className="text-3xl h-20 bg-[#2a2a2a] border-gray-700 hover:bg-[#3a3a3a]" 
                onClick={() => handleVerify(opt)}
              >
                {opt}
              </Button>
            ))}
          </div>
        </Card>
      </div>
    );
  }

  if (screen === "result") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-black p-6 text-center text-white">
        {status === "success" ? (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-gray-400 mb-8">Ad completed successfully. Reward will be credited.</p>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed</h2>
            <p className="text-gray-400 mb-8">Verification failed. Try again later.</p>
          </>
        )}
        <Button onClick={() => setScreen("home")} className="w-full max-w-xs bg-blue-600 hover:bg-blue-700">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-black text-white">
      <header className="p-4 border-b border-gray-800 flex justify-between items-center bg-[#0a0a0a]">
        <h1 className="font-bold text-lg">💰 Earn TON</h1>
        <div className="text-sm font-medium bg-blue-600/20 text-blue-400 px-3 py-1 rounded-full border border-blue-600/30">
          {userStats?.balance?.toFixed(4) || "0.0000"} TON
        </div>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 text-center space-y-8 bg-[#1a1a1a] border-none shadow-2xl rounded-3xl">
          <div className="space-y-2">
            <h2 className="text-3xl font-extrabold tracking-tight">Viewing ads</h2>
            <p className="text-gray-400 text-lg">Get PAD for watching commercials</p>
          </div>

          <Button 
            onClick={handleWatchAd} 
            size="lg" 
            className="w-full text-xl h-16 font-bold bg-blue-600 hover:bg-blue-700 rounded-2xl shadow-lg transition-all active:scale-95 flex items-center justify-center gap-3"
          >
            <Play className="w-6 h-6 fill-current" />
            Start Watching
          </Button>

          <div className="pt-2">
            <p className="text-gray-400 text-lg font-medium">
              Watched: <span className="text-white">{userStats?.dailyAdsCount || 0}/50</span>
            </p>
          </div>
        </Card>
      </main>

      <footer className="p-6 text-center text-gray-500 border-t border-gray-800 bg-[#0a0a0a]">
        <div className="flex items-center justify-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4 text-green-500" />
          <span>Secured by Anti-Fraud System</span>
        </div>
      </footer>
    </div>
  );
}
