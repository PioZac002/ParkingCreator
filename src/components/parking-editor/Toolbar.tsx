"use client";

import { useEditorStore, type Tool, type SpotType } from "./store";

type ToolDef = { tool: Tool; icon: string; label: string };

const tools: ToolDef[] = [
  { tool: "select", icon: "↖️", label: "Zaznacz" },
  { tool: "spot", icon: "🚗", label: "Dodaj miejsce" },
  { tool: "road", icon: "🛣️", label: "Droga" },
  { tool: "wall", icon: "🧱", label: "Ściana" },
  { tool: "pillar", icon: "⬛", label: "Słup" },
  { tool: "delete", icon: "🗑️", label: "Usuń" },
];

const spotTypes: { type: SpotType; icon: string; label: string }[] = [
  { type: "STANDARD", icon: "🚗", label: "Standardowe" },
  { type: "DISABLED", icon: "♿", label: "Dla niepełnosprawnych" },
  { type: "ELECTRIC", icon: "⚡", label: "Elektryczne" },
  { type: "RESERVED", icon: "🔒", label: "Zarezerwowane" },
];

export function EditorToolbar({
  onSave,
  onUndo,
  onRedo,
  saving,
  canUndo,
  canRedo,
}: {
  onSave: () => void;
  onUndo: () => void;
  onRedo: () => void;
  saving: boolean;
  canUndo: boolean;
  canRedo: boolean;
}) {
  const { activeTool, setTool, selectedId, spots, changeSpotType, rotateSpot, deleteSelected, renumberSpots, spotPrefix, setSpotPrefix, cellSize, setCellSize, isDirty } = useEditorStore();
  const selectedSpot = spots.find((s) => s.id === selectedId);

  return (
    <div
      style={{
        width: "220px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflowY: "auto",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Kreator parkingu</span>
          {isDirty && <span style={{ fontSize: "0.6875rem", color: "var(--warning)" }}>● Niezapisane</span>}
        </div>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: "0.75rem" }} onClick={onUndo} disabled={!canUndo} title="Cofnij (Ctrl+Z)">↩ Cofnij</button>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: "0.75rem" }} onClick={onRedo} disabled={!canRedo} title="Ponów (Ctrl+Y)">↪ Ponów</button>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }} onClick={onSave} disabled={saving || !isDirty}>
          {saving ? "Zapisywanie..." : "💾 Zapisz layout"}
        </button>
      </div>

      {/* Tools */}
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Narzędzia</p>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0.375rem" }}>
          {tools.map(({ tool, icon, label }) => (
            <button
              key={tool}
              onClick={() => setTool(tool)}
              className={`btn btn-sm ${activeTool === tool ? "btn-primary" : "btn-secondary"}`}
              style={{ justifyContent: "flex-start", gap: "0.375rem", fontSize: "0.75rem", padding: "0.5rem 0.75rem" }}
              title={label}
            >
              <span>{icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prefix */}
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Prefiks numeracji</p>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <input
            className="input"
            style={{ flex: 1, padding: "0.4rem 0.6rem", fontSize: "0.875rem" }}
            value={spotPrefix}
            onChange={(e) => setSpotPrefix(e.target.value.toUpperCase().slice(0, 3))}
            placeholder="A"
          />
          <button className="btn btn-secondary btn-sm" onClick={renumberSpots} title="Przenumeruj wszystkie miejsca">
            #
          </button>
        </div>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", marginTop: "0.375rem" }}>
          Następne: {spotPrefix}-{String(spots.filter((s) => s.number.startsWith(spotPrefix + "-")).length + 1).padStart(2, "0")}
        </p>
      </div>

      {/* Zoom */}
      <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }}>
        <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>Zoom ({cellSize}px)</p>
        <input
          type="range"
          min={16}
          max={64}
          step={4}
          value={cellSize}
          onChange={(e) => setCellSize(Number(e.target.value))}
          style={{ width: "100%", accentColor: "var(--accent-primary)" }}
        />
      </div>

      {/* Selected spot properties */}
      {selectedSpot && (
        <div style={{ padding: "0.75rem 1rem", borderBottom: "1px solid var(--border-color)" }} className="animate-fade-in">
          <p style={{ fontSize: "0.6875rem", color: "var(--text-muted)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
            Zaznaczone: {selectedSpot.number}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.5rem" }}>
            {spotTypes.map(({ type, icon, label }) => (
              <button
                key={type}
                className={`btn btn-sm ${selectedSpot.type === type ? "btn-primary" : "btn-secondary"}`}
                style={{ justifyContent: "flex-start", gap: "0.5rem", fontSize: "0.75rem" }}
                onClick={() => changeSpotType(selectedSpot.id, type)}
              >
                <span>{icon}</span> {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: "0.75rem" }} onClick={() => rotateSpot(selectedSpot.id)}>
              🔄 {selectedSpot.rotation}°
            </button>
            <button className="btn btn-sm" style={{ color: "var(--danger)", background: "rgba(225,112,85,0.1)", border: "1px solid rgba(225,112,85,0.3)", fontSize: "0.75rem" }} onClick={deleteSelected}>
              🗑️
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: "0.75rem 1rem", marginTop: "auto" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
          📍 {spots.length} miejsc
        </p>
      </div>
    </div>
  );
}
