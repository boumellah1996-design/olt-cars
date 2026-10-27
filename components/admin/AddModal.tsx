"use client";

import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import { ImagePlus, X } from "lucide-react";
import { compressImageFile, FALLBACK_VEHICLE_IMAGE } from "lib/images";
import { useI18n } from "lib/i18n";
import { useStore } from "lib/store";

const fieldClass =
  "h-11 w-full rounded-full border border-zinc-200 px-4 text-sm dark:border-zinc-700 dark:bg-zinc-950";

export function AddModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { t } = useI18n();
  const { addClient, addVehicle, addExpense, addPayment } = useStore();
  const [kind, setKind] = useState<"client" | "vehicle" | "expense" | "payment">("client");
  const [photos, setPhotos] = useState<string[]>([]);

  useEffect(() => {
    if (!open) setPhotos([]);
  }, [open]);

  if (!open) return null;

  async function onPhotosChange(event: ChangeEvent<HTMLInputElement>) {
    const files = Array.from(event.target.files || []).filter((file) => file.type.startsWith("image/"));
    event.target.value = "";
    const compressed = await Promise.all(files.map((file) => compressImageFile(file)));
    setPhotos((prev) => [...prev, ...compressed.filter(Boolean)]);
  }

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
      const uploaded = photos;
      addVehicle({
        brand: String(data.get("brand") || ""),
        model: String(data.get("model") || ""),
        category: String(data.get("category") || "Confort"),
        fuel: "essence",
        transmission: "auto",
        pricePerDay: Number(data.get("price") || 0),
        price7Days: Number(data.get("price7Days") || 0) || undefined,
        image: uploaded[0] || FALLBACK_VEHICLE_IMAGE,
        images: uploaded.length ? uploaded : undefined,
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
    <div className="fixed inset-0 z-[80] flex items-center justify-center bg-black/40 p-4">
      <form
        onSubmit={onSubmit}
        className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-3xl bg-white p-6 shadow-card dark:bg-zinc-900"
      >
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

        {kind === "vehicle" ? (
          <div className="grid gap-4">
            <input name="brand" required placeholder={t.table.brand} className={fieldClass} />
            <input name="model" required placeholder={t.table.model} className={fieldClass} />
            <input name="plate" required placeholder={t.table.plate} className={fieldClass} />
            <input name="category" placeholder={t.table.category} className={fieldClass} />

            <div>
              <p className="mb-1 px-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">Prix / jour</p>
              <div className="relative" dir="ltr">
                <input
                  name="price"
                  type="number"
                  min="0"
                  step="1"
                  required
                  placeholder="Prix / jour"
                  className={`${fieldClass} pe-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  DA
                </span>
              </div>
            </div>

            <div>
              <p className="mb-1 px-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">سعر 7 أيام</p>
              <div className="relative" dir="ltr">
                <input
                  name="price7Days"
                  type="number"
                  min="0"
                  step="1"
                  placeholder="7 days price"
                  className={`${fieldClass} pe-16`}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-sm font-semibold text-zinc-700 dark:text-zinc-200">
                  DA
                </span>
              </div>
            </div>

            <div>
              <p className="mb-2 px-1 text-sm font-medium text-zinc-800 dark:text-zinc-100">رفع صور السيارة</p>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-3xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-5 text-center dark:border-zinc-700 dark:bg-zinc-950">
                <ImagePlus size={22} className="text-zinc-500" />
                <span className="text-sm font-medium text-zinc-700 dark:text-zinc-200">رفع صور السيارة</span>
                <span className="text-xs text-zinc-500">JPG, PNG</span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="mt-1 block w-full max-w-xs text-xs file:me-3 file:rounded-full file:border-0 file:bg-zinc-950 file:px-3 file:py-1.5 file:text-xs file:font-medium file:text-white dark:file:bg-white dark:file:text-zinc-950"
                  onChange={onPhotosChange}
                />
              </label>
              {photos.length > 0 ? (
                <div className="mt-3 grid grid-cols-3 gap-2">
                  {photos.map((src, index) => (
                    <div key={`vehicle-photo-${index}`} className="relative overflow-hidden rounded-2xl">
                      <img src={src} alt={`vehicle-${index + 1}`} className="h-24 w-full object-cover" />
                      <button
                        type="button"
                        onClick={() => setPhotos((prev) => prev.filter((_, i) => i !== index))}
                        className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/70 text-white"
                        aria-label="Remove photo"
                      >
                        <X size={12} />
                      </button>
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        ) : null}

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
