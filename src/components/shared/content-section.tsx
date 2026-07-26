/** Groups related content under an optional section heading. */
export function ContentSection({
  title,
  description,
  children,
}: {
  title?: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-4">
      {title ? (
        <div className="space-y-1">
          <h2 className="text-subheading tracking-tight">{title}</h2>
          {description ? <p className="text-body text-muted-foreground">{description}</p> : null}
        </div>
      ) : null}
      {children}
    </section>
  );
}
