import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Loader2, Play, CheckCircle2, XCircle, ShieldCheck } from "lucide-react";

export default function Home() {
  const [, setLocation] = useLocation();
  const [screen, setScreen] = useState<"home" | "loading" | "verification" | "result">("home");
  const [status, setStatus] = useState<"success" | "failed">("success");
  const [verification, setVerification] = useState<{ question: string; options: string[]; answer: string } | null>(null);
  
  const queryParams = new URLSearchParams(window.location.search);
  const userId = queryParams.get("userId");
  const token = queryParams.get("token");
  const deviceId = "device_" + (userId || "unknown"); // Simple mock for fingerprint

  useEffect(() => {
    if (!userId || !token) {
      document.body.innerHTML = "<div style='display:flex;justify-content:center;align-items:center;height:100vh;background:#000;color:#fff;font-family:sans-serif;'>🚫 Unauthorized Access</div>";
    }
  }, [userId, token]);

  const handleWatchAd = () => {
    setScreen("loading");
    setTimeout(() => {
      // Simulate ad play
      setScreen("verification");
      generateVerification();
    }, 2000);
  };

  const generateVerification = () => {
    const emojis = ["🍌", "❤️", "🦍", "⭐", "🍕", "🍎", "🚗", "🏀"];
    const target = emojis[Math.floor(Math.random() * 3)]; // Select from first 3 as targets
    const options = [...emojis].sort(() => Math.random() - 0.5).slice(0, 4);
    if (!options.includes(target)) options[Math.floor(Math.random() * 4)] = target;
    
    setVerification({
      question: `Select ${target}`,
      options,
      answer: target
    });
  };

  const handleVerify = async (selected: string) => {
    const passed = selected === verification?.answer;
    
    if (!passed) {
      setStatus("failed");
      setScreen("result");
      return;
    }

    try {
      const res = await fetch("/api/ads/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, token, deviceId, verificationPassed: true })
      });
      const data = await res.json();
      if (data.success) {
        setStatus("success");
      } else {
        setStatus("failed");
      }
    } catch (e) {
      setStatus("failed");
    }
    setScreen("result");
  };

  if (screen === "loading") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        <Loader2 className="w-12 h-12 animate-spin text-primary mb-4" />
        <h2 className="text-xl font-bold mb-2">Preparing ad...</h2>
        <p className="text-muted-foreground">Please wait...</p>
      </div>
    );
  }

  if (screen === "verification") {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6">
        <Card className="w-full max-w-sm p-6 text-center">
          <h2 className="text-2xl font-bold mb-6">🧠 Human Check</h2>
          <p className="text-lg mb-8">{verification?.question}</p>
          <div className="grid grid-cols-2 gap-4">
            {verification?.options.map((opt) => (
              <Button key={opt} variant="outline" className="text-3xl h-20" onClick={() => handleVerify(opt)}>
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
      <div className="flex flex-col items-center justify-center min-h-screen bg-background p-6 text-center">
        {status === "success" ? (
          <>
            <CheckCircle2 className="w-20 h-20 text-green-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Success!</h2>
            <p className="text-muted-foreground mb-8">Ad completed successfully. Reward will be credited.</p>
          </>
        ) : (
          <>
            <XCircle className="w-20 h-20 text-red-500 mb-4" />
            <h2 className="text-2xl font-bold mb-2">Failed</h2>
            <p className="text-muted-foreground mb-8">Verification failed. Try again later.</p>
          </>
        )}
        <Button onClick={() => setScreen("home")} className="w-full max-w-xs">Return Home</Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-background">
      <header className="p-4 border-b flex justify-between items-center bg-card">
        <h1 className="font-bold text-lg">💰 Earn TON</h1>
      </header>

      <main className="flex-1 flex items-center justify-center p-6">
        <Card className="w-full max-w-sm p-8 text-center space-y-6 shadow-lg border-2">
          <div className="bg-primary/10 w-20 h-20 rounded-full flex items-center justify-center mx-auto">
            <Play className="w-10 h-10 text-primary fill-primary" />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-bold">Watch Ads</h2>
            <p className="text-muted-foreground">Earn TON by watching short video ads</p>
          </div>
          <Button onClick={handleWatchAd} size="lg" className="w-full text-lg h-14 font-bold shadow-md">
            ▶️ Watch Ad
          </Button>
        </Card>
      </main>

      <footer className="p-6 text-center text-muted-foreground border-t bg-card">
        <div className="flex items-center justify-center gap-2 text-sm">
          <ShieldCheck className="w-4 h-4" />
          <span>Secured by Anti-Fraud System</span>
        </div>
      </footer>
    </div>
  );
}
