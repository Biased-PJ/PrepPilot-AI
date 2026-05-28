import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageHeader } from "@/components/dashboard/StatCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authApi } from "@/lib/api";
import { toast } from "sonner";
import { useAuth } from "@/lib/auth";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/_authenticated/settings")({
  component: SettingsPage,
  head: () => ({ meta: [{ title: "Settings — PrepPilot AI" }] }),
});

function SettingsPage() {
  const { user, logout } = useAuth();
  const [oldPw, setOldPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [loading, setLoading] = useState(false);
  const [notif, setNotif] = useState(true);

  const changePw = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const r = await authApi.updatePassword(oldPw, newPw);
      if (r.success) { toast.success("Password updated"); setOldPw(""); setNewPw(""); }
      else toast.error(r.message || "Failed");
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Failed");
    } finally { setLoading(false); }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <PageHeader title="Settings" subtitle="Manage your account and preferences." />

      <div className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Account</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Name</Label>
            <Input value={user?.name || ""} readOnly className="mt-1.5 bg-card/40" />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={user?.email || ""} readOnly className="mt-1.5 bg-card/40" />
          </div>
        </div>
      </div>

      <form onSubmit={changePw} className="glass rounded-2xl p-5">
        <h3 className="font-semibold mb-4">Change Password</h3>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <Label>Current password</Label>
            <Input type="password" required value={oldPw} onChange={(e) => setOldPw(e.target.value)} className="mt-1.5 bg-card/40" />
          </div>
          <div>
            <Label>New password</Label>
            <Input type="password" required minLength={6} value={newPw} onChange={(e) => setNewPw(e.target.value)} className="mt-1.5 bg-card/40" />
          </div>
        </div>
        <Button type="submit" disabled={loading} className="mt-4 bg-primary text-primary-foreground hover:opacity-90">
          {loading ? "Updating…" : "Update password"}
        </Button>
      </form>

      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold">Email notifications</h3>
          <p className="text-sm text-muted-foreground">Daily challenge & weekly digests.</p>
        </div>
        <Switch checked={notif} onCheckedChange={setNotif} />
      </div>

      <div className="glass rounded-2xl p-5 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-destructive">Sign out</h3>
          <p className="text-sm text-muted-foreground">End your session on this device.</p>
        </div>
        <Button variant="destructive" onClick={logout}>Sign out</Button>
      </div>
    </div>
  );
}