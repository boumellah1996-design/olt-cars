export function Logo({ inverted = false, compact = false }: { inverted?: boolean; compact?: boolean }) {
  return (
    <span
      className={
        inverted
          ? "inline-flex rounded-xl bg-white px-2 py-1"
          : "inline-flex rounded-xl bg-white px-1 py-0.5 dark:px-2 dark:py-1"
      }
    >
      <img
        src="/olt-logo.png"
        alt="OLT"
        className={compact ? "h-9 w-auto object-contain" : "h-12 w-auto object-contain sm:h-[52px]"}
      />
    </span>
  );
}
