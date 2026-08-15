type DialogKeyEvent = Pick<KeyboardEvent, 'key' | 'preventDefault'>;
type FocusTarget = Pick<HTMLElement, 'focus'>;

export function handleSuccessDialogKeyDown(event: DialogKeyEvent, close: () => void) {
  if (event.key !== 'Escape') return;
  event.preventDefault();
  close();
}

export function restoreSuccessDialogFocus(
  preferred: FocusTarget | null,
  fallback: FocusTarget | null,
  activeElement: () => unknown = () => document.activeElement,
) {
  preferred?.focus();
  if (!preferred || activeElement() !== preferred) fallback?.focus();
}
