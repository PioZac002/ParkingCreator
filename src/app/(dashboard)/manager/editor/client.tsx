"use client";

import dynamic from "next/dynamic";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc";
import { useEditorStore } from "@/components/parking-editor/store";
import { EditorToolbar } from "@/components/parking-editor/Toolbar";
import { useStore } from "zustand";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { TrashIcon } from "@/components/ui/Icons";

// Konva must be loaded client-side (no SSR)
const ParkingCanvas = dynamic(
  () => import("@/components/parking-editor/Canvas").then((m) => m.ParkingCanvas),
  { ssr: false, loading: () => <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>Ładowanie edytora...</div> }
);

type ManagedEstate = { id: string; name: string };
type LayoutSummary = { id: string; name: string; zone: string | null };
type FullLayout = {
  id: string;
  name: string;
  zone: string | null;
  gridWidth: number;
  gridHeight: number;
  gridData: unknown;
  spots: {
    id: string; number: string; type: string;
    posX: number; posY: number; width: number; height: number; rotation: number;
  }[];
} | null;

export function EditorClient({
  estateId,
  managedEstates,
  activeEstateId,
  existingLayout,
  layouts,
}: {
  estateId: string;
  managedEstates: ManagedEstate[];
  activeEstateId: string;
  existingLayout: FullLayout;
  layouts: LayoutSummary[];
}) {
  const router = useRouter();
  const { init, isDirty, spots, obstacles, layoutId, layoutName, zone, markSaved } = useEditorStore();
  const temporalStore = useStore(useEditorStore.temporal);

  const [showNewForm, setShowNewForm] = useState(!existingLayout && layouts.length === 0);
  const [newName, setNewName] = useState("");
  const [newZone, setNewZone] = useState("A");
  const [newW, setNewW] = useState(30);
  const [newH, setNewH] = useState(20);
  const [useAutoLayout, setUseAutoLayout] = useState(false);
  const [spotCount, setSpotCount] = useState(20);

  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const createLayout = trpc.layout.create.useMutation({
    onSuccess: (layout) => {
      router.push(`/manager/editor?estateId=${activeEstateId}&layoutId=${layout.id}`);
    },
  });

  const generateLayout = trpc.layout.generateLayout.useMutation({
    onSuccess: (layout) => {
      router.push(`/manager/editor?estateId=${activeEstateId}&layoutId=${layout.id}`);
    },
  });

  const saveLayout = trpc.layout.save.useMutation({
    onSuccess: () => markSaved(),
  });

  const deleteLayout = trpc.layout.delete.useMutation({
    onSuccess: () => {
      router.push(`/manager/editor?estateId=${activeEstateId}`);
    },
  });

  // Init store when layout loads
  useEffect(() => {
    if (existingLayout) {
      const gd = existingLayout.gridData as { obstacles?: unknown[] } | null;
      init({
        layoutId: existingLayout.id,
        estateId: activeEstateId,
        name: existingLayout.name,
        zone: existingLayout.zone ?? "A",
        gridWidth: existingLayout.gridWidth,
        gridHeight: existingLayout.gridHeight,
        spots: existingLayout.spots.map((s) => ({
          id: s.id,
          number: s.number,
          type: s.type as import("@/components/parking-editor/store").SpotType,
          posX: s.posX,
          posY: s.posY,
          width: s.width,
          height: s.height,
          rotation: s.rotation,
        })),
        obstacles: (gd?.obstacles ?? []) as import("@/components/parking-editor/store").Obstacle[],
      });
    }
  }, [existingLayout, activeEstateId, init]);

  const handleSave = () => {
    if (!layoutId) return;
    saveLayout.mutate({
      layoutId,
      gridData: { obstacles },
      spots,
    });
  };

  const handleCreate = () => {
    if (useAutoLayout) {
      generateLayout.mutate({ estateId: activeEstateId, name: newName, zone: newZone || undefined, spotCount });
    } else {
      createLayout.mutate({ estateId: activeEstateId, name: newName, zone: newZone, gridWidth: newW, gridHeight: newH });
    }
  };

  const isPending = createLayout.isPending || generateLayout.isPending;

  // Warn before leaving with unsaved changes
  useEffect(() => {
    const handler = (e: BeforeUnloadEvent) => {
      if (isDirty) { e.preventDefault(); e.returnValue = ""; }
    };
    window.addEventListener("beforeunload", handler);
    return () => window.removeEventListener("beforeunload", handler);
  }, [isDirty]);

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "calc(100vh - 0px)" }}>
      {/* Top bar */}
      <div style={{ background: "var(--bg-secondary)", borderBottom: "1px solid var(--border-color)", padding: "0.625rem 1.25rem", display: "flex", alignItems: "center", gap: "1rem", flexShrink: 0 }}>
        <h1 style={{ fontWeight: 700, fontSize: "1rem", marginRight: "0.5rem" }}>
          {layoutName || "Kreator parkingu"}
          {zone && <span style={{ marginLeft: "0.5rem", fontSize: "0.75rem", color: "var(--text-muted)" }}>Strefa {zone}</span>}
        </h1>

        {/* Layout selector */}
        {layouts.length > 0 && (
          <div style={{ display: "flex", gap: "0.375rem", alignItems: "center" }}>
            <span style={{ fontSize: "0.75rem", color: "var(--text-muted)" }}>Layout:</span>
            <select
              className="input"
              style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem", width: "auto" }}
              value={existingLayout?.id ?? ""}
              onChange={(e) => {
                if (e.target.value) router.push(`/manager/editor?estateId=${activeEstateId}&layoutId=${e.target.value}`);
              }}
            >
              <option value="">-- wybierz --</option>
              {layouts.map((l) => <option key={l.id} value={l.id}>{l.name}{l.zone ? ` (${l.zone})` : ""}</option>)}
            </select>

            {/* Delete layout button */}
            {existingLayout && (
              <button
                className="btn btn-ghost btn-sm"
                style={{ color: "var(--danger)", padding: "0.375rem 0.5rem" }}
                title="Usuń layout"
                onClick={() => setShowDeleteConfirm(true)}
              >
                <TrashIcon size={15} />
              </button>
            )}
          </div>
        )}

        <button
          className="btn btn-secondary btn-sm"
          onClick={() => setShowNewForm(true)}
          style={{ marginLeft: "auto" }}
        >
          + Nowy layout
        </button>

        {managedEstates.length > 1 && (
          <select
            className="input"
            style={{ padding: "0.375rem 0.625rem", fontSize: "0.8125rem", width: "auto" }}
            value={activeEstateId}
            onChange={(e) => router.push(`/manager/editor?estateId=${e.target.value}`)}
          >
            {managedEstates.map((e) => <option key={e.id} value={e.id}>{e.name}</option>)}
          </select>
        )}
      </div>

      {/* New layout form */}
      {showNewForm && (
        <div style={{ background: "var(--bg-card)", borderBottom: "1px solid var(--border-color)", padding: "1rem 1.25rem" }} className="animate-fade-in">
          {/* Mode switcher */}
          <div style={{ display: "flex", gap: "0.5rem", marginBottom: "1rem" }}>
            <button
              className={`btn btn-sm ${!useAutoLayout ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setUseAutoLayout(false)}
            >
              Pusta siatka
            </button>
            <button
              className={`btn btn-sm ${useAutoLayout ? "btn-primary" : "btn-ghost"}`}
              onClick={() => setUseAutoLayout(true)}
            >
              ✨ Automatyczny układ
            </button>
          </div>

          <div style={{ display: "flex", gap: "1rem", alignItems: "flex-end", flexWrap: "wrap" }}>
            <div>
              <label className="label">Nazwa layoutu</label>
              <input className="input" style={{ width: "200px" }} placeholder="Parking zewnętrzny" value={newName} onChange={(e) => setNewName(e.target.value)} />
            </div>
            <div>
              <label className="label">Strefa</label>
              <input className="input" style={{ width: "80px" }} placeholder="A" value={newZone} onChange={(e) => setNewZone(e.target.value.toUpperCase().slice(0, 3))} />
            </div>

            {useAutoLayout ? (
              <div>
                <label className="label">Liczba miejsc</label>
                <input
                  className="input"
                  style={{ width: "110px" }}
                  type="number"
                  min={1}
                  max={200}
                  placeholder="np. 20"
                  value={spotCount}
                  onChange={(e) => setSpotCount(Math.min(200, Math.max(1, Number(e.target.value))))}
                />
              </div>
            ) : (
              <>
                <div>
                  <label className="label">Szerokość (komórki)</label>
                  <input className="input" style={{ width: "90px" }} type="number" min={10} max={100} value={newW} onChange={(e) => setNewW(Number(e.target.value))} />
                </div>
                <div>
                  <label className="label">Wysokość (komórki)</label>
                  <input className="input" style={{ width: "90px" }} type="number" min={10} max={100} value={newH} onChange={(e) => setNewH(Number(e.target.value))} />
                </div>
              </>
            )}

            <div style={{ display: "flex", gap: "0.5rem" }}>
              <button
                className="btn btn-primary"
                disabled={!newName || isPending}
                onClick={handleCreate}
              >
                {isPending ? "Tworzenie..." : useAutoLayout ? `Generuj ${spotCount} miejsc` : "Utwórz layout"}
              </button>
              {layouts.length > 0 && <button className="btn btn-ghost" onClick={() => setShowNewForm(false)}>Anuluj</button>}
            </div>
          </div>
        </div>
      )}

      {/* Editor area */}
      {existingLayout ? (
        <div style={{ display: "flex", flex: 1, overflow: "hidden" }}>
          <EditorToolbar
            onSave={handleSave}
            onUndo={() => temporalStore.undo()}
            onRedo={() => temporalStore.redo()}
            saving={saveLayout.isPending}
            canUndo={temporalStore.pastStates.length > 0}
            canRedo={temporalStore.futureStates.length > 0}
          />
          <ParkingCanvas />
        </div>
      ) : !showNewForm ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "1rem", color: "var(--text-muted)" }}>
          <div style={{ fontSize: "3rem" }}>🗺️</div>
          <p style={{ fontWeight: 600 }}>Wybierz lub utwórz layout parkingu</p>
          <button className="btn btn-primary" onClick={() => setShowNewForm(true)}>+ Nowy layout</button>
        </div>
      ) : null}

      {/* Confirm delete layout */}
      <ConfirmDialog
        open={showDeleteConfirm}
        title="Usuń layout"
        message={`Czy na pewno chcesz usunąć layout "${existingLayout?.name}"? Zostaną usunięte wszystkie miejsca parkingowe i powiązane rezerwacje.`}
        danger
        confirmLabel="Tak, usuń layout"
        onConfirm={() => existingLayout && deleteLayout.mutate({ id: existingLayout.id })}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </div>
  );
}
