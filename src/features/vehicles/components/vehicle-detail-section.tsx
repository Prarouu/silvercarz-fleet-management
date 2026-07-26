import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type VehicleDetailSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
  readonly headerAction?: React.ReactNode;
};

/** Card section used by the Vehicle Details (fleet profile) workspace. */
export function VehicleDetailSection({
  title,
  description,
  children,
  className,
  contentClassName,
  headerAction,
}: VehicleDetailSectionProps) {
  return (
    <Card className={className} size="default">
      <CardHeader className="border-b pb-(--card-spacing)">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0 space-y-1.5">
            <CardTitle>{title}</CardTitle>
            {description ? (
              <CardDescription className="text-pretty">{description}</CardDescription>
            ) : null}
          </div>
          {headerAction ? <div className="shrink-0">{headerAction}</div> : null}
        </div>
      </CardHeader>
      <CardContent className={cn('pt-(--card-spacing)', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
