type Listener = () => void;

let pendingCount = 0;
const listeners = new Set<Listener>();

function notify() {
  listeners.forEach((listener) => listener());
}

export function startGlobalLoading() {
  pendingCount += 1;
  notify();
}

export function stopGlobalLoading() {
  pendingCount = Math.max(0, pendingCount - 1);
  notify();
}

export function getGlobalLoadingState() {
  return pendingCount > 0;
}

export function subscribeGlobalLoading(listener: Listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
