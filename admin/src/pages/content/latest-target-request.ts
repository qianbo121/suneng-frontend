export type LatestTargetRequestIdentity = {
  targetId: number;
  token: number;
};

export type LatestTargetRequestGuard = {
  begin(targetId: number): LatestTargetRequestIdentity;
  invalidate(): void;
  isCurrent(identity: LatestTargetRequestIdentity): boolean;
};

export function createLatestTargetRequestGuard(): LatestTargetRequestGuard {
  let nextToken = 0;
  let current: LatestTargetRequestIdentity | null = null;

  return {
    begin(targetId) {
      current = { targetId, token: ++nextToken };
      return current;
    },
    invalidate() {
      nextToken += 1;
      current = null;
    },
    isCurrent(identity) {
      return current?.targetId === identity.targetId && current.token === identity.token;
    },
  };
}

export async function runLatestTargetRequest<T>({
  guard,
  targetId,
  request,
  onStart,
  onSuccess,
  onError,
  onSettled,
}: {
  guard: LatestTargetRequestGuard;
  targetId: number;
  request: () => Promise<T>;
  onStart: () => void;
  onSuccess: (value: T) => void;
  onError: (error: unknown) => void;
  onSettled: () => void;
}) {
  const identity = guard.begin(targetId);
  onStart();
  try {
    const value = await request();
    if (guard.isCurrent(identity)) onSuccess(value);
  } catch (error) {
    if (guard.isCurrent(identity)) onError(error);
  } finally {
    if (guard.isCurrent(identity)) onSettled();
  }
}
