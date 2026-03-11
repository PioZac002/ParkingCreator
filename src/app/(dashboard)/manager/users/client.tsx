"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import Link from "next/link";
import { UserPlusIcon, ImportIcon } from "@/components/ui/Icons";

type Spot = { id: string; number: string; type: string };
type User = {
  id: string;
  name: string | null;
  email: string;
  status: string;
  createdAt: string | Date;
  parkingSpots: Spot[];
};
type UnassignedSpot = {
  id: string;
  number: string;
  type: string;
  layout: { name: string; zone: string | null };
};
type Estate = { id: string; name: string };

const statusBadge: Record<string, { label: string; color: string }> = {
  ACTIVE: { label: "Aktywny", color: "var(--success)" },
  PENDING: { label: "Oczekujący", color: "var(--warning)" },
  DISABLED: { label: "Wyłączony", color: "var(--danger)" },
};

const typeIcons: Record<string, string> = { STANDARD: "🚗", DISABLED: "♿", ELECTRIC: "⚡", RESERVED: "🔒" };

function UserRow({
  user,
  unassignedSpots,
  activeEstateId,
}: {
  user: User;
  unassignedSpots: UnassignedSpot[];
  activeEstateId: string;
}) {
  const router = useRouter();
  const [assigning, setAssigning] = useState(false);
  const [selectedSpotId, setSelectedSpotId] = useState("");

  const assignSpot = trpc.layout.assignSpotOwner.useMutation({
    onSuccess: () => { setAssigning(false); setSelectedSpotId(""); router.refresh(); },
  });
  const unassignSpot = trpc.layout.assignSpotOwner.useMutation({
    onSuccess: () => router.refresh(),
  });

  const badge = statusBadge[user.status] ?? statusBadge.PENDING;
  const available = unassignedSpots.filter((s) => !user.parkingSpots.find((p) => p.id === s.id));

  return (
    <tr style={{ borderBottom: "1px solid var(--border-light)" }}>
      <td style={{ padding: "0.875rem 1.25rem", fontWeight: 500 }}>{user.name}</td>
      <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-secondary)", fontSize: "0.875rem" }}>{user.email}</td>
      <td style={{ padding: "0.875rem 1.25rem" }}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "0.375rem", alignItems: "center" }}>
          {user.parkingSpots.map((s) => (
            <span
              key={s.id}
              style={{ display: "inline-flex", alignItems: "center", gap: "0.25rem", fontSize: "0.75rem", fontWeight: 600, color: "var(--accent-secondary)", background: "rgba(108,92,231,0.12)", padding: "0.125rem 0.5rem", borderRadius: "9999px" }}
            >
              {typeIcons[s.type] ?? "🚗"} {s.number}
              <button
                onClick={() => unassignSpot.mutate({ spotId: s.id, userId: null })}
                style={{ background: "none", border: "none", cursor: "pointer", color: "var(--text-muted)", padding: "0 1px", lineHeight: 1, fontSize: "0.75rem" }}
                title="Usuń przypisanie"
                disabled={unassignSpot.isPending}
              >✕</button>
            </span>
          ))}

          {assigning ? (
            <div style={{ display: "flex", gap: "0.25rem", alignItems: "center" }}>
              <select
                className="input"
                style={{ padding: "0.25rem 0.5rem", fontSize: "0.75rem", width: "160px" }}
                value={selectedSpotId}
                onChange={(e) => setSelectedSpotId(e.target.value)}
              >
                <option value="">Wybierz miejsce...</option>
                {available.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.number} ({s.layout.name}{s.layout.zone ? ` · ${s.layout.zone}` : ""})
                  </option>
                ))}
              </select>
              <button
                className="btn btn-primary btn-sm"
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                disabled={!selectedSpotId || assignSpot.isPending}
                onClick={() => assignSpot.mutate({ spotId: selectedSpotId, userId: user.id })}
              >
                {assignSpot.isPending ? "..." : "Przypisz"}
              </button>
              <button
                className="btn btn-ghost btn-sm"
                style={{ fontSize: "0.7rem", padding: "0.25rem 0.5rem" }}
                onClick={() => setAssigning(false)}
              >✕</button>
            </div>
          ) : (
            available.length > 0 && (
              <button
                onClick={() => setAssigning(true)}
                style={{ background: "none", border: "1px dashed var(--border-color)", borderRadius: "9999px", cursor: "pointer", color: "var(--text-muted)", padding: "0.125rem 0.5rem", fontSize: "0.75rem", lineHeight: 1.4 }}
              >
                + Dodaj
              </button>
            )
          )}
        </div>
      </td>
      <td style={{ padding: "0.875rem 1.25rem" }}>
        <span style={{ fontSize: "0.75rem", fontWeight: 600, color: badge.color, background: `${badge.color}20`, padding: "0.2rem 0.6rem", borderRadius: "9999px" }}>
          {badge.label}
        </span>
      </td>
      <td style={{ padding: "0.875rem 1.25rem", color: "var(--text-muted)", fontSize: "0.8125rem" }}>
        {new Date(user.createdAt).toLocaleDateString("pl-PL")}
      </td>
    </tr>
  );
}

