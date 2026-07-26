import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';

type BookingFormFieldProps = {
  readonly id: string;
  readonly label: string;
  readonly required?: boolean;
  readonly description?: string;
  readonly error?: string;
  readonly className?: string;
  readonly children: React.ReactNode;
};

/** Label + control + description/error wrapper for booking forms. */
export function BookingFormField({
  id,
  label,
  required = false,
  description,
  error,
  className,
  children,
}: BookingFormFieldProps) {
  const descriptionId = description ? `${id}-description` : undefined;
  const errorId = error ? `${id}-error` : undefined;

  return (
    <div className={cn('grid gap-2', className)}>
      <Label htmlFor={id}>
        {label}
        {required ? (
          <span className="text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export function fieldAriaProps(params: {
  readonly error?: string;
  readonly description?: string;
  readonly id: string;
}) {
  const describedBy = [
    params.description ? `${params.id}-description` : null,
    params.error ? `${params.id}-error` : null,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    id: params.id,
    'aria-invalid': params.error ? true : undefined,
    'aria-describedby': describedBy || undefined,
  } as const;
}
