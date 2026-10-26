"use client";

export function DataTable({
  headers,
  rows,
}: {
  headers: string[];
  rows: React.ReactNode[][];
}) {
  return (
    <div className="overflow-x-auto rounded-2xl bg-white shadow-soft ring-1 ring-zinc-100 dark:bg-zinc-900 dark:ring-zinc-800">
      <table className="min-w-full text-sm">
        <thead>
          <tr className="border-b border-zinc-100 text-left text-zinc-500 dark:border-zinc-800">
            {headers.map((header) => (
              <th key={header} className="px-4 py-3 font-medium">
                {header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr key={index} className="border-b border-zinc-50 last:border-0 dark:border-zinc-800">
              {row.map((cell, cellIndex) => (
                <td key={cellIndex} className="px-4 py-3 align-middle">
                  {cell}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export function StatusPill({ label, tone }: { label: string; tone: string }) {
  return <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${tone}`}>{label}</span>;
}
