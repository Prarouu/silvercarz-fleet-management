import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type FormSectionProps = {
  readonly title: string;
  readonly description?: string;
  readonly children: React.ReactNode;
  readonly className?: string;
  readonly contentClassName?: string;
};

/** Card section used by multi-section admin forms. */
export function FormSection({
  title,
  description,
  children,
  className,
  contentClassName,
}: FormSectionProps) {
  return (
    <Card className={className} size="default">
      <CardHeader className="border-b pb-(--card-spacing)">
        <CardTitle>{title}</CardTitle>
        {description ? (
          <CardDescription className="text-pretty">{description}</CardDescription>
        ) : null}
      </CardHeader>
      <CardContent className={cn('pt-(--card-spacing)', contentClassName)}>{children}</CardContent>
    </Card>
  );
}
