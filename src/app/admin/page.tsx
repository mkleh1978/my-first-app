"use client";

import { useState, useCallback } from "react";
import { useAuth } from "@/lib/auth-context";
import Header from "@/components/Header";
import { parseContactsXlsx, importContacts, ImportResult } from "@/lib/import-contacts";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, ChevronDown, ChevronUp } from "lucide-react";

type ImportState = "idle" | "parsed" | "importing" | "done" | "error";

export default function AdminPage() {
  const { isAdmin, loading } = useAuth();
  const [file, setFile] = useState<File | null>(null);
  const [rowCount, setRowCount] = useState(0);
  const [state, setState] = useState<ImportState>("idle");
  const [progress, setProgress] = useState({ current: 0, total: 0 });
  const [result, setResult] = useState<ImportResult | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [showUnmatched, setShowUnmatched] = useState(false);

  const handleFile = useCallback(async (f: File) => {
    setFile(f);
    setResult(null);
    setErrorMsg("");
    setState("idle");

    try {
      const buffer = await f.arrayBuffer();
      const contacts = parseContactsXlsx(buffer);
      setRowCount(contacts.length);
      setState("parsed");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Fehler beim Parsen der Datei.");
      setState("error");
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const f = e.dataTransfer.files[0];
      if (f && (f.name.endsWith(".xlsx") || f.name.endsWith(".xls"))) {
        handleFile(f);
      }
    },
    [handleFile]
  );

  const handleImport = async () => {
    if (!file) return;
    setState("importing");
    setProgress({ current: 0, total: 0 });

    try {
      const buffer = await file.arrayBuffer();
      const contacts = parseContactsXlsx(buffer);
      const importResult = await importContacts(contacts, (current, total) => {
        setProgress({ current, total });
      });
      setResult(importResult);
      setState("done");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Fehler beim Import.");
      setState("error");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <div className="text-center text-muted">Laden...</div>
        </main>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <main className="mx-auto max-w-3xl px-6 py-12">
          <div className="text-center">
            <AlertCircle className="mx-auto mb-4 h-12 w-12 text-red-400" />
            <h2 className="text-xl font-bold text-foreground">Zugriff verweigert</h2>
            <p className="mt-2 text-sm text-muted">
              Diese Seite ist nur für Administratoren zugänglich.
            </p>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <main className="mx-auto max-w-3xl px-6 py-6">
        <h2 className="text-2xl font-bold text-foreground">Admin: LinkedIn Import</h2>
        <p className="mt-1 text-sm text-muted">
          Lade eine XLSX-Datei mit LinkedIn-Kontaktdaten hoch. Die Daten werden per Domain-Matching den Unternehmen zugeordnet.
        </p>

        {/* Upload Area */}
        <div
          onDragOver={(e) => e.preventDefault()}
          onDrop={handleDrop}
          className="mt-6 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-border p-10 transition-colors hover:border-teal/50"
        >
          <Upload className="mb-3 h-10 w-10 text-muted" />
          <p className="text-sm text-muted">
            Datei hierher ziehen oder{" "}
            <label className="cursor-pointer font-medium text-teal hover:underline">
              Datei auswählen
              <input
                type="file"
                accept=".xlsx,.xls"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) handleFile(f);
                }}
              />
            </label>
          </p>
          <p className="mt-1 text-xs text-muted">Nur .xlsx oder .xls Dateien (max. 5 MB)</p>
        </div>

        {/* File Info */}
        {file && state !== "error" && (
          <div className="mt-4 flex items-center gap-3 rounded-lg border border-border bg-surface p-4">
            <FileSpreadsheet className="h-8 w-8 text-teal" />
            <div className="flex-1">
              <div className="text-sm font-medium text-foreground">{file.name}</div>
              <div className="text-xs text-muted">
                {(file.size / 1024).toFixed(0)} KB &middot; {rowCount.toLocaleString()} eindeutige Domains
              </div>
            </div>
            {state === "parsed" && (
              <button
                onClick={handleImport}
                className="rounded-lg bg-teal px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-teal-light"
              >
                Import starten
              </button>
            )}
          </div>
        )}

        {/* Progress */}
        {state === "importing" && (
          <div className="mt-4 rounded-lg border border-border bg-surface p-4">
            <div className="mb-2 flex items-center justify-between text-sm">
              <span className="text-muted">Importiere...</span>
              <span className="font-mono text-foreground">
                {progress.current.toLocaleString()} / {progress.total.toLocaleString()}
              </span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-border">
              <div
                className="h-full rounded-full bg-teal transition-all"
                style={{
                  width: progress.total > 0 ? `${(progress.current / progress.total) * 100}%` : "0%",
                }}
              />
            </div>
          </div>
        )}

        {/* Result */}
        {state === "done" && result && (
          <div className="mt-4 space-y-3">
            <div className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-4">
              <CheckCircle2 className="h-5 w-5 text-emerald-500" />
              <span className="text-sm font-medium text-foreground">Import abgeschlossen!</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="rounded-lg border border-border bg-surface p-3 text-center">
                <div className="text-2xl font-bold text-teal">{result.matched}</div>
                <div className="text-xs text-muted">Gematcht</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3 text-center">
                <div className="text-2xl font-bold text-foreground">{result.updated}</div>
                <div className="text-xs text-muted">Aktualisiert</div>
              </div>
              <div className="rounded-lg border border-border bg-surface p-3 text-center">
                <div className="text-2xl font-bold text-orange">{result.notFound.length}</div>
                <div className="text-xs text-muted">Nicht gefunden</div>
              </div>
            </div>

            {result.notFound.length > 0 && (
              <div className="rounded-lg border border-border bg-surface">
                <button
                  onClick={() => setShowUnmatched(!showUnmatched)}
                  className="flex w-full items-center justify-between p-3 text-sm font-medium text-foreground"
                >
                  <span>Nicht-gematchte Domains ({result.notFound.length})</span>
                  {showUnmatched ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {showUnmatched && (
                  <div className="max-h-60 overflow-y-auto border-t border-border px-3 py-2">
                    {result.notFound.map((domain) => (
                      <div key={domain} className="py-0.5 text-xs text-muted">
                        {domain}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {result.errors.length > 0 && (
              <div className="rounded-lg border border-red-500/30 bg-red-500/10 p-3">
                <div className="text-sm font-medium text-red-400">
                  {result.errors.length} Fehler beim Update
                </div>
                <div className="mt-1 max-h-40 overflow-y-auto text-xs text-red-300">
                  {result.errors.map((e, i) => (
                    <div key={i}>{e}</div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Error */}
        {state === "error" && (
          <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/10 p-4">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <span className="text-sm text-red-300">{errorMsg}</span>
          </div>
        )}
      </main>
    </div>
  );
}
