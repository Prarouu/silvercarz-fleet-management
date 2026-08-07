import { MapPin, Shield, Tags, Wrench } from 'lucide-react';

import { CustomerContainer } from '@/components/customer/shared/customer-container';

const ITEMS = [
  {
    icon: Tags,
    title: 'Best Prices',
    description: 'Competitive daily rates on a maintained fleet.',
  },
  {
    icon: Wrench,
    title: 'Well Maintained Cars',
    description: 'Regularly serviced for a safe self-drive experience.',
  },
  {
    icon: MapPin,
    title: 'Flexible Pick-up',
    description: 'Simple booking flow with clear next steps.',
  },
  {
    icon: Shield,
    title: 'No Hidden Charges',
    description: 'Transparent pricing before you request a booking.',
  },
] as const;

export function WhyBookBar() {
  return (
    <section className="bg-secondary text-secondary-foreground">
      <CustomerContainer className="grid gap-8 py-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-6 lg:py-12">
        {ITEMS.map((item) => (
          <div key={item.title} className="flex gap-3">
            <item.icon className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
            <div>
              <h2 className="text-sm font-bold tracking-wide uppercase">{item.title}</h2>
              <p className="mt-1 text-xs leading-relaxed text-secondary-foreground/70">
                {item.description}
              </p>
            </div>
          </div>
        ))}
      </CustomerContainer>
    </section>
  );
}
