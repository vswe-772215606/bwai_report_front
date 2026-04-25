import { useState } from "react";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import { Button } from "../ui/button";

interface Props {
  currentHeaderRow: number;
  onConfirm: (row: number) => void;
  isLoading?: boolean;
}

export function HeaderRowSelector({ currentHeaderRow, onConfirm, isLoading }: Props) {
  const [value, setValue] = useState(String(currentHeaderRow));

  const handle = () => {
    const n = parseInt(value, 10);
    if (!isNaN(n) && n >= 0) onConfirm(n);
  };

  return (
    <div className="flex items-end gap-3">
      <div className="space-y-1">
        <Label htmlFor="header-row">Header Row Index (0-based)</Label>
        <Input
          id="header-row"
          type="number"
          min={0}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          className="w-32"
        />
      </div>
      <Button onClick={handle} disabled={isLoading} size="sm">
        {isLoading ? "Confirming..." : "Confirm Header"}
      </Button>
    </div>
  );
}
