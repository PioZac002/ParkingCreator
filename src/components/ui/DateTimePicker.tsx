"use client";

import { useRef } from "react";
import { CalendarIcon } from "./Icons";

type DateTimePickerProps = {
  value: string;
  onChange: (value: string) => void;
  min?: string;
  max?: string;
  label?: string;
  className?: string;
};

export function DateTimePicker({ value, onChange, min, max, label, className }: DateTimePickerProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className={className}>
      {label && <label className="label">{label}</label>}
      <div style={{ position: "relative", display: "inline-flex", width: "100%" }}>
        <input
          ref={inputRef}
          className="input"
          type="datetime-local"
          value={value}
          min={min}
          max={max}
          onChange={(e) => onChange(e.target.value)}
          style={{ paddingRight: "2.5rem", width: "100%" }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.showPicker?.()}
          style={{
            position: "absolute",
            right: "0.625rem",
            top: "50%",
            transform: "translateY(-50%)",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            padding: 0,
            transition: "color 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.color = "var(--accent-primary)")}
          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--text-muted)")}
          tabIndex={-1}
          aria-label="Otwórz kalendarz"
        >
          <CalendarIcon size={16} />
        </button>
      </div>
    </div>
  );
}
