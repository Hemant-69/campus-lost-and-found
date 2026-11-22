/**
 * Campus IST Date & Time formatting utilities.
 * Consistent timeZone: Asia/Kolkata (Indian Standard Time, UTC+05:30).
 * Prevents SSR/CSR hydration mismatch and off-by-one calendar day discrepancies.
 */

export function formatISTDate(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    ...options,
  }).format(d);
}

export function formatISTDateTime(
  dateInput: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
    ...options,
  }).format(d);
}

export function formatISTTime(dateInput: Date | string | number): string {
  const d = typeof dateInput === "object" ? dateInput : new Date(dateInput);
  if (isNaN(d.getTime())) return "";

  return new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  }).format(d);
}
