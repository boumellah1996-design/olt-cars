"use client";

import { FormEvent, useState } from "react";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";

const fieldClass =
  "h-11 w-full rounded-full border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export function AddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { addClient, addVehicle, addExpense, addPayment } = useStore();
  const [kind, setKind] = useState<"client" | "vehicle" | "expense" | "payment">("client");

  if (!open) return null;

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    if (kind === "client") {
      addClient({
        name: String(data.get("name") || ""),
        email: String(data.get("email") || ""),
        phone: String(data.get("phone") || ""),
        license: String(data.get("license") || ""),
      });
    }
    if (kind === "vehicle") {
      addVehicle({
        brand: String(data.get("brand") || ""),
        model: String(data.get("model") || ""),
        category: String(data.get("category") || "Confort"),
        fuel: "essence",
        transmission: "auto",
        pricePerDay: Number(data.get("price") || 10000),
        image: "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?auto=format&fit=crop&w=1600&q=80",
        status: "available",
        seats: 5,
        year: 2024,
        plate: String(data.get("plate") || ""),
        color: "Noir",
      });
    }
    if (kind === "expense") {
      addExpense({
        category: String(data.get("category") || "Divers"),
        amount: Number(data.get("amount") || 0),
        at: new Date().toISOString(),
        note: String(data.get("note") || ""),
      });
    }
    if (kind === "payment") {
      addPayment({
        clientName: String(data.get("client") || ""),
        amount: Number(data.get("amount") || 0),
        method: "cash",
        at: new Date().toISOString(),
        note: String(data.get("note") || ""),
      });
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <form onSubmit={onSubmit} className="w-full max-w-lg rounded-3xl bg-white p-6 shadow-card dark:bg-zinc-900">
        <div className="mb-4 flex flex-wrap gap-2">
          {(["client", "vehicle", "expense", "payment"] as const).map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setKind(item)}
              className={`rounded-full px-3 py-1.5 text-sm ${kind === item ? "bg-zinc-950 text-white dark:bg-white dark:text-zinc-950" : "bg-zinc-100 dark:bg-zinc-800"}`}
            >
              {item === "client" ? t.admin.clients : item === "vehicle" ? t.admin.vehicles : item === "expense" ? t.admin.expenses : t.admin.payments}
            </button>
          ))}
        </div>

        {kind === "client" && (
          <div className="grid gap-3">
            <input name="name" required placeholder={t.booking.name} className={fieldClass} />
            <input name="phone" required placeholder={t.table.phone} className={fieldClass} />
            <input name="email" placeholder={t.booking.email} className={fieldClass} />
            <input name="license" placeholder="Permis" className={fieldClass} />
          </div>
        )}
        {kind === "vehicle" && (
          <div className="grid gap-3">
            <input name="brand" required placeholder={t.table.brand} className={fieldClass} />
            <input name="model" required placeholder={t.table.model} className={fieldClass} />
            <input name="plate" required placeholder={t.table.plate} className={fieldClass} />
            <input name="category" placeholder={t.table.category} className={fieldClass} />
            <input name="price" type="number" placeholder={t.table.price} className={fieldClass} />
          </div>
        )}
        {(kind === "expense" || kind === "payment") && (
          <div className="grid gap-3">
            {kind === "payment" && <input name="client" required placeholder={t.table.client} className={fieldClass} />}
            {kind === "expense" && <input name="category" required placeholder={t.table.category} className={fieldClass} />}
            <input name="amount" required type="number" placeholder={t.table.amount} className={fieldClass} />
            <input name="note" placeholder={t.table.note} className={fieldClass} />
          </div>
        )}

        <div className="mt-5 flex justify-end gap-2">
          <button type="button" onClick={onClose} className="rounded-full px-4 py-2 text-sm">
            {t.actions.close}
          </button>
          <button type="submit" className="rounded-full bg-brand-yellow px-4 py-2 text-sm font-semibold">
            {t.actions.save}
          </button>
        </div>
      </form>
    </div>
  );
}
