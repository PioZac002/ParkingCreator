"use client";

import { useState, useRef, useCallback } from "react";
import { trpc } from "@/lib/trpc";
import { parseFile } from "@/lib/parsers/fileParser";
import type { ParsedUser } from "@/lib/parsers/fileParser";

type Step = "upload" | "map" | "preview" | "done";

const ACCEPTED = ".csv,.xlsx,.xls,.txt,.json";

export function ImportPageClient({ estateId }: { estateId: string }) {
  const [step, setStep] = useState<Step>("upload");
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState("");
  const [parsing, setParsing] = useState(false);
  const [parseError, setParseError] = useState("");

  // Column mapping (for CSV/XLSX without auto-detected cols)
  const [columns, setColumns] = useState<string[]>([]);
  const [rawRows, setRawRows] = useState<Record<string, string>[]>([]);
  const [emailCol, setEmailCol] = useState("");
  const [nameCol, setNameCol] = useState("");

  const [users, setUsers] = useState<ParsedUser[]>([]);
  const [importResult, setImportResult] = useState<{ success: number; skipped: number; errors: { email: string; reason: string }[] } | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const importMutation = trpc.import.importUsers.useMutation({
    onSuccess: (result) => {
      setImportResult(result);
      setStep("done");
    },
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
        setParsing(false);
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
        setParseError("Nie udało się przetworzyć pliku. Sprawdź format.");
      }
    } catch (e) {
      setParseError("Błąd podczas parsowania pliku");
      console.error(e);
    } finally {
      setParsing(false);
    }
  }, []);

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const applyMapping = () => {
    if (!emailCol) return;
    const mapped = rawRows
      .filter((r) => r[emailCol]?.includes("@"))
      .map((r) => ({
        email: r[emailCol].trim().toLowerCase(),
        name: nameCol ? r[nameCol]?.trim() ?? "" : r[emailCol].split("@")[0],
      }));
    setUsers(mapped);
    setStep("preview");
  };

  const handleImport = () => {
    if (users.length === 0) return;
    importMutation.mutate({ users, estateId });
  };

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

  return (
    <div className="page-container" style={{ maxWidth: "800px" }}>
      <div className="page-header">
        <h1 className="page-title gradient-text">Import mieszkańców</h1>
        <p className="page-subtitle">Dodaj wielu mieszkańców naraz z pliku</p>
      </div>

      {/* Steps indicator */}
      <div style={{ display: "flex", gap: "0.5rem", marginBottom: "2rem", alignItems: "center" }}>
        {(["upload", "preview", "done"] as const).map((s, i) => {
          const labels = ["Plik", "Podgląd", "Gotowe"];
          const stepOrder = ["upload", "map", "preview", "done"];
          const isDone = stepOrder.indexOf(step) > stepOrder.indexOf(s);
          const isCurrent = step === s || (s === "preview" && step === "map");
          return (
            <div key={s} style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
              {i > 0 && <div style={{ width: "2rem", height: "1px", background: isDone ? "var(--accent-primary)" : "var(--border-color)" }} />}
              <div style={{
                width: "28px", height: "28px", borderRadius: "50%",
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: "0.75rem", fontWeight: 700,
                background: isCurrent ? "var(--accent-gradient)" : isDone ? "var(--success)" : "var(--bg-card)",
                border: isCurrent || isDone ? "none" : "1px solid var(--border-color)",
                color: isCurrent || isDone ? "white" : "var(--text-muted)",
              }}>
                {isDone ? "✓" : i + 1}
              </div>
              <span style={{ fontSize: "0.8125rem", color: isCurrent ? "var(--text-primary)" : "var(--text-muted)", fontWeight: isCurrent ? 600 : 400 }}>
                {labels[i]}
              </span>
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
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            style={{
              border: `2px dashed ${isDragging ? "var(--accent-primary)" : "var(--border-color)"}`,
              borderRadius: "var(--radius-lg)",
              padding: "4rem 2rem",
              textAlign: "center",
              cursor: "pointer",
              background: isDragging ? "rgba(108,92,231,0.05)" : "var(--bg-secondary)",
              transition: "all 0.2s ease",
            }}
          >
            <div style={{ fontSize: "3rem", marginBottom: "1rem" }}>📂</div>
            <p style={{ fontWeight: 600, marginBottom: "0.5rem" }}>
              {parsing ? "Przetwarzanie..." : "Przeciągnij plik lub kliknij aby wybrać"}
            </p>
            <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>
              Obsługiwane formaty: CSV, XLSX, XLS, TXT, JSON
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept={ACCEPTED}
              onChange={handleFileInput}
              style={{ display: "none" }}
            />
          </div>
          {parseError && (
            <p style={{ color: "var(--danger)", marginTop: "1rem", fontSize: "0.875rem" }}>
              ⚠️ {parseError}
            </p>
          )}

          {/* Format guide */}
          <div className="card" style={{ marginTop: "2rem" }}>
            <h3 style={{ fontWeight: 600, marginBottom: "1rem", fontSize: "0.9375rem" }}>Wymagany format pliku</h3>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.75rem" }}>
              {[
                { format: "CSV", example: "email,name\njohn@example.com,Jan Kowalski" },
                { format: "JSON", example: '[{"email":"...", "name":"..."}]' },
                { format: "TXT", example: "john@example.com\njane@example.com" },
                { format: "XLSX", example: "Kolumny: email, name (lub imię/nazwisko)" },
              ].map(({ format, example }) => (
                <div key={format} style={{ background: "var(--bg-secondary)", borderRadius: "var(--radius-sm)", padding: "0.75rem" }}>
                  <div style={{ fontWeight: 600, fontSize: "0.75rem", color: "var(--accent-secondary)", marginBottom: "0.375rem" }}>{format}</div>
                  <pre style={{ fontSize: "0.6875rem", color: "var(--text-secondary)", fontFamily: "monospace", whiteSpace: "pre-wrap" }}>{example}</pre>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Step 2: Column mapping */}
      {step === "map" && (
        <div className="card animate-fade-in">
          <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Mapowanie kolumn</h3>
          <p style={{ fontSize: "0.875rem", color: "var(--text-secondary)", marginBottom: "1.5rem" }}>
            Plik <strong>{fileName}</strong> zawiera {rawRows.length} wierszy. Wskaż które kolumny zawierają email i imię.
          </p>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem", marginBottom: "1.5rem" }}>
            <div>
              <label className="label">Kolumna z Email *</label>
              <select
                className="input"
                value={emailCol}
                onChange={(e) => setEmailCol(e.target.value)}
              >
                <option value="">-- wybierz --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="label">Kolumna z Imieniem</label>
              <select
                className="input"
                value={nameCol}
                onChange={(e) => setNameCol(e.target.value)}
              >
                <option value="">-- opcjonalne --</option>
                {columns.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
          </div>

          {/* Preview of first 3 rows */}
          {rawRows.slice(0, 3).length > 0 && (
            <div style={{ marginBottom: "1.5rem", overflowX: "auto" }}>
              <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Podgląd pierwszych wierszy:</p>
              <table style={{ width: "100%", fontSize: "0.75rem", borderCollapse: "collapse" }}>
                <thead>
                  <tr>
                    {columns.map((c) => (
                      <th key={c} style={{ textAlign: "left", padding: "0.375rem 0.5rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)" }}>
                        {c}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rawRows.slice(0, 3).map((row, i) => (
                    <tr key={i}>
                      {columns.map((c) => (
                        <td key={c} style={{ padding: "0.375rem 0.5rem", borderBottom: "1px solid var(--border-light)" }}>
                          {row[c]}
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button className="btn btn-primary" onClick={applyMapping} disabled={!emailCol}>
              Zatwierdź mapowanie →
            </button>
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
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginTop: "0.25rem" }}>
                  {users.length} użytkowników zostanie zaimportowanych
                </p>
              </div>
              <button className="btn btn-ghost btn-sm" onClick={reset}>✕ Anuluj</button>
            </div>

            <div style={{ maxHeight: "320px", overflowY: "auto" }}>
              <table style={{ width: "100%", fontSize: "0.8125rem", borderCollapse: "collapse" }}>
                <thead style={{ position: "sticky", top: 0 }}>
                  <tr>
                    <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      #
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Imię i nazwisko
                    </th>
                    <th style={{ textAlign: "left", padding: "0.5rem 0.75rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600 }}>
                      Email
                    </th>
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

          {parseError && (
            <p style={{ color: "var(--danger)", marginBottom: "1rem", fontSize: "0.875rem" }}>⚠️ {parseError}</p>
          )}

          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-primary btn-lg"
              onClick={handleImport}
              disabled={importMutation.isPending || users.length === 0}
            >
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
            <div className="card-stat">
              <div className="stat-value" style={{ color: "var(--success)" }}>{importResult.success}</div>
              <div className="stat-label">Zaimportowanych</div>
            </div>
            <div className="card-stat">
              <div className="stat-value" style={{ color: "var(--warning)" }}>{importResult.skipped}</div>
              <div className="stat-label">Pominięto (duplikaty)</div>
            </div>
            <div className="card-stat">
              <div className="stat-value" style={{ color: "var(--danger)" }}>{importResult.errors.length}</div>
              <div className="stat-label">Błędy</div>
            </div>
          </div>

          {importResult.success > 0 && (
            <p style={{ color: "var(--text-secondary)", fontSize: "0.875rem", marginBottom: "1.5rem" }}>
              Konta zostały utworzone w statusie <strong>Oczekujący</strong>.
              Mieszkańcy muszą aktywować swoje konto przez link wysłany na email.
            </p>
          )}

          {importResult.errors.length > 0 && (
            <div style={{ textAlign: "left", marginBottom: "1.5rem" }}>
              <p style={{ fontWeight: 600, fontSize: "0.875rem", color: "var(--danger)", marginBottom: "0.5rem" }}>
                Błędy:
              </p>
              {importResult.errors.slice(0, 10).map((e, i) => (
                <div key={i} style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", padding: "0.25rem 0" }}>
                  <span style={{ color: "var(--danger)" }}>{e.email}</span> — {e.reason}
                </div>
              ))}
            </div>
          )}

          <button className="btn btn-primary" onClick={reset}>
            Importuj kolejny plik
          </button>
        </div>
      )}
    </div>
  );
}
