"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Download, Upload, Trash2, Check, AlertTriangle, Database } from "lucide-react";
import { useAppStore } from "@/store/app-store";
import { GlassCard } from "@/components/ui/GlassCard";
import { Button } from "@/components/ui/Button";
import { buildExport, parseImport } from "@/lib/data/portability";

type Msg = { kind: "ok" | "err"; text: string } | null;

/**
 * Data & privacy controls: export the library to a JSON backup, import one
 * back, and clear all local data. Operates entirely on the local store, so it
 * works with or without Supabase.
 */
export function SettingsPanel() {
  const router = useRouter();
  const hydrateFromServer = useAppStore((s) => s.hydrateFromServer);
  const setDevice = useAppStore((s) => s.setDevice);
  const setTier = useAppStore((s) => s.setTier);
  const resetAll = useAppStore((s) => s.resetAll);

  const fileRef = useRef<HTMLInputElement>(null);
  const [msg, setMsg] = useState<Msg>(null);
  const [confirmClear, setConfirmClear] = useState(false);

  function exportData() {
    const s = useAppStore.getState();
    const payload = buildExport(s);
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallpaperforge-backup-${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    setMsg({ kind: "ok", text: "Backup downloaded." });
  }

  async function importData(file: File) {
    try {
      const data = parseImport(await file.text());
      hydrateFromServer({
        wallpapers: data.wallpapers,
        favoriteIds: data.favoriteIds,
        collections: data.collections,
      });
      if (data.device) setDevice(data.device);
      setTier(data.tier);
      setMsg({
        kind: "ok",
        text: `Imported ${data.wallpapers.length} wallpaper${data.wallpapers.length === 1 ? "" : "s"}.`,
      });
    } catch (err) {
      setMsg({ kind: "err", text: err instanceof Error ? err.message : "Import failed." });
    }
  }

  function clearData() {
    resetAll();
    router.replace("/onboarding");
  }

  return (
    <section>
      <h2 className="mb-3 flex items-center gap-2 text-sm font-semibold text-white/70">
        <Database className="h-4 w-4" /> Data &amp; privacy
      </h2>
      <GlassCard className="space-y-3 p-4">
        <p className="text-sm text-white/55">
          Your library lives on this device (and syncs to your account when signed
          in). Back it up, restore it, or wipe it here.
        </p>

        <div className="grid grid-cols-2 gap-2">
          <Button variant="secondary" onClick={exportData}>
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button variant="secondary" onClick={() => fileRef.current?.click()}>
            <Upload className="h-4 w-4" /> Import
          </Button>
        </div>

        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void importData(f);
            e.target.value = "";
          }}
        />

        {msg && (
          <p
            className={`flex items-center gap-1.5 text-xs ${
              msg.kind === "ok" ? "text-emerald-300" : "text-rose-300"
            }`}
          >
            {msg.kind === "ok" ? <Check className="h-3.5 w-3.5" /> : <AlertTriangle className="h-3.5 w-3.5" />}
            {msg.text}
          </p>
        )}

        <div className="border-t border-white/10 pt-3">
          {confirmClear ? (
            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                className="flex-1"
                onClick={() => setConfirmClear(false)}
              >
                Cancel
              </Button>
              <Button
                className="flex-1 !bg-gradient-to-br !from-rose-500 !to-orange-500"
                onClick={clearData}
              >
                <Trash2 className="h-4 w-4" /> Erase everything
              </Button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmClear(true)}
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-2.5 text-sm font-semibold text-rose-200 hover:bg-rose-500/15"
            >
              <Trash2 className="h-4 w-4" /> Clear all local data
            </button>
          )}
        </div>
      </GlassCard>
    </section>
  );
}
