function pad(value: number): string {
  return String(value).padStart(2, "0");
}

export function formatTimestamp(input: Date = new Date()): string {
  return [
    input.getFullYear(),
    pad(input.getMonth() + 1),
    pad(input.getDate()),
    pad(input.getHours()),
    pad(input.getMinutes()),
    pad(input.getSeconds()),
  ].join("");
}
