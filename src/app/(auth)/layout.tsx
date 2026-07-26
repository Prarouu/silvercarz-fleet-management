/**
 * Auth route group layout — no app shell (sidebar/header).
 * Session refresh still runs via `src/proxy.ts`.
 */
export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative flex min-h-svh flex-col items-center justify-center px-4 py-10">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,oklch(0.97_0_0),transparent_55%),linear-gradient(to_bottom,oklch(0.99_0_0),oklch(0.96_0_0))] dark:bg-[radial-gradient(ellipse_at_top,oklch(0.25_0_0),transparent_55%),linear-gradient(to_bottom,oklch(0.16_0_0),oklch(0.12_0_0))]"
      />
      {children}
    </div>
  );
}
