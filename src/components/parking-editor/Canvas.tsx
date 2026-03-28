"use client";

import { useRef, useEffect, useCallback } from "react";
import { Stage, Layer, Rect, Text, Group, Line } from "react-konva";
import type Konva from "konva";
import { useEditorStore, type ParkingSpot, type Obstacle } from "./store";

const SPOT_COLORS: Record<string, string> = {
  STANDARD: "#2563eb",
  DISABLED: "#60a5fa",
  ELECTRIC: "#00b894",
  RESERVED: "#fdcb6e",
};

const OBSTACLE_COLORS: Record<string, string> = {
  wall: "#636e72",
  road: "#2d3436",
  pillar: "#b2bec3",
  zone: "#dfe6e9",
};

function SpotShape({
  spot,
  cellSize,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  spot: ParkingSpot;
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (posX: number, posY: number) => void;
}) {
  const x = spot.posX * cellSize;
  const y = spot.posY * cellSize;
  const w = spot.width * cellSize;
  const h = spot.height * cellSize;
  const color = SPOT_COLORS[spot.type] ?? "#2563eb";

  return (
    <Group
      x={x}
      y={y}
      rotation={spot.rotation}
      offsetX={spot.rotation !== 0 ? w / 2 : 0}
      offsetY={spot.rotation !== 0 ? h / 2 : 0}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const node = e.target;
        const posX = Math.round(node.x() / cellSize * 2) / 2;
        const posY = Math.round(node.y() / cellSize * 2) / 2;
        node.position({ x: posX * cellSize, y: posY * cellSize });
        onDragEnd(posX, posY);
      }}
    >
      <Rect
        width={w}
        height={h}
        fill={color + "33"}
        stroke={isSelected ? "#ffffff" : color}
        strokeWidth={isSelected ? 2.5 : 1.5}
        cornerRadius={3}
        shadowEnabled={isSelected}
        shadowColor={color}
        shadowBlur={12}
        shadowOpacity={0.6}
      />
      {/* Parking lines */}
      <Line points={[w * 0.1, h * 0.1, w * 0.1, h * 0.9]} stroke={color} strokeWidth={1} opacity={0.4} />
      <Line points={[w * 0.9, h * 0.1, w * 0.9, h * 0.9]} stroke={color} strokeWidth={1} opacity={0.4} />
      <Text
        text={spot.number}
        x={2}
        y={h / 2 - 6}
        width={w - 4}
        align="center"
        fontSize={Math.min(11, cellSize * 0.35)}
        fill={color}
        fontStyle="bold"
      />
    </Group>
  );
}

function ObstacleShape({
  obs,
  cellSize,
  isSelected,
  onSelect,
  onDragEnd,
}: {
  obs: Obstacle;
  cellSize: number;
  isSelected: boolean;
  onSelect: () => void;
  onDragEnd: (x: number, y: number) => void;
}) {
  const x = obs.x * cellSize;
  const y = obs.y * cellSize;
  const w = obs.width * cellSize;
  const h = obs.height * cellSize;
  const color = OBSTACLE_COLORS[obs.type] ?? "#636e72";

  return (
    <Group
      x={x} y={y}
      draggable
      onClick={onSelect}
      onTap={onSelect}
      onDragEnd={(e) => {
        const node = e.target;
        const nx = Math.round(node.x() / cellSize * 2) / 2;
        const ny = Math.round(node.y() / cellSize * 2) / 2;
        node.position({ x: nx * cellSize, y: ny * cellSize });
        onDragEnd(nx, ny);
      }}
    >
      <Rect
        width={Math.max(w, 4)}
        height={Math.max(h, 4)}
        fill={color + (obs.type === "road" ? "88" : "cc")}
        stroke={isSelected ? "#ffffff" : color}
        strokeWidth={isSelected ? 2 : 1}
        cornerRadius={obs.type === "pillar" ? 2 : 0}
      />
      {obs.label && (
        <Text text={obs.label} x={2} y={h / 2 - 6} width={w - 4} align="center" fontSize={10} fill="#fff" />
      )}
    </Group>
  );
}

