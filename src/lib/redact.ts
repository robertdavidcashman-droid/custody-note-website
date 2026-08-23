/** Redact an email for logs: keep domain hint, hide local part. */
export function redactEmail(email: string): string {
  const at = email.indexOf("@");
  if (at <= 0) return "[redacted]";
  return `***${email.slice(at)}`;
}

/** Truncate free-text fields so logs never store full message bodies. */
export function redactText(text: string, maxLen = 32): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLen) return "[redacted]";
  return `[redacted:${trimmed.length} chars]`;
}
