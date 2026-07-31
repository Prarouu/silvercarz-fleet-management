import { cn } from '@/lib/utils';

/** Standard content wrapper: consistent max width, responsive padding. */
export function PageContainer({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'mx-auto w-full max-w-6xl flex-1 space-y-6 p-4 sm:space-y-8 sm:p-5 md:p-6 lg:p-8',
        className,
      )}
    >
      {children}
    </div>
  );
}
