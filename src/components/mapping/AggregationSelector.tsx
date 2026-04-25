import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import type { AggregationType } from "../../types/template";

const OPTIONS: { value: AggregationType; label: string }[] = [
  { value: "sum", label: "Sum" },
  { value: "avg", label: "Average" },
  { value: "first", label: "First value" },
  { value: "last", label: "Last value" },
  { value: "count", label: "Count" },
  { value: "formula", label: "Formula" },
];

interface Props {
  value: AggregationType;
  onChange: (v: AggregationType) => void;
  disabled?: boolean;
}

export function AggregationSelector({ value, onChange, disabled }: Props) {
  return (
    <Select value={value} onValueChange={(v) => onChange(v as AggregationType)} disabled={disabled}>
      <SelectTrigger className="h-8 text-xs w-36">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {OPTIONS.map((o) => (
          <SelectItem key={o.value} value={o.value} className="text-xs">
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
