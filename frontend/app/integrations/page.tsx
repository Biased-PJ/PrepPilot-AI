"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Loader, CheckCircle2, Unplug, AlertCircle } from "lucide-react";
import { platformAPI } from "@/lib/api"; // Fixed: Using singular platformAPI

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
  const [verificationCode, setVerificationCode] = useState<{
    [key: string]: string;
  }>({});
  const [verifying, setVerifying] = useState<string | null>(null);

  // 1. Fetch connected accounts on component mount
  useEffect(() => {
    async function loadStats() {
      for (const p of platforms) {
        try {
          const res = await platformAPI.getStats(p.id);
          if (res.data && res.data.success) {
            setConnected((prev) => [...prev, p.id]);
            setUsernames((prev) => ({
              ...prev,
              [p.id]: res.data.username || "Connected",
            }));
          }
        } catch (err) {
          // Silent catch: user just doesn't have this platform linked yet
        }
      }
    }
    loadStats();
  }, []);

  // 2. Fire Connect Request (Step 1)
  const handleConnect = async (id: string) => {
    const handleValue = usernames[id as keyof typeof usernames];
    if (!handleValue) return;

    setConnecting(id);
    setError("");

    try {
      const response = await platformAPI.connect(id, handleValue);
      if (response.data?.verification_code) {
        // Save the verification text to show the user
        setVerificationCode((prev) => ({
          ...prev,
          [id]: response.data.verification_code,
        }));
      } else {
        // If no verification step required (e.g. Codeforces), instantly sync
        setConnected((prev) => [...prev, id]);
      }
    } catch (err: any) {
      setError(err.response?.data?.error || `Failed to initiate ${id} link.`);
    } finally {
      setConnecting(null);
    }
  };

  // 3. Fire Verify Verification Code (Step 2 - for LeetCode bio checks)
  const handleVerifyCode = async (id: string) => {
    setVerifying(id);
    setError("");
    try {
      const response = await platformAPI.verify(id);
      if (response.data?.success) {
        setConnected((prev) => [...prev, id]);
        setVerificationCode((prev) => ({ ...prev, [id]: "" }));
      }
    } catch (err: any) {
      setError(
        err.response?.data?.error ||
          "Verification failed. Double check your profile bio.",
      );
    } finally {
      setVerifying(null);
    }
  };

  // 4. Fire Disconnect Request
  const handleDisconnect = async (id: string) => {
    setError("");
    try {
      await platformAPI.disconnect(id);
      setConnected(connected.filter((x) => x !== id));
      setUsernames((prev) => ({ ...prev, [id]: "" }));
      setVerificationCode((prev) => ({ ...prev, [id]: "" }));
    } catch (err: any) {
      setError(err.response?.data?.error || "Failed to safely disconnect.");
    }
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
          const isChecking = verifying === p.id;
          const vCode = verificationCode[p.id];

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
                <div className="mb-4 p-2.5 rounded-lg bg-emerald-500/8 border border-emerald-500/15 text-[12px] text-emerald-400/80 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5" /> @
                  {usernames[p.id as keyof typeof usernames]}
                </div>
              ) : vCode ? (
                <div className="mb-4 p-3 rounded-lg bg-orange-500/5 border border-orange-500/10 space-y-2.5">
                  <p className="text-[11px] text-orange-300/80 leading-normal">
                    Paste this code into your profile bio text, then click
                    Verify:
                  </p>
                  <div className="bg-black/40 border border-white/5 p-2 rounded text-[11px] font-mono text-white text-center select-all">
                    {vCode}
                  </div>
                  <Button
                    size="sm"
                    onClick={() => handleVerifyCode(p.id)}
                    disabled={isChecking}
                    className="w-full bg-orange-500 text-white text-[12px] h-7"
                  >
                    {isChecking ? (
                      <Loader className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      "Confirm Bio Verification"
                    )}
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
                  !vCode && (
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
                      )}{" "}
                      {isBusy ? "Verifying profile..." : "Connect"}
                    </Button>
                  )
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
