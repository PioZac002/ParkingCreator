import type { CSSProperties } from "react";

type IconProps = {
  size?: number;
  className?: string;
  style?: CSSProperties;
};

const defaults = { size: 20, fill: "none", stroke: "currentColor", strokeWidth: 1.5, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };

export function LayoutDashboardIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="3" width="7" height="7" rx="1" />
      <rect x="14" y="14" width="7" height="7" rx="1" />
      <rect x="3" y="14" width="7" height="7" rx="1" />
    </svg>
  );
}

export function UsersIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  );
}

export function ImportIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
      <polyline points="7 10 12 15 17 10" />
      <line x1="12" y1="15" x2="12" y2="3" />
    </svg>
  );
}

export function MapIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21" />
      <line x1="9" y1="3" x2="9" y2="18" />
      <line x1="15" y1="6" x2="15" y2="21" />
    </svg>
  );
}

export function CalendarIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </svg>
  );
}

export function BuildingIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="1" />
      <path d="M3 9h18" />
      <path d="M9 21V9" />
    </svg>
  );
}

export function ParkingIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="3" width="18" height="18" rx="2" />
      <path d="M9 17V7h4a3 3 0 0 1 0 6H9" />
    </svg>
  );
}

export function LogOutIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
      <polyline points="16 17 21 12 16 7" />
      <line x1="21" y1="12" x2="9" y2="12" />
    </svg>
  );
}

export function PlusIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <line x1="12" y1="5" x2="12" y2="19" />
      <line x1="5" y1="12" x2="19" y2="12" />
    </svg>
  );
}

export function TrashIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="3 6 5 6 21 6" />
      <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
      <path d="M10 11v6" />
      <path d="M14 11v6" />
      <path d="M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2" />
    </svg>
  );
}

export function ChevronDownIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

export function XIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

export function CheckIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

export function AlertIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  );
}

export function CrownIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M2 18h20" />
      <path d="M2 18l3-9 5 5 2-8 2 8 5-5 3 9" />
    </svg>
  );
}

export function ManagerIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M5 21V7l7-4 7 4v14" />
      <path d="M9 21v-4a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v4" />
    </svg>
  );
}

export function HomeIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
      <polyline points="9 22 9 12 15 12 15 22" />
    </svg>
  );
}

export function EstateIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 21h18" />
      <path d="M9 8h1" /><path d="M9 12h1" /><path d="M9 16h1" />
      <path d="M14 8h1" /><path d="M14 12h1" /><path d="M14 16h1" />
      <path d="M5 21V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v16" />
    </svg>
  );
}

export function UserPlusIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="8.5" cy="7" r="4" />
      <line x1="20" y1="8" x2="20" y2="14" />
      <line x1="23" y1="11" x2="17" y2="11" />
    </svg>
  );
}

export function CarIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M5 17H3a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2h1l2-4h12l2 4h1a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2h-2" />
      <circle cx="7" cy="17" r="2" />
      <circle cx="17" cy="17" r="2" />
    </svg>
  );
}

export function WheelchairIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <circle cx="12" cy="4.5" r="1.5" />
      <path d="M10.5 8h3l1 5.5H9.5z" />
      <path d="M9.5 13.5L8.5 19" />
      <path d="M14.5 13.5l1 3.5h3" />
      <circle cx="9" cy="21" r="2" />
    </svg>
  );
}

export function ZapIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="13 2 3 14 12 14 11 22 21 10 12 10 13 2" />
    </svg>
  );
}

export function LockIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" />
    </svg>
  );
}

export function SearchIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <circle cx="11" cy="11" r="8" />
      <line x1="21" y1="21" x2="16.65" y2="16.65" />
    </svg>
  );
}

export function ClipboardListIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
      <rect x="8" y="2" width="8" height="4" rx="1" ry="1" />
      <line x1="9" y1="12" x2="15" y2="12" />
      <line x1="9" y1="16" x2="12" y2="16" />
    </svg>
  );
}

export function InboxIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="22 12 16 12 14 15 10 15 8 12 2 12" />
      <path d="M5.45 5.11L2 12v3a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-3l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z" />
    </svg>
  );
}

export function UndoIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="9 14 4 9 9 4" />
      <path d="M20 20v-7a4 4 0 0 0-4-4H4" />
    </svg>
  );
}

export function RedoIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="15 14 20 9 15 4" />
      <path d="M4 20v-7a4 4 0 0 1 4-4h12" />
    </svg>
  );
}

export function SaveIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z" />
      <polyline points="17 21 17 13 7 13 7 21" />
      <polyline points="7 3 7 8 15 8" />
    </svg>
  );
}

export function CursorIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M4 4l7.07 17 2.51-7.39L21 11.07z" />
    </svg>
  );
}

export function RoadIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M3 21l5-18M21 21l-5-18" />
      <path d="M10 9h4M9 13h6M8 17h8" />
    </svg>
  );
}

export function WallIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="3" y="6" width="18" height="12" rx="1" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="9" y1="6" x2="9" y2="12" />
      <line x1="15" y1="12" x2="15" y2="18" />
    </svg>
  );
}

export function PillarIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <rect x="7" y="3" width="10" height="18" rx="1" />
      <line x1="5" y1="3" x2="19" y2="3" />
      <line x1="5" y1="21" x2="19" y2="21" />
    </svg>
  );
}

export function RotateCwIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <polyline points="23 4 23 10 17 10" />
      <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
    </svg>
  );
}

export function MapPinIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
      <circle cx="12" cy="10" r="3" />
    </svg>
  );
}

export function MenuIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <line x1="3" y1="6" x2="21" y2="6" />
      <line x1="3" y1="12" x2="21" y2="12" />
      <line x1="3" y1="18" x2="21" y2="18" />
    </svg>
  );
}

export function SunIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <circle cx="12" cy="12" r="5" />
      <line x1="12" y1="1" x2="12" y2="3" />
      <line x1="12" y1="21" x2="12" y2="23" />
      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
      <line x1="1" y1="12" x2="3" y2="12" />
      <line x1="21" y1="12" x2="23" y2="12" />
      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
    </svg>
  );
}

export function MoonIcon({ size = defaults.size, className, style }: IconProps) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={defaults.fill} stroke={defaults.stroke} strokeWidth={defaults.strokeWidth} strokeLinecap={defaults.strokeLinecap} strokeLinejoin={defaults.strokeLinejoin} className={className} style={style}>
      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
    </svg>
  );
}
