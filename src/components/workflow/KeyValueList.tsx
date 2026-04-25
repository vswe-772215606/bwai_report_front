interface Props {
  value: Record<string, unknown>;
}

function renderValue(value: unknown): string {
  if (value == null) return "Not available yet";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

export function KeyValueList({ value }: Props) {
  const entries = Object.entries(value);

  if (entries.length === 0) {
    return <p className="text-sm text-gray-500">Not available yet.</p>;
  }

  return (
    <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {entries.map(([key, entryValue]) => (
        <div key={key} className="rounded-lg border bg-gray-50 px-3 py-2">
          <dt className="text-[11px] font-semibold uppercase tracking-wide text-gray-500">
            {key.replace(/_/g, " ")}
          </dt>
          <dd className="mt-1 text-sm text-gray-800 break-words">
            {renderValue(entryValue)}
          </dd>
        </div>
      ))}
    </dl>
  );
}
