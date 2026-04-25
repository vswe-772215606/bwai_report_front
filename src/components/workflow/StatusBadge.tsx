import { Badge } from "../ui/badge";

interface Props {
  value: string | null | undefined;
}

export function StatusBadge({ value }: Props) {
  const normalized = (value ?? "unknown").toLowerCase();

  const variant =
    normalized.includes("fail") || normalized.includes("error")
      ? "destructive"
      : normalized.includes("review") || normalized.includes("pending")
      ? "warning"
      : normalized.includes("selected") || normalized.includes("complete") || normalized.includes("parsed") || normalized.includes("success")
      ? "success"
      : normalized.includes("running") || normalized.includes("processing")
      ? "info"
      : "muted";

  return <Badge variant={variant}>{value ?? "unknown"}</Badge>;
}
