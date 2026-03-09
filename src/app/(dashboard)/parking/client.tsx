"use client";

import { useState } from "react";

type Availability = { id: string; status: string; startTime: Date; endTime: Date };

type Spot = {
  id: string;
  number: string;
  type: string;
  posX: number;
  posY: number;
  width: number;
  height: number;
  ownerId: string | null;
  availabilities: Availability[];
};

type Layout = {
  id: string;
  name: string;
  zone: string | null;
  gridWidth: number;
  gridHeight: number;
  spots: Spot[];
};

type MySpot = {
  id: string;
  number: string;
  type: string;
  layout: { id: string; name: string; zone: string | null };
  availabilities: Availability[];
};

const spotColors: Record<string, string> = {
  occupied: "var(--spot-occupied)",
  available: "var(--spot-available)",
  reserved: "var(--spot-reserved)",
  unavailable: "var(--spot-unavailable)",
};

const typeIcons: Record<string, string> = {
  STANDARD: "🚗",
  DISABLED: "♿",
  ELECTRIC: "⚡",
  RESERVED: "🔒",
};

function getSpotStatus(spot: Spot, now: Date): "occupied" | "available" | "reserved" | "unavailable" {
  const active = spot.availabilities[0];
  if (!active) return "occupied";
  if (active.status === "AVAILABLE" && active.endTime > now) return "available";
  if (active.status === "UNAVAILABLE") return "unavailable";
  return "occupied";
}