export function ParkingCanvas() {
  const {
    gridWidth, gridHeight, spots, obstacles,
    selectedId, activeTool, cellSize,
    setSelected, addSpot, moveSpot, moveObstacle, addObstacle, deleteSelected,
  } = useEditorStore();

  const stageRef = useRef<Konva.Stage | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const canvasW = gridWidth * cellSize;
  const canvasH = gridHeight * cellSize;

  // Keyboard shortcuts
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Delete" || e.key === "Backspace") deleteSelected();
      if (e.key === "Escape") setSelected(null);
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [deleteSelected, setSelected]);

  const handleStageClick = useCallback(
    (e: Konva.KonvaEventObject<MouseEvent>) => {
      const stage = e.target.getStage();
      if (!stage) return;
      const pos = stage.getPointerPosition();
      if (!pos) return;

      const posX = Math.floor(pos.x / cellSize * 2) / 2;
      const posY = Math.floor(pos.y / cellSize * 2) / 2;

      if (e.target === stage || e.target.name() === "bg") {
        if (activeTool === "select" || activeTool === "delete") {
          setSelected(null);
          return;
        }
        if (activeTool === "spot") {
          addSpot(posX, posY);
        } else if (activeTool === "road") {
          addObstacle("road", posX, posY, 10, 2);
        } else if (activeTool === "wall") {
          addObstacle("wall", posX, posY, 10, 0.5);
        } else if (activeTool === "pillar") {
          addObstacle("pillar", posX, posY, 1, 1);
        }
      }
    },
    [activeTool, cellSize, addSpot, addObstacle, setSelected]
  );

  // Grid lines
  const gridLines: React.ReactNode[] = [];
  for (let x = 0; x <= gridWidth; x++) {
    gridLines.push(
      <Line key={`v${x}`} points={[x * cellSize, 0, x * cellSize, canvasH]} stroke="#1f1f30" strokeWidth={1} />
    );
  }
  for (let y = 0; y <= gridHeight; y++) {
    gridLines.push(
      <Line key={`h${y}`} points={[0, y * cellSize, canvasW, y * cellSize]} stroke="#1f1f30" strokeWidth={1} />
    );
  }

  const cursorMap: Record<string, string> = {
    select: "default",
    spot: "crosshair",
    road: "crosshair",
    wall: "crosshair",
    pillar: "crosshair",
    delete: "not-allowed",
  };

  return (
    <div
      ref={containerRef}
      style={{ flex: 1, overflow: "auto", background: "var(--bg-primary)", cursor: cursorMap[activeTool] }}
    >
      <div style={{ padding: "16px" }}>
        <Stage
          ref={stageRef}
          width={canvasW}
          height={canvasH}
          onClick={handleStageClick}
        >
          {/* Background */}
          <Layer>
            <Rect name="bg" x={0} y={0} width={canvasW} height={canvasH} fill="#0f172a" />
            {gridLines}
          </Layer>

          {/* Obstacles */}
          <Layer>
            {obstacles.map((obs) => (
              <ObstacleShape
                key={obs.id}
                obs={obs}
                cellSize={cellSize}
                isSelected={selectedId === obs.id}
                onSelect={() => {
                  if (activeTool === "delete") {
                    useEditorStore.getState().setSelected(obs.id);
                    deleteSelected();
                  } else {
                    setSelected(obs.id);
                  }
                }}
                onDragEnd={(x, y) => moveObstacle(obs.id, x, y)}
              />
            ))}
          </Layer>

          {/* Parking spots */}
          <Layer>
            {spots.map((spot) => (
              <SpotShape
                key={spot.id}
                spot={spot}
                cellSize={cellSize}
                isSelected={selectedId === spot.id}
                onSelect={() => {
                  if (activeTool === "delete") {
                    useEditorStore.getState().setSelected(spot.id);
                    deleteSelected();
                  } else {
                    setSelected(spot.id);
                  }
                }}
                onDragEnd={(posX, posY) => moveSpot(spot.id, posX, posY)}
              />
            ))}
          </Layer>
        </Stage>
      </div>
    </div>
  );
}
