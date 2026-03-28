"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { CarIcon, WheelchairIcon, ZapIcon, LockIcon, ClipboardListIcon, CheckIcon } from "@/components/ui/Icons";

function SpotTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  if (type === "DISABLED") return <WheelchairIcon size={size} />;
  if (type === "ELECTRIC") return <ZapIcon size={size} />;
  if (type === "RESERVED") return <LockIcon size={size} />;
  return <CarIcon size={size} />;
}

type Reservation = {
  id: string;
  status: string;
  startTime: string | Date;
  endTime: string | Date;
  createdAt: string | Date;
  spot: {
    id: string;
    number: string;
    type: string;
    layout: { id: string; name: string; zone: string | null };
  };
  user: { id: string; name: string | null; email: string };
};

type Estate = { id: string; name: string };

function toDate(d: string | Date) { return d instanceof Date ? d : new Date(d); }
function fmt(d: string | Date) {
  return toDate(d).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

const statusColors: Record<string, string> = {
  PENDING: "var(--warning)",
  CONFIRMED: "var(--spot-available)",
  CANCELLED: "var(--text-muted)",
  COMPLETED: "var(--spot-reserved)",
};
const statusLabels: Record<string, string> = {
  PENDING: "Oczekuje",
  CONFIRMED: "Potwierdzona",
  CANCELLED: "Anulowana",
  COMPLETED: "Zakończona",
};

const FILTERS = ["Wszystkie", "Oczekujące", "Potwierdzone", "Anulowane"] as const;
type Filter = (typeof FILTERS)[number];

export function ManagerReservationsClient({
  reservations,
  managedEstates,
  activeEstateId,
}: {
  reservations: Reservation[];
  managedEstates: Estate[];
  activeEstateId: string;
}) {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("Oczekujące");

  const updateStatus = trpc.reservation.updateStatus.useMutation({
    onSuccess: () => router.refresh(),
  });

  const filtered = reservations.filter((r) => {
    if (filter === "Wszystkie") return true;
    if (filter === "Oczekujące") return r.status === "PENDING";
    if (filter === "Potwierdzone") return r.status === "CONFIRMED";
    if (filter === "Anulowane") return r.status === "CANCELLED";
    return true;
  });

  const pendingCount = reservations.filter((r) => r.status === "PENDING").length;

  return (
    <div className="page-container">
      <div className="page-header">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", flexWrap: "wrap", gap: "1rem" }}>
          <div>
            <h1 className="page-title gradient-text">Rezerwacje</h1>
            <p className="page-subtitle">Zarządzaj rezerwacjami miejsc parkingowych</p>
          </div>
          {managedEstates.length > 1 && (
            <select
              className="input"
              style={{ padding: "0.5rem 0.75rem", fontSize: "0.875rem", width: "auto" }}
              value={activeEstateId}
              onChange={(e) => router.push(`/manager/reservations?estateId=${e.target.value}`)}
            >
              {managedEstates.map((e) => (
                <option key={e.id} value={e.id}>{e.name}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {/* Filter tabs */}
      <div className="pill-tabs" style={{ marginBottom: "1.25rem" }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            className={`pill-tab${filter === f ? " active" : ""}`}
            onClick={() => setFilter(f)}
            style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}
          >
            {f}
            {f === "Oczekujące" && pendingCount > 0 && (
              <span style={{ background: "var(--danger)", color: "#fff", borderRadius: "999px", padding: "0 5px", fontSize: "0.6875rem" }}>
                {pendingCount}
              </span>
            )}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", opacity: 0.4 }}><ClipboardListIcon size={48} /></div>
          <p>Brak rezerwacji w tej kategorii.</p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
          {filtered.map((r) => (
            <div key={r.id} className="card animate-fade-in" style={{ padding: "1rem 1.25rem" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "1rem", flexWrap: "wrap" }}>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", flexShrink: 0, color: "var(--text-secondary)" }}><SpotTypeIcon type={r.spot.type} size={18} /></div>
                <div style={{ flex: 1, minWidth: "180px" }}>
                  <div style={{ fontWeight: 700 }}>
                    Miejsce {r.spot.number}
                    <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", fontWeight: 400, color: "var(--text-secondary)" }}>
                      {r.spot.layout.name}{r.spot.layout.zone ? ` · Strefa ${r.spot.layout.zone}` : ""}
                    </span>
                  </div>
                  <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.125rem" }}>
                    {fmt(r.startTime)} → {fmt(r.endTime)}
                  </div>
                </div>
                <div style={{ minWidth: "140px" }}>
                  <div style={{ fontSize: "0.8125rem", fontWeight: 600 }}>{r.user.name || "—"}</div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>{r.user.email}</div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
                  <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColors[r.status] }}>
                    ● {statusLabels[r.status]}
                  </span>
                  {r.status === "PENDING" && (
                    <div style={{ display: "flex", gap: "0.375rem" }}>
                      <button
                        className="btn btn-sm btn-primary"
                        style={{ fontSize: "0.75rem" }}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ reservationId: r.id, status: "CONFIRMED" })}
                      >
                        <CheckIcon size={13} /> Potwierdź
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ fontSize: "0.75rem", color: "var(--danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                        disabled={updateStatus.isPending}
                        onClick={() => updateStatus.mutate({ reservationId: r.id, status: "CANCELLED" })}
                      >
                        Odrzuć
                      </button>
                    </div>
                  )}
                  {r.status === "CONFIRMED" && (
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: "0.75rem", color: "var(--danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                      disabled={updateStatus.isPending}
                      onClick={() => updateStatus.mutate({ reservationId: r.id, status: "CANCELLED" })}
                    >
                      Anuluj
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
