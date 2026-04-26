import { Badge } from "../ui/badge";

interface Props {
  value: string | null | undefined;
}

function toUzbek(value: string): string {
  const v = value.toLowerCase();
  if (
    v.includes("complete") ||
    v.includes("done") ||
    v.includes("success") ||
    v.includes("parsed") ||
    v.includes("generated") ||
    v.includes("selected")
  ) {
    return "Tayyor";
  }
  if (v.includes("fail") || v.includes("error")) {
    return "Xato yuz berdi";
  }
  if (
    v.includes("pending") ||
    v.includes("running") ||
    v.includes("processing") ||
    v.includes("uploading") ||
    v.includes("detected") ||
    v.includes("header_confirmed")
  ) {
    return "Jarayonda";
  }
  return "Jarayonda";
}

export function StatusBadge({ value }: Props) {
  const normalized = (value ?? "unknown").toLowerCase();

  const variant =
    normalized.includes("fail") || normalized.includes("error")
      ? "destructive"
      : normalized.includes("review") || normalized.includes("pending")
      ? "warning"
      : normalized.includes("selected") ||
        normalized.includes("complete") ||
        normalized.includes("parsed") ||
        normalized.includes("success") ||
        normalized.includes("generated")
      ? "success"
      : normalized.includes("running") || normalized.includes("processing")
      ? "info"
      : "muted";

  return <Badge variant={variant}>{value ? toUzbek(value) : "Jarayonda"}</Badge>;
}
