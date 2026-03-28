"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import {
  CarIcon, WheelchairIcon, ZapIcon, LockIcon,
  SearchIcon, ClipboardListIcon, InboxIcon, CheckIcon,
} from "@/components/ui/Icons";

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
  spot: {
    id: string;
    number: string;
    type: string;
    layout: { id: string; name: string; zone: string | null };
  };
};

type AvailableSpot = {
  id: string;
  number: string;
  type: string;
  layout: { id: string; name: string; zone: string | null };
};

function toDate(d: string | Date) { return d instanceof Date ? d : new Date(d); }

function fmt(d: string | Date) {
  return toDate(d).toLocaleString("pl-PL", { dateStyle: "short", timeStyle: "short" });
}

function toDatetimeLocal(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
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

export function ReservationsClient({ myReservations }: { myReservations: Reservation[] }) {
  const router = useRouter();
  const now = new Date();
  const defaultStart = toDatetimeLocal(new Date(now.getTime() + 60 * 60 * 1000));
  const defaultEnd = toDatetimeLocal(new Date(now.getTime() + 25 * 60 * 60 * 1000));

  const [tab, setTab] = useState<"mine" | "search">("mine");
  const [startTime, setStartTime] = useState(defaultStart);
  const [endTime, setEndTime] = useState(defaultEnd);
  const [searchReady, setSearchReady] = useState(false);
  const [bookingSpotId, setBookingSpotId] = useState<string | null>(null);

  const { data: availableSpots, isLoading: searching, refetch } = trpc.reservation.listAvailable.useQuery(
    { startTime: new Date(startTime), endTime: new Date(endTime) },
    { enabled: searchReady }
  );

  const cancel = trpc.reservation.cancel.useMutation({
    onSuccess: () => router.refresh(),
  });

  const create = trpc.reservation.create.useMutation({
    onSuccess: () => {
      setBookingSpotId(null);
      setSearchReady(false);
      setTab("mine");
      router.refresh();
    },
  });

  const handleSearch = () => {
    if (searchReady) refetch();
    else setSearchReady(true);
  };

  const activeReservations = myReservations.filter((r) => r.status !== "CANCELLED" && toDate(r.endTime) > now);
  const pastReservations = myReservations.filter((r) => r.status === "CANCELLED" || toDate(r.endTime) <= now);

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title gradient-text">Rezerwacje miejsc</h1>
        <p className="page-subtitle">Rezerwuj wolne miejsca parkingowe w swoim osiedlu</p>
      </div>

      {/* Tabs */}
      <div className="pill-tabs" style={{ marginBottom: "1.5rem" }}>
        <button className={`pill-tab${tab === "mine" ? " active" : ""}`} onClick={() => setTab("mine")} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <ClipboardListIcon size={14} /> Moje rezerwacje {activeReservations.length > 0 && `(${activeReservations.length})`}
        </button>
        <button className={`pill-tab${tab === "search" ? " active" : ""}`} onClick={() => setTab("search")} style={{ display: "inline-flex", alignItems: "center", gap: "0.375rem" }}>
          <SearchIcon size={14} /> Szukaj miejsca
        </button>
      </div>

      {/* My reservations tab */}
      {tab === "mine" && (
        <div>
          {activeReservations.length > 0 && (
            <div style={{ marginBottom: "1.5rem" }}>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem" }}>Aktywne</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.625rem" }}>
                {activeReservations.map((r) => (
                  <div key={r.id} className="card animate-fade-in" style={{ padding: "1rem 1.25rem" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", flexShrink: 0, color: "var(--text-secondary)" }}><SpotTypeIcon type={r.spot.type} size={18} /></div>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontWeight: 700 }}>Miejsce {r.spot.number}</div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {r.spot.layout.name}{r.spot.layout.zone ? ` · Strefa ${r.spot.layout.zone}` : ""}
                        </div>
                        <div style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginTop: "0.25rem" }}>
                          {fmt(r.startTime)} → {fmt(r.endTime)}
                        </div>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "0.5rem" }}>
                        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: statusColors[r.status] }}>
                          ● {statusLabels[r.status]}
                        </span>
                        {(r.status === "PENDING" || r.status === "CONFIRMED") && (
                          <button
                            className="btn btn-sm"
                            style={{ fontSize: "0.75rem", color: "var(--danger)", background: "rgba(239,68,68,0.1)", border: "1px solid rgba(239,68,68,0.2)" }}
                            onClick={() => cancel.mutate({ reservationId: r.id })}
                            disabled={cancel.isPending}
                          >
                            Anuluj
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {pastReservations.length > 0 && (
            <div>
              <h2 style={{ fontWeight: 700, fontSize: "1rem", marginBottom: "0.75rem", color: "var(--text-muted)" }}>Historia</h2>
              <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                {pastReservations.map((r) => (
                  <div key={r.id} className="card" style={{ padding: "0.75rem 1.25rem", opacity: 0.6 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontWeight: 600 }}>Miejsce {r.spot.number}</span>
                        <span style={{ marginLeft: "0.5rem", fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                          {r.spot.layout.name}
                        </span>
                        <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>
                          {fmt(r.startTime)} → {fmt(r.endTime)}
                        </div>
                      </div>
                      <span style={{ fontSize: "0.75rem", color: statusColors[r.status] }}>
                        {statusLabels[r.status]}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {myReservations.length === 0 && (
            <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
              <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", opacity: 0.4 }}><ClipboardListIcon size={48} /></div>
              <p>Nie masz żadnych rezerwacji.</p>
              <button className="btn btn-primary" style={{ marginTop: "1rem" }} onClick={() => setTab("search")}>
                Zarezerwuj miejsce
              </button>
            </div>
          )}
        </div>
      )}

      {/* Search tab */}
      {tab === "search" && (
        <div>
          {/* Time range picker */}
          <div className="card" style={{ marginBottom: "1rem" }}>
            <p style={{ fontWeight: 700, fontSize: "0.875rem", marginBottom: "0.75rem" }}>Wybierz termin rezerwacji</p>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr auto", gap: "0.75rem", alignItems: "flex-end" }}>
              <DateTimePicker
                label="Od"
                value={startTime}
                onChange={(v) => { setStartTime(v); setSearchReady(false); }}
              />
              <DateTimePicker
                label="Do"
                value={endTime}
                onChange={(v) => { setEndTime(v); setSearchReady(false); }}
              />
              <button
                className="btn btn-primary"
                onClick={handleSearch}
                disabled={searching || new Date(endTime) <= new Date(startTime)}
              >
                {searching ? "Szukam..." : <><SearchIcon size={15} /> Szukaj</>}
              </button>
            </div>
            {new Date(endTime) <= new Date(startTime) && (
              <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.5rem" }}>
                Czas zakończenia musi być po czasie rozpoczęcia
              </p>
            )}
          </div>

          {/* Results */}
          {searchReady && !searching && availableSpots && (
            availableSpots.length === 0 ? (
              <div className="card" style={{ textAlign: "center", padding: "2rem", color: "var(--text-muted)" }}>
                <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.5rem", opacity: 0.4 }}><InboxIcon size={36} /></div>
                <p>Brak wolnych miejsc w wybranym terminie.</p>
              </div>
            ) : (
              <div>
                <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", marginBottom: "0.75rem" }}>
                  Znaleziono {availableSpots.length} wolnych miejsc
                </p>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))", gap: "0.625rem" }}>
                  {availableSpots.map((spot: AvailableSpot) => (
                    <div key={spot.id} className="card animate-fade-in" style={{ padding: "1rem 1.25rem" }}>
                      <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", width: "36px", height: "36px", borderRadius: "8px", background: "rgba(255,255,255,0.05)", flexShrink: 0, color: "var(--text-secondary)" }}><SpotTypeIcon type={spot.type} size={18} /></div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 700 }}>Miejsce {spot.number}</div>
                          <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>
                            {spot.layout.name}{spot.layout.zone ? ` · Strefa ${spot.layout.zone}` : ""}
                          </div>
                        </div>
                      </div>

                      {bookingSpotId === spot.id ? (
                        <div style={{ marginTop: "0.75rem" }} className="animate-fade-in">
                          <p style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>
                            {fmt(new Date(startTime))} → {fmt(new Date(endTime))}
                          </p>
                          <div style={{ display: "flex", gap: "0.375rem" }}>
                            <button
                              className="btn btn-primary btn-sm"
                              style={{ flex: 1, fontSize: "0.75rem" }}
                              disabled={create.isPending}
                              onClick={() => create.mutate({ spotId: spot.id, startTime: new Date(startTime), endTime: new Date(endTime) })}
                            >
                              {create.isPending ? "Rezerwuję..." : <><CheckIcon size={13} /> Potwierdź</>}
                            </button>
                            <button className="btn btn-ghost btn-sm" style={{ fontSize: "0.75rem" }} onClick={() => setBookingSpotId(null)}>
                              Anuluj
                            </button>
                          </div>
                          {create.isError && (
                            <p style={{ fontSize: "0.75rem", color: "var(--danger)", marginTop: "0.375rem" }}>
                              {create.error.message}
                            </p>
                          )}
                        </div>
                      ) : (
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ marginTop: "0.75rem", width: "100%", fontSize: "0.8125rem" }}
                          onClick={() => setBookingSpotId(spot.id)}
                        >
                          Zarezerwuj
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          )}
        </div>
      )}
    </div>
  );
}
