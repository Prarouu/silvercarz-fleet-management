import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type BookingFormSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
};

/** Card section used by the Create Booking form. */
export function BookingFormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: BookingFormSectionProps) {
  return (
    <Card className={className}>
      <CardHeader className="border-b">
        <CardTitle>{title}</CardTitle>
        {description ? <CardDescription>{description}</CardDescription> : null}
      </CardHeader>
      <CardContent className={cn('pt-(--card-spacing)', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