function SpotGrid({ layout, userId, mySpotIds }: { layout: Layout; userId: string; mySpotIds: Set<string> }) {
  const [selected, setSelected] = useState<Spot | null>(null);
  const now = new Date();
  const CELL = 28;

  return (
    <div>
      <div style={{ overflowX: "auto", overflowY: "auto", maxHeight: "480px" }}>
        <div
          style={{
            position: "relative",
            width: layout.gridWidth * CELL,
            height: layout.gridHeight * CELL,
            background: "var(--bg-secondary)",
            border: "1px solid var(--border-color)",
            borderRadius: "var(--radius-sm)",
            backgroundImage: `linear-gradient(to right, var(--border-light) 1px, transparent 1px), linear-gradient(to bottom, var(--border-light) 1px, transparent 1px)`,
            backgroundSize: `${CELL}px ${CELL}px`,
          }}
        >
          {layout.spots.map((spot) => {
            const status = getSpotStatus(spot, now);
            const isOwn = spot.ownerId === userId;
            const color = spotColors[status];
            return (
              <div
                key={spot.id}
                onClick={() => setSelected(selected?.id === spot.id ? null : spot)}
                style={{
                  position: "absolute",
                  left: spot.posX * CELL, top: spot.posY * CELL,
                  width: spot.width * CELL, height: spot.height * CELL,
                  background: `${color}22`,
                  border: `2px solid ${isOwn ? "var(--accent-primary)" : color}`,
                  borderRadius: "4px", cursor: "pointer",
                  display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                  transition: "all 0.15s ease",
                  boxShadow: selected?.id === spot.id ? `0 0 12px ${color}66` : "none",
                  zIndex: selected?.id === spot.id ? 2 : 1,
                }}
              >
                <span style={{ fontSize: `${Math.min(spot.width, spot.height) * CELL * 0.32}px`, lineHeight: 1 }}>
                  {typeIcons[spot.type] ?? "🚗"}
                </span>
                <span style={{ fontSize: "9px", color, fontWeight: 700, lineHeight: 1, marginTop: "2px" }}>
                  {spot.number}
                </span>
                {mySpotIds.has(spot.id) && (
                  <span style={{ fontSize: "7px", color: "var(--accent-secondary)", lineHeight: 1 }}>●</span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Legend */}
      <div style={{ display: "flex", gap: "1rem", marginTop: "0.75rem", flexWrap: "wrap" }}>
        {Object.entries({ occupied: "Zajęte", available: "Wolne", reserved: "Zarezerwowane", unavailable: "Niedostępne" }).map(([key, label]) => (
          <div key={key} style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
            <div style={{ width: "12px", height: "12px", borderRadius: "3px", background: spotColors[key], opacity: 0.8 }} />
            <span>{label}</span>
          </div>
        ))}
        <div style={{ display: "flex", alignItems: "center", gap: "0.375rem", fontSize: "0.75rem", color: "var(--text-secondary)" }}>
          <div style={{ width: "12px", height: "12px", borderRadius: "3px", border: "2px solid var(--accent-primary)" }} />
          <span>Twoje miejsce</span>
        </div>
      </div>

      {selected && (
        <div className="card animate-fade-in" style={{ marginTop: "1rem" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <div>
              <strong>Miejsce {selected.number}</strong>
              <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                {typeIcons[selected.type]} {selected.type}
              </span>
              {mySpotIds.has(selected.id) && (
                <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", color: "var(--accent-secondary)", fontWeight: 600 }}>← Twoje</span>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" onClick={() => setSelected(null)}>✕</button>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>
            <span style={{ color: spotColors[getSpotStatus(selected, now)] }}>
              ● {getSpotStatus(selected, now) === "available" ? "Wolne" : getSpotStatus(selected, now) === "reserved" ? "Zarezerwowane" : getSpotStatus(selected, now) === "unavailable" ? "Niedostępne" : "Zajęte"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}

export function ParkingViewClient({
  mySpots,
  layouts,
  userId,
}: {
  mySpots: MySpot[];
  layouts: Layout[];
  userId: string;
}) {
  const [activeLayout, setActiveLayout] = useState(layouts[0]?.id ?? null);
  const currentLayout = layouts.find((l) => l.id === activeLayout);
  const mySpotIds = new Set(mySpots.map((s) => s.id));

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title gradient-text">Mój Parking</h1>
        <p className="page-subtitle">Przeglądaj dostępność miejsc i zarządzaj swoimi miejscami</p>
      </div>

      {/* My spots section */}
      {mySpots.length > 0 ? (
        <div style={{ marginBottom: "2rem" }}>
          <h2 style={{ fontWeight: 700, fontSize: "1.125rem", marginBottom: "1rem" }}>
            Moje miejsca ({mySpots.length})
          </h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.75rem" }}>
            {mySpots.map((spot) => (
              <div
                key={spot.id}
                className="card animate-fade-in"
                style={{ borderColor: "var(--accent-primary)", borderWidth: "1.5px", padding: "1rem 1.25rem" }}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                  <div style={{ width: "44px", height: "44px", borderRadius: "var(--radius-sm)", background: "rgba(108,92,231,0.15)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.375rem", flexShrink: 0 }}>
                    {typeIcons[spot.type] ?? "🚗"}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                      <span style={{ fontWeight: 700 }}>Miejsce {spot.number}</span>
                    </div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                      {spot.layout.name}{spot.layout.zone ? ` · Strefa ${spot.layout.zone}` : ""}
                    </div>
                  </div>
                  <div>
                    {spot.availabilities[0] ? (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--spot-available)" }}>● Wolne</span>
                    ) : (
                      <span style={{ fontSize: "0.75rem", fontWeight: 600, color: "var(--spot-occupied)" }}>● Zajęte</span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "2rem", textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2rem", marginBottom: "0.5rem" }}>🔍</div>
          <p>Nie masz przypisanego miejsca parkingowego.</p>
        </div>
      )}

      {/* Parking grid */}
      {layouts.length > 0 ? (
        <div>
          {layouts.length > 1 && (
            <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem", flexWrap: "wrap" }}>
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  className={`btn btn-sm ${activeLayout === layout.id ? "btn-primary" : "btn-secondary"}`}
                  onClick={() => setActiveLayout(layout.id)}
                >
                  {layout.name}{layout.zone ? ` (${layout.zone})` : ""}
                </button>
              ))}
            </div>
          )}
          {currentLayout && (
            <div className="card">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h2 style={{ fontWeight: 700, fontSize: "1.125rem" }}>{currentLayout.name}</h2>
                <span style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{currentLayout.spots.length} miejsc</span>
              </div>
              <SpotGrid layout={currentLayout} userId={userId} mySpotIds={mySpotIds} />
            </div>
          )}
        </div>
      ) : (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "2.5rem", marginBottom: "0.75rem" }}>🗺️</div>
          <p>Brak layoutów parkingu. Zarządca musi najpierw stworzyć układ.</p>
        </div>
      )}
    </div>
  );
}
