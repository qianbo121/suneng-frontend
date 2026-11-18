'use client';

import { useEffect, useId, useRef, useState, type KeyboardEvent } from 'react';
import { HiOutlineCheck, HiOutlineChevronDown } from 'react-icons/hi2';
import styles from './NewsFilterSelect.module.css';

type Option = { value: string; label: string };

// Uses the existing site dropdown pattern with controlled list navigation.
export function NewsFilterSelect({
  name,
  label,
  value,
  options,
  disabled = false,
  align = 'start',
  onChange,
}: {
  name: string;
  label: string;
  value: string;
  options: Option[];
  disabled?: boolean;
  align?: 'start' | 'end';
  onChange: (value: string) => void;
}) {
  const id = useId();
  const root = useRef<HTMLDivElement>(null);
  const trigger = useRef<HTMLButtonElement>(null);
  const menu = useRef<HTMLDivElement>(null);
  const items = useRef<(HTMLButtonElement | null)[]>([]);
  const selected = Math.max(
    0,
    options.findIndex((option) => option.value === value),
  );
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(selected);
  const [placement, setPlacement] = useState({ above: false, height: 320 });

  useEffect(() => {
    if (disabled) setOpen(false);
  }, [disabled]);
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
      if (item.offsetTop < list.scrollTop) list.scrollTop = item.offsetTop;
      else if (item.offsetTop + item.offsetHeight > list.scrollTop + list.clientHeight)
        list.scrollTop = item.offsetTop + item.offsetHeight - list.clientHeight;
    }
  }, [open, active]);

  function show(index = selected) {
    if (disabled || !options.length) return;
    const rect = trigger.current?.getBoundingClientRect();
    if (rect) {
      const below = window.innerHeight - rect.bottom - 16;
      const above = rect.top - 100;
      const flip = below < Math.min(320, options.length * 44 + 12) && above > below;
      setPlacement({ above: flip, height: Math.max(80, Math.min(320, flip ? above : below)) });
    }
    setActive(index);
    setOpen(true);
  }
  function close() {
    setOpen(false);
    trigger.current?.focus({ preventScroll: true });
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
    } else if (event.key === 'Tab') close();
  }

  return (
    <div
      className={styles.root}
      ref={root}
      data-news-filter={name}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={trigger}
        type="button"
        className={styles.trigger}
        disabled={disabled}
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
          className={styles.menu}
          data-above={placement.above || undefined}
          data-align={align}
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
              className={styles.option}
              onFocus={() => setActive(index)}
              onClick={() => {
                close();
                if (option.value !== value) onChange(option.value);
              }}
            >
              <span>{option.label}</span>
              <span className={styles.check}>
                {option.value === value && <HiOutlineCheck aria-hidden="true" />}
              </span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
