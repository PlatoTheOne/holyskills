import { useEffect, useMemo, useRef, useState } from "react";

export interface NeoSelectOption {
  value: string;
  label: string;
}

interface NeoSelectProps {
  value: string;
  options: NeoSelectOption[];
  onChange: (value: string) => void;
  ariaLabel: string;
}

export function NeoSelect({ value, options, onChange, ariaLabel }: NeoSelectProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement | null>(null);

  const active = useMemo(() => {
    return options.find((item) => item.value === value) ?? options[0];
  }, [options, value]);

  useEffect(() => {
    const onClickOutside = (event: MouseEvent) => {
      if (!rootRef.current) {
        return;
      }
      if (rootRef.current.contains(event.target as Node)) {
        return;
      }
      setOpen(false);
    };

    window.addEventListener("mousedown", onClickOutside);
    return () => {
      window.removeEventListener("mousedown", onClickOutside);
    };
  }, []);

  return (
    <div className={`neo-select ${open ? "open" : ""}`} ref={rootRef}>
      <button
        type="button"
        className="neo-select-trigger"
        aria-label={ariaLabel}
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{active?.label ?? ""}</span>
        <span className="neo-select-caret" aria-hidden="true">v</span>
      </button>

      {open && (
        <div className="neo-select-menu" role="listbox" aria-label={ariaLabel}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              className={`neo-select-option ${option.value === value ? "active" : ""}`}
              role="option"
              aria-selected={option.value === value}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

