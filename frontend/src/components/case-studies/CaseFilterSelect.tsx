'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { HiOutlineCheck, HiOutlineChevronDown } from 'react-icons/hi2';

type Option = { value: string; label: string };

// Uses the site's inquiry dropdown pattern while retaining the existing GET form.
export function CaseFilterSelect({
  name,
  label,
  value,
  options,
}: {
  name: string;
  label: string;
  value: string;
  options: Option[];
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const input = useRef<HTMLInputElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const [enhanced, setEnhanced] = useState(false);
  const [open, setOpen] = useState(false);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [active, setActive] = useState(selected);
  const [placement, setPlacement] = useState({ above: false, height: 320 });

  useEffect(() => setEnhanced(true), []);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!root.current?.contains(event.target as Node)) setOpen(false);
    };
    const resize = () => setOpen(false);
    document.addEventListener('pointerdown', outside);
    window.addEventListener('resize', resize);
    return () => {
      document.removeEventListener('pointerdown', outside);
      window.removeEventListener('resize', resize);
    };
  }, [open]);
  useEffect(() => {
    if (!open) return;
    const item = items.current[active];
    const list = menu.current;
    item?.focus({ preventScroll: true });
    if (item && list) {
      const top = item.offsetTop;
      if (top < list.scrollTop) list.scrollTop = top;
      else if (top + item.offsetHeight > list.scrollTop + list.clientHeight)
        list.scrollTop = top + item.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  function show(index = selected) {
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 100;
      const flip = below < 180 && above > below;
      setPlacement({ above: flip, height: Math.max(80, Math.min(320, flip ? above : below)) });
    }
    setActive(index);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
  }
  function choose(option: Option) {
    close();
    if (option.value === value || !input.current) return;
    input.current.value = option.value;
    input.current.form?.requestSubmit();
  }
  function keys(event: KeyboardEvent) {
    const movement: Record<string, number> = {
      ArrowDown: Math.min(options.length - 1, active + 1),
      ArrowUp: Math.max(0, active - 1),
      Home: 0,
      End: options.length - 1,
    };
    if (event.key in movement) {
      event.preventDefault();
      setActive(movement[event.key]);
    } else if (event.key === 'Escape') {
      event.preventDefault();
      close();
    } else if (event.key === 'Tab') {
      // Restore the trigger before normal Tab movement to the next field.
      close();
    }
  }

  if (!enhanced)
    return (
      <select name={name} form="case-search-form" defaultValue={value} aria-label={label}>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    );

  return (
    <div
      ref={root}
      className="case-select"
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <input ref={input} type="hidden" name={name} form="case-search-form" defaultValue={value} />
      <button
        ref={trigger}
        type="button"
        className="case-select-trigger"
        aria-label={`${label}：${options[selected]?.label ?? value}`}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-controls={open ? id : undefined}
        onClick={() => (open ? close() : show())}
        onKeyDown={(event) => {
          if (['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) {
            event.preventDefault();
            show(event.key === 'Home' ? 0 : event.key === 'End' ? options.length - 1 : selected);
          }
        }}
      >
        <span>{options[selected]?.label ?? value}</span>
        <HiOutlineChevronDown aria-hidden="true" />
      </button>
      {open && (
        <div
          ref={menu}
          id={id}
          role="listbox"
          aria-label={label}
          className="case-select-menu"
          data-above={placement.above || undefined}
          style={{ maxHeight: placement.height }}
          onKeyDown={keys}
        >
          {options.map((option, index) => (
            <button
              key={option.value}
              ref={(element) => {
                items.current[index] = element;
              }}
              type="button"
              role="option"
              aria-selected={option.value === value}
              tabIndex={index === active ? 0 : -1}
              className="case-select-option"
              onFocus={() => setActive(index)}
              onClick={() => choose(option)}
            >
              <span>{option.label}</span>
              {option.value === value && <HiOutlineCheck aria-hidden="true" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
