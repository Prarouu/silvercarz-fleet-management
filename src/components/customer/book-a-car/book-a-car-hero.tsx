import { CustomerContainer } from '@/components/customer/shared/customer-container';

export function BookACarHero() {
  return (
    <section className="relative overflow-hidden bg-tone-ink text-tone-ink-foreground">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgb(244_180_0_/_0.16),transparent_50%),linear-gradient(to_bottom,#1a1a1a,#0a0a0a)]"
      />
      <CustomerContainer className="relative flex min-h-[12rem] flex-col justify-center py-10 sm:min-h-[14rem] sm:py-14">
        <p className="text-xs font-semibold tracking-[0.2em] text-primary uppercase">
          Self Drive Car Rental
        </p>
        <h1 className="mt-2 text-3xl font-bold tracking-tight uppercase sm:text-4xl lg:text-5xl">
          Book Your Car
        </h1>
        <p className="mt-2 text-sm text-white/65">
          Home <span className="text-white/35">›</span>{' '}
          <span className="text-primary">Book Your Car</span>
        </p>
      </CustomerContainer>
    </section>
  );
}
