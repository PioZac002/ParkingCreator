import { create } from "zustand";
import { temporal } from "zundo";
import { v4 as uuid } from "uuid";

export type SpotType = "STANDARD" | "DISABLED" | "ELECTRIC" | "RESERVED";
export type ObstacleType = "wall" | "road" | "pillar" | "zone";
export type Tool = "select" | "spot" | "road" | "wall" | "pillar" | "zone" | "delete";

export type ParkingSpot = {
  id: string;
  number: string;
  type: SpotType;
  posX: number;
  posY: number;
  width: number;
  height: number;
  rotation: number;
};

export type Obstacle = {
  id: string;
  type: ObstacleType;
  x: number;
  y: number;
  width: number;
  height: number;
  label?: string;
};

type EditorState = {
  layoutId: string | null;
  estateId: string | null;
  layoutName: string;
  zone: string;
  gridWidth: number;
  gridHeight: number;
  spots: ParkingSpot[];
  obstacles: Obstacle[];
  selectedId: string | null;
  activeTool: Tool;
  spotPrefix: string;
  cellSize: number;
  isDirty: boolean;
};

type EditorActions = {
  init: (params: {
    layoutId: string;
    estateId: string;
    name: string;
    zone: string;
    gridWidth: number;
    gridHeight: number;
    spots: ParkingSpot[];
    obstacles: Obstacle[];
  }) => void;
  setTool: (tool: Tool) => void;
  setSelected: (id: string | null) => void;
  addSpot: (posX: number, posY: number) => void;
  moveSpot: (id: string, posX: number, posY: number) => void;
  rotateSpot: (id: string) => void;
  changeSpotType: (id: string, type: SpotType) => void;
  renumberSpots: () => void;
  deleteSelected: () => void;
  addObstacle: (type: ObstacleType, x: number, y: number, width: number, height: number) => void;
  moveObstacle: (id: string, x: number, y: number) => void;
  setSpotPrefix: (prefix: string) => void;
  setCellSize: (size: number) => void;
  markSaved: () => void;
};

const DEFAULT_SPOT_W = 2.5;
const DEFAULT_SPOT_H = 5;

function nextNumber(spots: ParkingSpot[], prefix: string): string {
  const nums = spots
    .filter((s) => s.number.startsWith(prefix + "-"))
    .map((s) => parseInt(s.number.replace(prefix + "-", ""), 10))
    .filter((n) => !isNaN(n));
  const next = nums.length === 0 ? 1 : Math.max(...nums) + 1;
  return `${prefix}-${String(next).padStart(2, "0")}`;
}

export const useEditorStore = create<EditorState & EditorActions>()(
  temporal(
    (set, get) => ({
      layoutId: null,
      estateId: null,
      layoutName: "",
      zone: "A",
      gridWidth: 30,
      gridHeight: 20,
      spots: [],
      obstacles: [],
      selectedId: null,
      activeTool: "select",
      spotPrefix: "A",
      cellSize: 32,
      isDirty: false,

      init: ({ layoutId, estateId, name, zone, gridWidth, gridHeight, spots, obstacles }) =>
        set({ layoutId, estateId, layoutName: name, zone, gridWidth, gridHeight, spots, obstacles, spotPrefix: zone || "A", isDirty: false, selectedId: null }),

      setTool: (tool) => set({ activeTool: tool, selectedId: null }),
      setSelected: (id) => set({ selectedId: id }),

      addSpot: (posX, posY) => {
        const { spots, spotPrefix } = get();
        const number = nextNumber(spots, spotPrefix);
        const newSpot: ParkingSpot = {
          id: uuid(),
          number,
          type: "STANDARD",
          posX,
          posY,
          width: DEFAULT_SPOT_W,
          height: DEFAULT_SPOT_H,
          rotation: 0,
        };
        set({ spots: [...spots, newSpot], selectedId: newSpot.id, isDirty: true });
      },

      moveSpot: (id, posX, posY) =>
        set((s) => ({
          spots: s.spots.map((sp) => (sp.id === id ? { ...sp, posX, posY } : sp)),
          isDirty: true,
        })),

      rotateSpot: (id) =>
        set((s) => ({
          spots: s.spots.map((sp) =>
            sp.id === id ? { ...sp, rotation: (sp.rotation + 90) % 360 } : sp
          ),
          isDirty: true,
        })),

      changeSpotType: (id, type) =>
        set((s) => ({
          spots: s.spots.map((sp) => (sp.id === id ? { ...sp, type } : sp)),
          isDirty: true,
        })),

      renumberSpots: () => {
        const { spots, spotPrefix } = get();
        const renumbered = spots.map((sp, i) => ({
          ...sp,
          number: `${spotPrefix}-${String(i + 1).padStart(2, "0")}`,
        }));
        set({ spots: renumbered, isDirty: true });
      },

      deleteSelected: () => {
        const { selectedId, spots, obstacles } = get();
        if (!selectedId) return;
        set({
          spots: spots.filter((s) => s.id !== selectedId),
          obstacles: obstacles.filter((o) => o.id !== selectedId),
          selectedId: null,
          isDirty: true,
        });
      },

      addObstacle: (type, x, y, width, height) => {
        const obs: Obstacle = { id: uuid(), type, x, y, width, height };
        set((s) => ({ obstacles: [...s.obstacles, obs], selectedId: obs.id, isDirty: true }));
      },

      moveObstacle: (id, x, y) =>
        set((s) => ({
          obstacles: s.obstacles.map((o) => (o.id === id ? { ...o, x, y } : o)),
          isDirty: true,
        })),

      setSpotPrefix: (prefix) => set({ spotPrefix: prefix }),
      setCellSize: (size) => set({ cellSize: size }),
      markSaved: () => set({ isDirty: false }),
    }),
    { limit: 50 }
  )
);
