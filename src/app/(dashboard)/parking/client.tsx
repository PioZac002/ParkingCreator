"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { CarIcon, WheelchairIcon, ZapIcon, LockIcon, XIcon, SearchIcon, MapIcon } from "@/components/ui/Icons";

function SpotTypeIcon({ type, size = 18 }: { type: string; size?: number }) {
  if (type === "DISABLED") return <WheelchairIcon size={size} />;
  if (type === "ELECTRIC") return <ZapIcon size={size} />;
  if (type === "RESERVED") return <LockIcon size={size} />;
  return <CarIcon size={size} />;
}

type Availability = { id: string; status: string; startTime: string | Date; endTime: string | Date };

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
  reservations?: { id: string }[];
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


function toDate(d: string | Date): Date {
  return d instanceof Date ? d : new Date(d);
}

function formatDateTime(d: string | Date): string {
  return toDate(d).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function getSpotStatus(spot: Spot | MySpot, now: Date): "occupied" | "available" | "reserved" | "unavailable" {
  // Active non-cancelled reservation right now → reserved
  if ("reservations" in spot && spot.reservations && spot.reservations.length > 0) return "reserved";
  const active = spot.availabilities[0];
  if (!active) return "occupied";
  const end = toDate(active.endTime);
  if (end <= now) return "occupied";
  if (active.status === "AVAILABLE") return "available";
  if (active.status === "UNAVAILABLE") return "unavailable";
  return "occupied";
}

const statusLabels: Record<string, string> = {
  occupied: "Zajęte",
  available: "Wolne",
  reserved: "Zarezerwowane",
  unavailable: "Niedostępne",
};

// --- Availability form embedded in spot card ---
function AvailabilityControls({ spot }: { spot: MySpot }) {
  const router = useRouter();
  const [mode, setMode] = useState<"idle" | "available" | "unavailable">("idle");
  const now = new Date();
  const defaultStart = toDatetimeLocal(now);
  const defaultEnd = toDatetimeLocal(new Date(now.getTime() + 24 * 60 * 60 * 1000));
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);

  const active = spot.availabilities[0];
  const hasActive = active && toDate(active.endTime) > now;

  const setAvailability = trpc.availability.setAvailability.useMutation({
    onSuccess: () => { setMode("idle"); router.refresh(); },
  });
  const clearAvailability = trpc.availability.clearAvailability.useMutation({
    onSuccess: () => router.refresh(),
  });

  const handleSet = (status: "AVAILABLE" | "UNAVAILABLE") => {
    const start = new Date(startTime);
    const end = new Date(endTime);
    if (end <= start) return;
    setAvailability.mutate({ spotId: spot.id, status, startTime: start, endTime: end });
  };

  if (hasActive) {
    const statusColor = active.status === "AVAILABLE" ? "var(--spot-available)" : "var(--spot-unavailable)";
    const statusText = active.status === "AVAILABLE" ? "Wolne" : "Niedostępne";
    return (
      <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <div style={{ fontSize: "0.8125rem" }}>
            <span style={{ color: statusColor, fontWeight: 600 }}>● {statusText}</span>
            <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
              do {formatDateTime(active.endTime)}
            </span>
          </div>
          <button
            className="btn btn-sm"
            style={{ fontSize: "0.75rem", color: "var(--danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
            onClick={() => clearAvailability.mutate({ spotId: spot.id })}
            disabled={clearAvailability.isPending}
          >
            {clearAvailability.isPending ? "..." : "Anuluj"}
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ marginTop: "0.75rem", paddingTop: "0.75rem", borderTop: "1px solid var(--border-color)" }}>
      {mode === "idle" ? (
        <div style={{ display: "flex", gap: "0.375rem" }}>
          <button
            className="btn btn-sm btn-primary"
            style={{ flex: 1, fontSize: "0.75rem" }}
            onClick={() => setMode("available")}
          >
            🟢 Udostępnij
          </button>
          <button
            className="btn btn-sm btn-secondary"
            style={{ flex: 1, fontSize: "0.75rem" }}
            onClick={() => setMode("unavailable")}
          >
            🔴 Ustaw niedostępne
          </button>
        </div>
      ) : (
        <div className="animate-fade-in">
          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
            {mode === "available" ? "🟢 Udostępnij miejsce" : "🔴 Ustaw niedostępne"}
          </p>
          <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem" }}>
              <div>
                <label className="label">Od</label>
                <input className="input" type="datetime-local" style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }} value={startTime} onChange={(e) => setStartTime(e.target.value)} />
              </div>
              <div>
                <label className="label">Do</label>
                <input className="input" type="datetime-local" style={{ fontSize: "0.75rem", padding: "0.35rem 0.5rem" }} value={endTime} onChange={(e) => setEndTime(e.target.value)} />
              </div>
            </div>
            <div style={{ display: "flex", gap: "0.375rem", marginTop: "0.125rem" }}>
              <button
                className="btn btn-primary btn-sm"
                style={{ flex: 1, fontSize: "0.75rem" }}
                disabled={setAvailability.isPending || new Date(endTime) <= new Date(startTime)}
                onClick={() => handleSet(mode === "available" ? "AVAILABLE" : "UNAVAILABLE")}
              >
                {setAvailability.isPending ? "Zapisuję..." : "Zapisz"}
              </button>
              <button className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }} onClick={() => setMode("idle")}>
                Anuluj
              </button>
            </div>
            {setAvailability.isError && (
              <p style={{ fontSize: "0.75rem", color: "var(--danger)" }}>{setAvailability.error.message}</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// --- Parking grid ---
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
                <span style={{ display: "flex", alignItems: "center", justifyContent: "center", lineHeight: 1 }}>
                  <SpotTypeIcon type={spot.type} size={Math.max(8, Math.round(Math.min(spot.width, spot.height) * CELL * 0.32))} />
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
              <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)", display: "inline-flex", alignItems: "center", gap: "0.25rem" }}>
                <SpotTypeIcon type={selected.type} size={14} /> {selected.type}
              </span>
              {mySpotIds.has(selected.id) && (
                <span style={{ marginLeft: "0.75rem", fontSize: "0.75rem", color: "var(--accent-secondary)", fontWeight: 600 }}>← Twoje</span>
              )}
            </div>
            <button className="btn btn-ghost btn-sm" style={{ padding: "0.375rem" }} onClick={() => setSelected(null)}><XIcon size={14} /></button>
          </div>
          <div style={{ marginTop: "0.5rem", fontSize: "0.8125rem" }}>
            <span style={{ color: spotColors[getSpotStatus(selected, now)] }}>
              ● {statusLabels[getSpotStatus(selected, now)]}
            </span>
            {selected.availabilities[0] && toDate(selected.availabilities[0].endTime) > now && (
              <span style={{ color: "var(--text-muted)", marginLeft: "0.5rem" }}>
                do {formatDateTime(selected.availabilities[0].endTime)}
              </span>
            )}
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
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "0.75rem" }}>
            {mySpots.map((spot) => {
              const now = new Date();
              const status = getSpotStatus(spot, now);
              return (
                <div
                  key={spot.id}
                  className="card animate-fade-in"
                  style={{ borderColor: "var(--accent-primary)", borderWidth: "1.5px", padding: "1rem 1.25rem" }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "0.875rem" }}>
                    <div className="icon-box icon-box-blue">
                      <SpotTypeIcon type={spot.type} size={22} />
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 700 }}>Miejsce {spot.number}</div>
                      <div style={{ fontSize: "0.75rem", color: "var(--text-secondary)" }}>
                        {spot.layout.name}{spot.layout.zone ? ` · Strefa ${spot.layout.zone}` : ""}
                      </div>
                    </div>
                    <span style={{ fontSize: "0.75rem", fontWeight: 600, color: spotColors[status] }}>
                      ● {statusLabels[status]}
                    </span>
                  </div>
                  <AvailabilityControls spot={spot} />
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="card" style={{ marginBottom: "2rem", textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", opacity: 0.4 }}><SearchIcon size={36} /></div>
          <p>Nie masz przypisanego miejsca parkingowego.</p>
        </div>
      )}

      {/* Parking grid */}
      {layouts.length > 0 ? (
        <div>
          {layouts.length > 1 && (
            <div className="pill-tabs" style={{ marginBottom: "1rem" }}>
              {layouts.map((layout) => (
                <button
                  key={layout.id}
                  className={`pill-tab${activeLayout === layout.id ? " active" : ""}`}
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
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", opacity: 0.4 }}><MapIcon size={48} /></div>
          <p>Brak layoutów parkingu. Zarządca musi najpierw stworzyć układ.</p>
        </div>
      )}
    </div>
  );
}
