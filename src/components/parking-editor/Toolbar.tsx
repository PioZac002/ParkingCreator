"use client";

import type { ReactNode } from "react";
import { useEditorStore, type Tool, type SpotType } from "./store";
import {
  CursorIcon, CarIcon, RoadIcon, WallIcon, PillarIcon, TrashIcon,
  WheelchairIcon, ZapIcon, LockIcon,
  UndoIcon, RedoIcon, SaveIcon, RotateCwIcon, MapPinIcon,
} from "@/components/ui/Icons";

type ToolDef = { tool: Tool; icon: ReactNode; label: string };

const tools: ToolDef[] = [
  { tool: "select", icon: <CursorIcon size={14} />, label: "Zaznacz" },
  { tool: "spot", icon: <CarIcon size={14} />, label: "Dodaj miejsce" },
  { tool: "road", icon: <RoadIcon size={14} />, label: "Droga" },
  { tool: "wall", icon: <WallIcon size={14} />, label: "Ściana" },
  { tool: "pillar", icon: <PillarIcon size={14} />, label: "Słup" },
  { tool: "delete", icon: <TrashIcon size={14} />, label: "Usuń" },
];

const spotTypes: { type: SpotType; icon: ReactNode; label: string }[] = [
  { type: "STANDARD", icon: <CarIcon size={13} />, label: "Standardowe" },
  { type: "DISABLED", icon: <WheelchairIcon size={13} />, label: "Dla niepełnosprawnych" },
  { type: "ELECTRIC", icon: <ZapIcon size={13} />, label: "Elektryczne" },
  { type: "RESERVED", icon: <LockIcon size={13} />, label: "Zarezerwowane" },
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
        minWidth: "220px",
        maxWidth: "220px",
        background: "var(--bg-sidebar)",
        borderRight: "1px solid var(--border-color)",
        display: "flex",
        flexDirection: "column",
        gap: 0,
        overflowY: "auto",
        overflowX: "hidden",
      }}
    >
      {/* Header */}
      <div style={{ padding: "1rem 1rem 0.75rem", borderBottom: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "0.75rem" }}>
          <span style={{ fontWeight: 700, fontSize: "0.875rem" }}>Kreator parkingu</span>
          {isDirty && <span style={{ fontSize: "0.6875rem", color: "var(--warning)" }}>● Niezapisane</span>}
        </div>
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: "0.75rem", gap: "0.25rem" }} onClick={onUndo} disabled={!canUndo} title="Cofnij (Ctrl+Z)"><UndoIcon size={13} /> Cofnij</button>
          <button className="btn btn-ghost btn-sm" style={{ flex: 1, fontSize: "0.75rem", gap: "0.25rem" }} onClick={onRedo} disabled={!canRedo} title="Ponów (Ctrl+Y)"><RedoIcon size={13} /> Ponów</button>
        </div>
        <button className="btn btn-primary btn-block" style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }} onClick={onSave} disabled={saving || !isDirty}>
          <SaveIcon size={14} /> {saving ? "Zapisywanie..." : "Zapisz layout"}
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
              style={{ justifyContent: "flex-start", gap: "0.25rem", fontSize: "0.75rem", padding: "0.4rem 0.5rem", minWidth: 0 }}
              title={label}
            >
              <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span>
              <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", minWidth: 0 }}>{label}</span>
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
                <span style={{ display: "flex", alignItems: "center", flexShrink: 0 }}>{icon}</span> {label}
              </button>
            ))}
          </div>
          <div style={{ display: "flex", gap: "0.375rem" }}>
            <button className="btn btn-secondary btn-sm" style={{ flex: 1, fontSize: "0.75rem", gap: "0.375rem" }} onClick={() => rotateSpot(selectedSpot.id)}>
              <RotateCwIcon size={13} /> {selectedSpot.rotation}°
            </button>
            <button className="btn btn-sm" style={{ color: "var(--danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)", padding: "0.375rem 0.625rem" }} onClick={deleteSelected}>
              <TrashIcon size={14} />
            </button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ padding: "0.75rem 1rem", marginTop: "auto" }}>
        <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "0.375rem" }}>
          <MapPinIcon size={13} /> {spots.length} miejsc
        </p>
      </div>
    </div>
  );
}
