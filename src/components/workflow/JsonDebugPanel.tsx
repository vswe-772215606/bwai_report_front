import { useState } from "react";
import { Button } from "../ui/button";

interface Props {
  title?: string;
  value: unknown;
}

export function JsonDebugPanel({ title = "Raw JSON", value }: Props) {
  const [open, setOpen] = useState(false);

  return (
    <div className="rounded-lg border bg-slate-950 text-slate-100">
      <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800">
        <span className="text-xs font-medium tracking-wide uppercase text-slate-300">
          {title}
        </span>
        <Button
          type="button"
          size="sm"
          variant="ghost"
          className="text-slate-300 hover:bg-slate-800 hover:text-white"
          onClick={() => setOpen((current) => !current)}
        >
          {open ? "Hide" : "Show"}
        </Button>
      </div>
      {open && (
        <pre className="overflow-x-auto px-4 py-3 text-xs leading-6">
          {JSON.stringify(value, null, 2)}
        </pre>
      )}
    </div>
  );
}
