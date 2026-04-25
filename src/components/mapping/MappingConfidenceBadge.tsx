import { Badge } from "../ui/badge";

interface Props {
  confidence?: number;
}

export function MappingConfidenceBadge({ confidence }: Props) {
  if (confidence === undefined || confidence === null) {
    return <Badge variant="muted">—</Badge>;
  }

  const pct = (confidence * 100).toFixed(0);

  if (confidence >= 0.75) {
    return <Badge variant="success">{pct}%</Badge>;
  }
  if (confidence >= 0.5) {
    return <Badge variant="warning">{pct}% · Needs review</Badge>;
  }
  return <Badge variant="destructive">{pct}% · Low</Badge>;
}
