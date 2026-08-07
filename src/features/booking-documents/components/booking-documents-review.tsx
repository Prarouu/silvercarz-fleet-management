'use client';

import { FileText, Loader2, ZoomIn, ZoomOut } from 'lucide-react';
import { useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { bookingDocumentLabel } from '@/constants/booking-documents';
import { getStaffBookingDocumentSignedUrl } from '@/features/booking-documents/actions';
import { formatDocumentFileSize } from '@/features/booking-documents/lib/file-validation';
import { cn } from '@/lib/utils';
import type { BookingDocumentSummary } from '@/types';

const MIN_ZOOM = 1;
const MAX_ZOOM = 4;
const ZOOM_STEP = 0.5;

export function BookingDocumentsReview({
  bookingId,
  documents,
  documentSubmitted,
  checklist = [],
}: {
  readonly bookingId: string;
  readonly documents: readonly BookingDocumentSummary[];
  readonly documentSubmitted: boolean;
  readonly checklist?: readonly {
    readonly type: string;
    readonly label: string;
    readonly present: boolean;
  }[];
}) {
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [viewer, setViewer] = useState<{
    readonly url: string;
    readonly mimeType: string;
    readonly fileName: string;
    readonly label: string;
  } | null>(null);
  const [zoom, setZoom] = useState(1);

  function openDocument(document: BookingDocumentSummary) {
    setError(null);
    startTransition(async () => {
      const result = await getStaffBookingDocumentSignedUrl({
        bookingId,
        documentId: document.id,
      });

      if (!result.success) {
        setError(result.error.message);
        return;
      }

      setZoom(1);
      setViewer({
        url: result.data.url,
        mimeType: result.data.mimeType,
        fileName: result.data.fileName,
        label: bookingDocumentLabel(document.documentType),
      });
    });
  }

  const isImage = viewer?.mimeType.startsWith('image/') ?? false;

  return (
    <div className="space-y-4">
      {checklist.length > 0 ? (
        <ul className="grid gap-2 sm:grid-cols-3" aria-label="Required documents">
          {checklist.map((item) => (
            <li
              key={item.type}
              className="flex items-center justify-between gap-2 rounded-xl border px-3 py-2 text-sm"
            >
              <span className="font-medium">{item.label}</span>
              <span
                className={cn(
                  'text-xs font-semibold tracking-wide uppercase',
                  item.present ? 'text-success' : 'text-destructive',
                )}
              >
                {item.present ? 'Submitted' : 'Missing'}
              </span>
            </li>
          ))}
        </ul>
      ) : null}

      <div className="flex flex-wrap items-end justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          {documentSubmitted
            ? 'Customer marked documents as submitted. Open a file to verify.'
            : documents.length > 0
              ? 'Some files are uploaded, but the customer has not finished submission yet.'
              : 'No documents uploaded for this booking yet.'}
        </p>
        <span className="rounded-full border px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
          {documents.length} file{documents.length === 1 ? '' : 's'}
        </span>
      </div>

      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      {documents.length === 0 ? (
        <div className="rounded-2xl border border-dashed bg-muted/20 px-4 py-8 text-center text-sm text-muted-foreground">
          No document files attached.
        </div>
      ) : (
        <ul className="grid gap-3 sm:grid-cols-2">
          {documents.map((document) => (
            <li
              key={document.id}
              className="flex items-start justify-between gap-3 rounded-2xl border bg-card p-4"
            >
              <div className="flex min-w-0 items-start gap-3">
                <FileText
                  className="mt-0.5 size-5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold">
                    {bookingDocumentLabel(document.documentType)}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">{document.fileName}</p>
                  <p className="mt-1 text-xs text-muted-foreground">
                    {formatDocumentFileSize(document.fileSize)}
                  </p>
                </div>
              </div>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={isPending}
                onClick={() => openDocument(document)}
              >
                {isPending ? (
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                ) : (
                  'Open'
                )}
              </Button>
            </li>
          ))}
        </ul>
      )}

      <Dialog
        open={Boolean(viewer)}
        onOpenChange={(open) => {
          if (!open) {
            setViewer(null);
            setZoom(1);
          }
        }}
      >
        <DialogContent
          className="flex max-h-[min(92dvh,56rem)] w-full max-w-[min(96vw,72rem)] flex-col gap-3 overflow-hidden p-4 sm:max-w-[min(96vw,72rem)]"
          showCloseButton
        >
          <DialogHeader className="shrink-0 pr-8">
            <DialogTitle>{viewer?.label ?? 'Document'}</DialogTitle>
            <DialogDescription className="truncate">{viewer?.fileName}</DialogDescription>
          </DialogHeader>

          {viewer && isImage ? (
            <div className="flex shrink-0 items-center gap-2">
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={zoom <= MIN_ZOOM}
                onClick={() => setZoom((value) => Math.max(MIN_ZOOM, value - ZOOM_STEP))}
                aria-label="Zoom out"
              >
                <ZoomOut className="size-4" />
              </Button>
              <span className="min-w-14 text-center text-xs font-medium text-muted-foreground tabular-nums">
                {Math.round(zoom * 100)}%
              </span>
              <Button
                type="button"
                size="sm"
                variant="outline"
                disabled={zoom >= MAX_ZOOM}
                onClick={() => setZoom((value) => Math.min(MAX_ZOOM, value + ZOOM_STEP))}
                aria-label="Zoom in"
              >
                <ZoomIn className="size-4" />
              </Button>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => setZoom(1)}
                disabled={zoom === 1}
              >
                Reset
              </Button>
            </div>
          ) : null}

          <div
            className={cn(
              'min-h-0 flex-1 overflow-auto rounded-2xl border bg-muted/30',
              isImage ? 'p-3' : 'p-0',
            )}
          >
            {viewer && isImage ? (
              // eslint-disable-next-line @next/next/no-img-element -- short-lived signed URL preview
              <img
                src={viewer.url}
                alt={viewer.label}
                className="mx-auto origin-top transition-transform duration-150"
                style={{ transform: `scale(${zoom})`, maxWidth: '100%' }}
              />
            ) : null}

            {viewer && viewer.mimeType === 'application/pdf' ? (
              <iframe
                title={viewer.label}
                src={viewer.url}
                className="h-[min(70dvh,40rem)] w-full rounded-2xl bg-background"
              />
            ) : null}

            {viewer && !isImage && viewer.mimeType !== 'application/pdf' ? (
              <div className="flex h-48 flex-col items-center justify-center gap-3 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  Preview is not available for this file type.
                </p>
                <Button asChild variant="outline" size="sm">
                  <a href={viewer.url} target="_blank" rel="noopener noreferrer">
                    Open in new tab
                  </a>
                </Button>
              </div>
            ) : null}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
