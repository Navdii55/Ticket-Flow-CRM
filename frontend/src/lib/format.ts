export function formatDate(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return date.toLocaleDateString(undefined, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function formatDateTime(value: string) {
  if (!value) return "—";

  const dateString =
    !/[zZ]|[+-]\d{2}:\d{2}$/.test(value)
      ? `${value}Z`
      : value;
  
  const date = new Date(dateString);

  if (Number.isNaN(date.getTime())) return "—";

  return date.toLocaleString("en-IN", {
    timeZone: "Asia/Kolkata",
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
  });
}

export function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");
}
