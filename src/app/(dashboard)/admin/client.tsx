"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { EstateIcon, UsersIcon, ParkingIcon, CalendarIcon, TrashIcon, PlusIcon, BuildingIcon } from "@/components/ui/Icons";

type Manager = {
  id: string;
  name: string;
  email: string;
  status: string;
  managedEstates: { id: string; name: string }[];
};

type Estate = {
  id: string;
  name: string;
  address: string;
  createdAt: Date;
  _count: { residents: number; parkingLayouts: number };
  managers: { id: string; name: string; email: string }[];
};

type Stats = {
  estateCount: number;
  userCount: number;
  spotCount: number;
  reservationCount: number;
};

export function AdminDashboardClient({
  stats,
  estates: initialEstates,
  managers: initialManagers,
}: {
  stats: Stats;
  estates: Estate[];
  managers: Manager[];
}) {
  const [showEstateForm, setShowEstateForm] = useState(false);
  const [name, setName] = useState("");
  const [address, setAddress] = useState("");
  const [estates, setEstates] = useState(initialEstates);
  const [managers, setManagers] = useState(initialManagers);
  const [formError, setFormError] = useState("");
  const [activeTab, setActiveTab] = useState<"estates" | "managers">("estates");
  const [assigningEstate, setAssigningEstate] = useState<string | null>(null);
  const [selectedManagerId, setSelectedManagerId] = useState("");

  // Delete estate confirm
  const [deleteEstateId, setDeleteEstateId] = useState<string | null>(null);

  // New manager form
  const [showManagerForm, setShowManagerForm] = useState(false);
  const [mgrName, setMgrName] = useState("");
  const [mgrEmail, setMgrEmail] = useState("");
  const [mgrEstateId, setMgrEstateId] = useState("");
  const [mgrError, setMgrError] = useState("");

  const createEstate = trpc.estate.create.useMutation({
    onSuccess: (newEstate) => {
      setEstates((prev) => [
        { ...newEstate, _count: { residents: 0, parkingLayouts: 0 }, managers: [] },
        ...prev,
      ]);
      setName("");
      setAddress("");
      setShowEstateForm(false);
      setFormError("");
    },
    onError: (err) => setFormError(err.message),
  });

  const deleteEstate = trpc.estate.delete.useMutation({
    onSuccess: (_, vars) => {
      setEstates((prev) => prev.filter((e) => e.id !== vars.id));
      setDeleteEstateId(null);
    },
  });

  const assignManager = trpc.estate.assignManager.useMutation({
    onSuccess: (_, vars) => {
      const manager = managers.find((m) => m.id === vars.managerId);
      if (!manager) return;
      setEstates((prev) =>
        prev.map((e) =>
          e.id === vars.estateId
            ? { ...e, managers: [...e.managers, { id: manager.id, name: manager.name, email: manager.email }] }
            : e
        )
      );
      setAssigningEstate(null);
      setSelectedManagerId("");
    },
  });

  const removeManager = trpc.estate.removeManager.useMutation({
    onSuccess: (_, vars) => {
      setEstates((prev) =>
        prev.map((e) =>
          e.id === vars.estateId
            ? { ...e, managers: e.managers.filter((m) => m.id !== vars.managerId) }
            : e
        )
      );
    },
  });

  const createManager = trpc.user.createManager.useMutation({
    onSuccess: (newMgr) => {
      setManagers((prev) => [...prev, newMgr]);
      setMgrName("");
      setMgrEmail("");
      setMgrEstateId("");
      setShowManagerForm(false);
      setMgrError("");
    },
    onError: (err) => setMgrError(err.message),
  });

  const statCards = [
    { label: "Osiedla", value: stats.estateCount, icon: <EstateIcon size={24} />, color: "var(--accent-primary)" },
    { label: "Użytkownicy", value: stats.userCount, icon: <UsersIcon size={24} />, color: "var(--info)" },
    { label: "Miejsca parkingowe", value: stats.spotCount, icon: <ParkingIcon size={24} />, color: "var(--success)" },
    { label: "Rezerwacje", value: stats.reservationCount, icon: <CalendarIcon size={24} />, color: "var(--warning)" },
  ];

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title gradient-text">Panel Super Admina</h1>
          <p className="page-subtitle">Zarządzaj osiedlami i zarządcami</p>
        </div>
        {activeTab === "estates" && (
          <button className="btn btn-primary" onClick={() => setShowEstateForm((v) => !v)}>
            <PlusIcon size={16} /><span>Nowe osiedle</span>
          </button>
        )}
        {activeTab === "managers" && (
          <button className="btn btn-primary" onClick={() => setShowManagerForm((v) => !v)}>
            <PlusIcon size={16} /><span>Nowy zarządca</span>
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="stats-grid">
        {statCards.map((stat) => (
          <div key={stat.label} className="card-stat">
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div className="stat-value" style={{ color: stat.color }}>{stat.value}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
              <span style={{ opacity: 0.4, color: stat.color }}>{stat.icon}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: "flex", gap: "0.25rem", marginBottom: "1.5rem", background: "var(--bg-secondary)", padding: "0.25rem", borderRadius: "var(--radius-sm)", width: "fit-content" }}>
        {(["estates", "managers"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`btn btn-sm ${activeTab === tab ? "btn-primary" : "btn-ghost"}`}
            style={{ borderRadius: "6px", gap: "0.375rem" }}
          >
            {tab === "estates" ? (
              <><EstateIcon size={14} /> Osiedla ({estates.length})</>
            ) : (
              <><BuildingIcon size={14} /> Zarządcy ({managers.length})</>
            )}
          </button>
        ))}
      </div>

      {/* ESTATES TAB */}
      {activeTab === "estates" && (
        <>
          {showEstateForm && (
            <div className="card animate-fade-in" style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Dodaj nowe osiedle</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Nazwa osiedla</label>
                <input className="input" placeholder="np. Osiedle Słoneczne" value={name} onChange={(e) => setName(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Adres</label>
                <input className="input" placeholder="ul. Słoneczna 15, 00-100 Warszawa" value={address} onChange={(e) => setAddress(e.target.value)} />
              </div>
              {formError && <p style={{ color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "1rem" }}>{formError}</p>}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button className="btn btn-primary" disabled={createEstate.isPending || !name || !address} onClick={() => createEstate.mutate({ name, address })}>
                  {createEstate.isPending ? "Dodawanie..." : "Dodaj osiedle"}
                </button>
                <button className="btn btn-ghost" onClick={() => setShowEstateForm(false)}>Anuluj</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "1rem" }}>
            {estates.map((estate) => (
              <div key={estate.id} className="card">
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "0.75rem" }}>
                  <div>
                    <h3 style={{ fontWeight: 600 }}>{estate.name}</h3>
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-secondary)" }}>{estate.address}</p>
                  </div>
                  <button
                    className="btn btn-ghost btn-sm"
                    style={{ color: "var(--danger)", padding: "0.25rem" }}
                    title="Usuń osiedle"
                    onClick={() => setDeleteEstateId(estate.id)}
                  >
                    <TrashIcon size={15} />
                  </button>
                </div>

                <div style={{ display: "flex", gap: "1.5rem", marginBottom: "0.75rem" }}>
                  <div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700 }}>{estate._count.residents}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Mieszkańcy</div>
                  </div>
                  <div>
                    <div style={{ fontSize: "1.125rem", fontWeight: 700 }}>{estate._count.parkingLayouts}</div>
                    <div style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Layouty</div>
                  </div>
                </div>

                <hr className="divider" style={{ margin: "0.75rem 0" }} />

                {/* Managers section */}
                <div>
                  <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "0.5rem" }}>
                    Zarządcy
                  </div>
                  {estate.managers.length === 0 ? (
                    <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)", marginBottom: "0.5rem" }}>Brak przypisanych zarządców</p>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: "0.375rem", marginBottom: "0.5rem" }}>
                      {estate.managers.map((mgr) => (
                        <div key={mgr.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "0.8125rem" }}>
                          <span>{mgr.name}</span>
                          <button
                            className="btn btn-ghost btn-sm"
                            style={{ color: "var(--danger)", padding: "0.125rem 0.5rem", fontSize: "0.75rem" }}
                            onClick={() => removeManager.mutate({ estateId: estate.id, managerId: mgr.id })}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                  )}

                  {assigningEstate === estate.id ? (
                    <div style={{ display: "flex", gap: "0.5rem", marginTop: "0.5rem" }}>
                      <select className="input" style={{ flex: 1, padding: "0.5rem" }} value={selectedManagerId} onChange={(e) => setSelectedManagerId(e.target.value)}>
                        <option value="">Wybierz zarządcę...</option>
                        {managers
                          .filter((m) => !estate.managers.find((em) => em.id === m.id))
                          .map((m) => <option key={m.id} value={m.id}>{m.name}</option>)
                        }
                      </select>
                      <button
                        className="btn btn-primary btn-sm"
                        disabled={!selectedManagerId || assignManager.isPending}
                        onClick={() => assignManager.mutate({ estateId: estate.id, managerId: selectedManagerId })}
                      >
                        Przypisz
                      </button>
                      <button className="btn btn-ghost btn-sm" onClick={() => setAssigningEstate(null)}>✕</button>
                    </div>
                  ) : (
                    <button
                      className="btn btn-secondary btn-sm"
                      style={{ marginTop: "0.25rem" }}
                      onClick={() => { setAssigningEstate(estate.id); setSelectedManagerId(""); }}
                    >
                      + Dodaj zarządcę
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}

      {/* MANAGERS TAB */}
      {activeTab === "managers" && (
        <>
          {showManagerForm && (
            <div className="card animate-fade-in" style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Dodaj nowego zarządcę</h3>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Imię i nazwisko</label>
                <input className="input" placeholder="Jan Kowalski" value={mgrName} onChange={(e) => setMgrName(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Adres email</label>
                <input className="input" type="email" placeholder="jan@przyklad.pl" value={mgrEmail} onChange={(e) => setMgrEmail(e.target.value)} />
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <label className="label">Przypisz do osiedla (opcjonalnie)</label>
                <select className="input" value={mgrEstateId} onChange={(e) => setMgrEstateId(e.target.value)}>
                  <option value="">Brak przypisania</option>
                  {estates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
                </select>
              </div>
              {mgrError && <p style={{ color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "1rem" }}>{mgrError}</p>}
              <div style={{ display: "flex", gap: "0.75rem" }}>
                <button
                  className="btn btn-primary"
                  disabled={createManager.isPending || !mgrName || !mgrEmail}
                  onClick={() => createManager.mutate({ name: mgrName, email: mgrEmail, estateId: mgrEstateId || undefined })}
                >
                  {createManager.isPending ? "Tworzenie..." : "Utwórz zarządcę"}
                </button>
                <button className="btn btn-ghost" onClick={() => { setShowManagerForm(false); setMgrError(""); }}>Anuluj</button>
              </div>
            </div>
          )}

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))", gap: "1rem" }}>
            {managers.map((mgr) => (
              <div key={mgr.id} className="card">
                <div style={{ display: "flex", alignItems: "center", gap: "0.75rem", marginBottom: "0.75rem" }}>
                  <div style={{ width: "40px", height: "40px", borderRadius: "50%", background: "rgba(116,185,255,0.15)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--info)", flexShrink: 0 }}>
                    <BuildingIcon size={20} />
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontWeight: 600 }}>{mgr.name}</div>
                    <div style={{ fontSize: "0.8125rem", color: "var(--text-secondary)", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{mgr.email}</div>
                  </div>
                  <span style={{
                    fontSize: "0.6875rem", fontWeight: 600, padding: "0.2rem 0.5rem", borderRadius: "9999px",
                    background: mgr.status === "ACTIVE" ? "rgba(0,184,148,0.12)" : "rgba(253,203,110,0.15)",
                    color: mgr.status === "ACTIVE" ? "var(--success)" : "var(--warning)",
                  }}>
                    {mgr.status === "ACTIVE" ? "Aktywny" : "Oczekuje"}
                  </span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-muted)", marginBottom: "0.5rem", fontWeight: 600, textTransform: "uppercase" }}>
                  Zarządza osiedlami ({mgr.managedEstates.length})
                </div>
                {mgr.managedEstates.length === 0 ? (
                  <p style={{ fontSize: "0.8125rem", color: "var(--text-muted)" }}>Brak przypisanych osiedli</p>
                ) : (
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem" }}>
                    {mgr.managedEstates.map((e) => (
                      <span key={e.id} style={{ fontSize: "0.75rem", background: "rgba(108,92,231,0.12)", color: "var(--accent-secondary)", padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
                        {e.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </>
      )}

      {/* Confirm delete estate dialog */}
      <ConfirmDialog
        open={!!deleteEstateId}
        title="Usuń osiedle"
        message="Usunięcie osiedla jest nieodwracalne. Zostaną usunięte wszystkie powiązane layouty, miejsca parkingowe i rezerwacje. Mieszkańcy zostaną odłączeni od osiedla."
        danger
        confirmLabel="Tak, usuń osiedle"
        onConfirm={() => deleteEstateId && deleteEstate.mutate({ id: deleteEstateId })}
        onCancel={() => setDeleteEstateId(null)}
      />
    </div>
  );
}