export function ManagerUsersClient({
  users: initialUsers,
  unassignedSpots,
  managedEstates,
  activeEstateId,
  activeEstateName,
}: {
  users: User[];
  unassignedSpots: UnassignedSpot[];
  managedEstates: Estate[];
  activeEstateId: string;
  activeEstateName: string;
}) {
  const router = useRouter();
  const [users, setUsers] = useState(initialUsers);

  // Add single user form
  const [showAddForm, setShowAddForm] = useState(false);
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [addError, setAddError] = useState("");
  const [addSuccess, setAddSuccess] = useState("");

  const addSingleUser = trpc.import.addSingleUser.useMutation({
    onSuccess: (result) => {
      if (result.success > 0) {
        setAddSuccess(`Konto dla ${newEmail} zostało utworzone. Użytkownik otrzyma email aktywacyjny.`);
        setUsers((prev) => [
          ...prev,
          { id: crypto.randomUUID(), name: newName, email: newEmail, status: "PENDING", createdAt: new Date(), parkingSpots: [] },
        ]);
        setNewName("");
        setNewEmail("");
      } else if (result.skipped > 0) {
        setAddError("Użytkownik z tym emailem już istnieje.");
      } else {
        setAddError(result.errors[0]?.reason ?? "Błąd podczas dodawania.");
      }
    },
    onError: (err) => setAddError(err.message),
  });

  const counts = {
    total: users.length,
    active: users.filter((u) => u.status === "ACTIVE").length,
    pending: users.filter((u) => u.status === "PENDING").length,
  };

  return (
    <div className="page-container">
      <div className="page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div>
          <h1 className="page-title gradient-text">Mieszkańcy</h1>
          <p className="page-subtitle">
            {activeEstateName}
            {managedEstates.length > 1 && (
              <>
                {" · "}
                {managedEstates.map((e, i) => (
                  <span key={e.id}>
                    {i > 0 && " | "}
                    <Link
                      href={`/manager/users?estateId=${e.id}`}
                      style={{ color: e.id === activeEstateId ? "var(--accent-secondary)" : "var(--text-muted)", textDecoration: "none", fontWeight: e.id === activeEstateId ? 600 : 400 }}
                    >
                      {e.name}
                    </Link>
                  </span>
                ))}
              </>
            )}
          </p>
        </div>
        <div style={{ display: "flex", gap: "0.5rem" }}>
          <button className="btn btn-secondary" onClick={() => { setShowAddForm((v) => !v); setAddError(""); setAddSuccess(""); }}>
            <UserPlusIcon size={16} /><span>Dodaj mieszkańca</span>
          </button>
          <Link href={`/manager/import?estateId=${activeEstateId}`} className="btn btn-primary">
            <ImportIcon size={16} /><span>Importuj</span>
          </Link>
        </div>
      </div>

      {/* Add single user inline form */}
      {showAddForm && (
        <div className="card animate-fade-in" style={{ marginBottom: "1.5rem", maxWidth: "500px" }}>
          <h3 style={{ fontWeight: 600, marginBottom: "1.25rem" }}>Dodaj mieszkańca</h3>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Imię i nazwisko</label>
            <input className="input" placeholder="Jan Kowalski" value={newName} onChange={(e) => { setNewName(e.target.value); setAddError(""); setAddSuccess(""); }} />
          </div>
          <div style={{ marginBottom: "1rem" }}>
            <label className="label">Adres email</label>
            <input className="input" type="email" placeholder="jan@przyklad.pl" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setAddError(""); setAddSuccess(""); }} />
          </div>
          {addError && <p style={{ color: "var(--danger)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{addError}</p>}
          {addSuccess && <p style={{ color: "var(--success)", fontSize: "0.8125rem", marginBottom: "0.75rem" }}>{addSuccess}</p>}
          <div style={{ display: "flex", gap: "0.75rem" }}>
            <button
              className="btn btn-primary"
              disabled={addSingleUser.isPending || !newName || !newEmail}
              onClick={() => addSingleUser.mutate({ name: newName, email: newEmail, estateId: activeEstateId })}
            >
              {addSingleUser.isPending ? "Dodawanie..." : "Dodaj mieszkańca"}
            </button>
            <button className="btn btn-ghost" onClick={() => { setShowAddForm(false); setAddError(""); setAddSuccess(""); }}>Anuluj</button>
          </div>
        </div>
      )}

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom: "2rem" }}>
        <div className="card-stat"><div className="stat-value">{counts.total}</div><div className="stat-label">Łącznie</div></div>
        <div className="card-stat"><div className="stat-value" style={{ color: "var(--success)" }}>{counts.active}</div><div className="stat-label">Aktywni</div></div>
        <div className="card-stat"><div className="stat-value" style={{ color: "var(--warning)" }}>{counts.pending}</div><div className="stat-label">Oczekujący</div></div>
        <div className="card-stat">
          <div className="stat-value" style={{ color: "var(--text-muted)" }}>{unassignedSpots.length}</div>
          <div className="stat-label">Wolne miejsca</div>
        </div>
      </div>

      {users.length === 0 ? (
        <div className="card" style={{ textAlign: "center", padding: "3rem", color: "var(--text-muted)" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "0.75rem", opacity: 0.4 }}><UserPlusIcon size={48} /></div>
          <p>Brak mieszkańców. Dodaj lub zaimportuj.</p>
        </div>
      ) : (
        <div className="card" style={{ padding: 0, overflow: "hidden" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.875rem" }}>
            <thead>
              <tr>
                {["Imię i nazwisko", "Email", "Miejsca parkingowe", "Status", "Dołączył"].map((h) => (
                  <th key={h} style={{ textAlign: "left", padding: "0.875rem 1.25rem", background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", color: "var(--text-secondary)", fontWeight: 600, fontSize: "0.75rem", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <UserRow
                  key={u.id}
                  user={u}
                  unassignedSpots={unassignedSpots}
                  activeEstateId={activeEstateId}
                />
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
