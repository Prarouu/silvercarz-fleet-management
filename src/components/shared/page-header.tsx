/**
 * Page-level heading block. `children` renders on the right for page
 * actions (buttons, filters) added by future modules.
 */
export function PageHeader({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div className="min-w-0 space-y-1.5">
        <h1 className="text-heading text-balance">{title}</h1>
        {description ? (
          <p className="text-body max-w-2xl leading-relaxed text-pretty text-muted-foreground">
            {description}
          </p>
        ) : null}
      </div>
      {children ? (
        <div className="flex shrink-0 flex-wrap items-center gap-2">{children}</div>
      ) : null}
    </div>
  );
}
