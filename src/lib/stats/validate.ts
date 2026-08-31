/** Live trial-started accepts any non-empty string with length >= 8 after trim. */
export function isValidTrialMachineId(value: unknown): value is string {
  return typeof value === "string" && value.trim().length >= 8;
}

/** Desktop heartbeats use a 32-char hex slice of sha256(machine fingerprint). */
const HEARTBEAT_MACHINE_ID = /^[a-f0-9]{32}$/i;

export function isValidHeartbeatMachineId(value: unknown): value is string {
  return typeof value === "string" && HEARTBEAT_MACHINE_ID.test(value.trim());
}

export function normalizeMachineId(value: string): string {
  return value.trim().toLowerCase();
}

export function optionalString(value: unknown, max = 64): string | undefined {
  if (typeof value !== "string") return undefined;
  const trimmed = value.trim();
  if (!trimmed) return undefined;
  return trimmed.slice(0, max);
}
