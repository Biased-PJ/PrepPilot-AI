"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, CheckCircle2, Unplug, AlertCircle } from "lucide-react";
import { platformAPI } from "@/lib/api";

const platforms = [
  {
    id: "leetcode",
    name: "LeetCode",
    desc: "Track problems, contests & ratings",
    icon: "LC",
    gradient: "from-orange-500/8 to-orange-500/3",
    border: "border-orange-500/20",
    text: "text-orange-400",
    badge: "bg-orange-500",
  },
  {
    id: "codeforces",
    name: "Codeforces",
    desc: "Sync contest performance & rating",
    icon: "CF",
    gradient: "from-blue-500/8 to-blue-500/3",
    border: "border-blue-500/20",
    text: "text-blue-400",
    badge: "bg-blue-500",
  },
  {
    id: "codechef",
    name: "CodeChef",
    desc: "Connect challenge & practice data",
    icon: "CC",
    gradient: "from-amber-500/8 to-amber-500/3",
    border: "border-amber-500/20",
    text: "text-amber-400",
    badge: "bg-amber-500",
  },
];

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: i * 0.05,
      ease: [0.25, 0.4, 0.25, 1] as const,
    },
  }),
};

export default function IntegrationsPage() {
  const [connecting, setConnecting] = useState<string | null>(null);
  const [connected, setConnected] = useState<string[]>([]);
  const [usernames, setUsernames] = useState({
    leetcode: "",
    codeforces: "",
    codechef: "",
  });
  const [error, setError] = useState<string>("");
  const [syncing, setSyncing] = useState<string | null>(null);

  // 1. Initial status loading via platform sync or checks if any exist
  useEffect(() => {
    // Left empty or fallback state to avoid crashes if API contract properties aren't completely built out yet
  }, []);

  // 2. Fire Connect Request mapping to explicit endpoints found in your api.ts
  const handleConnect = async (id: string) => {
    const handleValue = usernames[id as keyof typeof usernames];
    if (!handleValue) return;

    setConnecting(id);
    setError("");

    try {
      let response;
      if (id === "leetcode") {
        response = await platformAPI.connectLeetCode(handleValue);
      } else if (id === "codeforces") {
        response = await platformAPI.connectCodeforces(handleValue);
      } else {
        // Fallback for codechef or dynamic routing if sync method is generic
        response = await platformAPI.syncPlatform(id);
      }

      if (response && (response.data?.success || response.status === 200)) {
        setConnected((prev) => [...prev, id]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to connect to ${id}.`);
    } finally {
      setConnecting(null);
    }
  };

  // 3. Force Sync data updates
  const handleSyncNow = async (id: string) => {
    setSyncing(id);
    setError("");
    try {
      await platformAPI.syncPlatform(id);
    } catch (err: any) {
      setError(err.response?.data?.error || "Sync execution run failed.");
    } finally {
      setSyncing(null);
    }
  };

  // 4. Fire Disconnect Request
  const handleDisconnect = (id: string) => {
    setConnected(connected.filter((x) => x !== id));
    setUsernames((prev) => ({ ...prev, [id]: "" }));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <motion.div
        custom={0}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
      >
        <h1 className="text-2xl font-bold tracking-tight">Integrations</h1>
        <p className="text-[14px] text-white/40 mt-1">
          Connect your coding platforms
        </p>
      </motion.div>

      {error && (
        <div className="bg-red-500/10 border border-red-500/20 text-red-400 text-[13px] rounded-xl p-4 flex items-center gap-2.5">
          <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {platforms.map((p, i) => {
          const isOn = connected.includes(p.id);
          const isBusy = connecting === p.id;
          const isSyncingNow = syncing === p.id;

          return (
            <motion.div
              key={p.id}
              custom={i + 1}
              variants={fadeUp}
              initial="hidden"
              animate="visible"
              className={`rounded-xl bg-gradient-to-br ${p.gradient} border ${p.border} p-5 transition-all ${isOn ? "ring-1 ring-emerald-500/30" : ""}`}
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className={`w-10 h-10 rounded-lg ${p.badge}/20 flex items-center justify-center text-[13px] font-bold ${p.text}`}
                >
                  {p.icon}
                </div>
                {isOn && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
              </div>
              <h3 className="text-[15px] font-semibold mb-1">{p.name}</h3>
              <p className="text-[13px] text-white/35 mb-5">{p.desc}</p>

              {isOn ? (
                <div className="mb-4 space-y-2">
                  <div className="p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[12px] text-emerald-400/80 flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Connected Account
                  </div>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => handleSyncNow(p.id)}
                    disabled={isSyncingNow}
                    className="w-full text-white/60 hover:text-white text-[11px] h-6"
                  >
                    {isSyncingNow ? "Syncing data..." : "🔄 Sync Stats Now"}
                  </Button>
                </div>
              ) : (
                <div className="mb-4">
                  <Input
                    placeholder={`${p.name} username`}
                    value={usernames[p.id as keyof typeof usernames] || ""}
                    onChange={(e) =>
                      setUsernames((prev) => ({
                        ...prev,
                        [p.id]: e.target.value,
                      }))
                    }
                    disabled={isBusy}
                    className="bg-white/[0.03] border-white/[0.08] text-white placeholder:text-white/20 h-8 text-[13px] rounded-lg"
                  />
                </div>
              )}

              <div className="flex gap-2">
                {isOn ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleDisconnect(p.id)}
                    className="w-full border-red-500/20 text-red-400/80 hover:bg-red-500/10 h-8 text-[12px]"
                  >
                    <Unplug className="w-3.5 h-3.5 mr-1" /> Disconnect
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => handleConnect(p.id)}
                    disabled={
                      !usernames[p.id as keyof typeof usernames] || isBusy
                    }
                    className={`w-full ${p.badge} hover:opacity-90 text-white h-8 text-[12px]`}
                  >
                    {isBusy && (
                      <Loader className="w-3.5 h-3.5 mr-1 animate-spin" />
                    )}
                    {isBusy ? "Connecting..." : "Connect"}
                  </Button>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>

      <motion.div
        custom={4}
        variants={fadeUp}
        initial="hidden"
        animate="visible"
        className="glass rounded-xl p-5"
      >
        <h3 className="text-[15px] font-semibold mb-4">What we sync</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            "Solved problems",
            "Contest ratings",
            "Difficulty stats",
            "Submission history",
            "Topic coverage",
          ].map((item, i) => (
            <div
              key={i}
              className="text-[12px] text-white/40 flex items-center gap-2 p-2.5 rounded-lg bg-white/[0.02] border border-white/[0.04]"
            >
              <div className="w-1 h-1 rounded-full bg-orange-400/60" /> {item}
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
