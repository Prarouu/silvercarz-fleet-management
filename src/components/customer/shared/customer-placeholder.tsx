import { CustomerContainer } from '@/components/customer/shared/customer-container';

/**
 * Minimal C0 placeholder — validates layout/theme without fake business data.
 */
export function CustomerPlaceholderPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <section className="flex flex-1 flex-col justify-center py-16 sm:py-24">
      <CustomerContainer className="max-w-2xl">
        <p className="text-xs font-semibold tracking-[0.2em] text-muted-foreground uppercase">
          Placeholder · Phase C0
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-foreground uppercase sm:text-4xl">
          {title}
        </h1>
        <div className="mt-3 h-1 w-12 bg-primary" aria-hidden="true" />
        <p className="mt-5 text-base leading-relaxed text-muted-foreground sm:text-lg">
          {description}
        </p>
      </CustomerContainer>
    </section>
  );
}
