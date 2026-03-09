"use client";

import { useState, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { parseFile } from "@/lib/parsers/fileParser";
import type { ParsedUser } from "@/lib/parsers/fileParser";

type ManagedEstate = { id: string; name: string };
type Step = "upload" | "map" | "preview" | "done";

const ACCEPTED = ".csv,.xlsx,.xls,.txt,.json";

export function ImportPageClient({
  managedEstates,
  activeEstateId: initialEstateId,
}: {
  managedEstates: ManagedEstate[];
  activeEstateId: string | null;
}) {
  const router = useRouter();
  const [activeEstateId, setActiveEstateId] = useState(initialEstateId ?? "");
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [emailCol, setEmailCol] = useState("");
  const [nameCol, setNameCol] = useState("");
  const [users, setUsers] = useState<ParsedUser[]>([]);
  const [importResult, setImportResult] = useState<{
    success: number;
    skipped: number;
    errors: { email: string; reason: string }[];
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.import.importUsers.useMutation({
    onSuccess: (result) => { setImportResult(result); setStep("done"); },
    onError: (err) => setParseError(err.message),
  });

  const processFile = useCallback(async (file: File) => {
    setParseError("");
    setParsing(true);
    setFileName(file.name);
    try {
      const result = await parseFile(file);
      if (result.errors.length > 0 && result.users.length === 0) {
        setParseError(result.errors.join(", "));
        return;
      }
      if (result.users.length > 0) {
        setUsers(result.users);
        setStep("preview");
      } else if (result.columns && result.columns.length > 0) {
        setColumns(result.columns);
        setRawRows(result.rawRows ?? []);
        setStep("map");
      } else {
        setParseError("Nie udało się przetworzyć pliku.");
      }
    } catch { setParseError("Błąd podczas parsowania"); }
    finally { setParsing(false); }
  }, []);

  const reset = () => {
    setStep("upload");
    setUsers([]);
    setColumns([]);
    setRawRows([]);
    setEmailCol("");
    setNameCol("");
    setFileName("");
    setParseError("");
    setImportResult(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const applyMapping = () => {
    if (!emailCol) return;
    setUsers(rawRows.filter((r) => r[emailCol]?.includes("@")).map((r) => ({
      email: r[emailCol].trim().toLowerCase(),
      name: nameCol ? r[nameCol]?.trim() ?? "" : r[emailCol].split("@")[0],
    })));
    setStep("preview");
  };

  // Need estate selected before import
  if (!activeEstateId && managedEstates.length > 1) {
    return (
      <div className="page-container" style={{ maxWidth: "600px" }}>
        <div className="page-header">
          <h1 className="page-title gradient-text">Import mieszkańców</h1>
        </div>
        <div className="card">
          <h3 style={{ fontWeight: 600, marginBottom: "1rem" }}>Wybierz osiedle</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
            {managedEstates.map((e) => (
              <button
                key={e.id}
                className="btn btn-secondary"
                style={{ justifyContent: "flex-start" }}
                onClick={() => {
                  setActiveEstateId(e.id);
                  router.push(`/manager/import?estateId=${e.id}`);
                }}
              >
                🏘️ {e.name}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  const activeEstate = managedEstates.find((e) => e.id === activeEstateId);

  return (
    <div className="page-container" style={{ maxWidth: "800px" }}>
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title gradient-text">Import mieszkańców</h1>
          {activeEstate && <p className="page-subtitle">Osiedle: <strong>{activeEstate.name}</strong></p>}
        </div>
        {managedEstates.length > 1 && (
          <select
            className="input"
            style={{ width: "auto" }}
            value={activeEstateId}
            onChange={(e) => {
              setActiveEstateId(e.target.value);
              router.push(`/manager/import?estateId=${e.target.value}`);
              reset();
            }}
          >
            {managedEstates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", alignItems: "center" }}>
        {(["upload", "preview", "done"] as const).map((s, i) => {
          const labels = ["Plik", "Podgląd", "Gotowe"];
          const order = ["upload", "map", "preview", "done"];
          const isDone = order.indexOf(step) > order.indexOf(s);
          const isCurrent = step === s || (s === "preview" && step === "map");
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {i > 0 && <div style={{ width: "2rem", height: "1px", background: isDone ? "var(--accent-primary)" : "var(--border-color)" }} />}
              <div style={{ width: "28px", height: "28px", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "0.75rem", fontWeight: 700, background: isCurrent ? "var(--accent-gradient)" : isDone ? "var(--success)" : "var(--bg-card)", border: isCurrent || isDone ? "none" : "1px solid var(--border-color)", color: isCurrent || isDone ? "white" : "var(--text-muted)" }}>
                {isDone ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.8125rem", color: isCurrent ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isCurrent ? 600 : 400 }}>{labels[i]}</span>
            </div>
          );
        })}
      </div>

      {/* Step 1: Upload */}
      {step === "upload" && (
        <div className="animate-fade-in">
          <div
            onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
            onDragLeave={() => setIsDragging(false)}
            onDrop={(e) => { e.preventDefault(); setIsDragging(false); const f = e.dataTransfer.files[0]; if (f) processFile(f); }}
            onClick={() => fileInputRef.current?.click()}
            style={{ border: `2px dashed ${isDragging ? "var(--accent-primary)" : "var(--border-color)"}`, borderRadius: "var(--radius-lg)", padding: "4rem 2rem", textAlign: "center", cursor: "pointer", background: isDragging ? "rgba(108,92,231,0.05)" : "var(--bg-secondary)", transition: "all 0.2s ease" }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>{parsing ? "Przetwarzanie..." : "Przeciągnij plik lub kliknij"}</p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>CSV, XLSX, XLS, TXT, JSON</p>
            <input ref={fileInputRef} type="file" accept={ACCEPTED} onChange={(e) => { const f = e.target.files?.[0]; if (f) processFile(f); }} style={{ display: "none" }} />
          </div>
          {parseError && <p style={{ color: "var(--danger)", marginTop: "1rem", fontSize: "0.875rem" }}>⚠️ {parseError}</p>}
        </div>
      )}

      {/* Step 2: Column mapping */}
      {step === "map" && (
        <div className="card animate-fade-in">
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Mapowanie kolumn</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Plik <strong>{fileName}</strong> · {rawRows.length} wierszy
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label className="label">Kolumna Email *</label>
              <select className="input" value={emailCol} onChange={(e) => setEmailCol(e.target.value)}>
                <option value="">-- wybierz --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Kolumna Imię i Nazwisko</label>
              <select className="input" value={nameCol} onChange={(e) => setNameCol(e.target.value)}>
                <option value="">-- opcjonalne --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" onClick={applyMapping} disabled={!emailCol}>Zatwierdź →</button>
            <button className="btn btn-ghost" onClick={reset}>Wróć</button>
          </div>
        </div>
      )}

      {/* Step 3: Preview */}
      {step === "preview" && (
        <div className="animate-fade-in">
          <div className="card" style={{ marginBottom: "1.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
              <div>
                <h3 style={{ fontWeight: 600 }}>Podgląd importu</h3>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>{users.length} użytkowników</p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={reset}>✕</button>
            </div>
            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr>
                    {["#", "Imię i nazwisko", "Email"].map((h) => (
                      <th key={h} style={{ textAlign: "left", padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {users.map((u, i) => (
                    <tr key={i} style={{ borderBottom: "1px solid var(--border-light)" }}>
                      <td style={{ padding: "0.5rem 0.75rem", color: "var(--text-muted)" }}>{i + 1}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{u.name || <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                      <td style={{ padding: "0.5rem 0.75rem" }}>{u.email}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          {parseError && <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>⚠️ {parseError}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary btn-lg" onClick={() => importMutation.mutate({ users, estateId: activeEstateId })} disabled={importMutation.isPending || !activeEstateId}>
              {importMutation.isPending ? "Importowanie..." : `Importuj ${users.length} użytkowników`}
            </button>
            <button className="btn btn-ghost" onClick={reset}>Wróć</button>
          </div>
        </div>
      )}

      {/* Step 4: Done */}
      {step === "done" && importResult && (
        <div className="card animate-fade-in" style={{ textAlign: "center", padding: "3rem" }}>
          <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>🎉</div>
          <h2 style={{ fontWeight: 700, marginBottom: "1.5rem" }}>Import zakończony!</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "2rem" }}>
            <div className="card-stat"><div className="stat-value" style={{ color: "var(--success)" }}>{importResult.success}</div><div className="stat-label">Zaimportowanych</div></div>
            <div className="card-stat"><div className="stat-value" style={{ color: "var(--warning)" }}>{importResult.skipped}</div><div className="stat-label">Pominięto</div></div>
            <div className="card-stat"><div className="stat-value" style={{ color: "var(--danger)" }}>{importResult.errors.length}</div><div className="stat-label">Błędy</div></div>
          </div>
          {importResult.errors.slice(0, 5).map((e, i) => (
            <div key={i} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
              <span style={{ color: "var(--danger)" }}>{e.email}</span> — {e.reason}
            </div>
          ))}
          <button className="btn btn-primary" style={{ marginTop: "1.5rem" }} onClick={reset}>Importuj kolejny plik</button>
        </div>
      )}
    </div>
  );
}
