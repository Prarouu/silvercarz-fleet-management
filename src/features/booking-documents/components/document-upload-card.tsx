'use client';

import { FileText, Loader2, Trash2, Upload } from 'lucide-react';
import { useId, useRef, useState, useTransition } from 'react';

import { Button } from '@/components/ui/button';
import { BOOKING_DOCUMENT, type BookingDocumentRequirement } from '@/constants/booking-documents';
import {
  deleteOwnBookingDocument,
  getOwnBookingDocumentSignedUrl,
  uploadOwnBookingDocument,
} from '@/features/booking-documents/actions';
import {
  formatDocumentFileSize,
  validateBookingDocumentFileClient,
} from '@/features/booking-documents/lib/file-validation';
import { cn } from '@/lib/utils';
import type { BookingDocumentSummary } from '@/types';

type UploadState = 'idle' | 'uploading' | 'removing' | 'error';

export function DocumentUploadCard({
  bookingId,
  requirement,
  document,
  locked,
  onChanged,
}: {
  readonly bookingId: string;
  readonly requirement: BookingDocumentRequirement;
  readonly document: BookingDocumentSummary | null;
  readonly locked: boolean;
  readonly onChanged: (next: BookingDocumentSummary | null) => void;
}) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [state, setState] = useState<UploadState>('idle');
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const busy = locked || isPending || state === 'uploading' || state === 'removing';
  const statusLabel = document
    ? locked
      ? 'Submitted'
      : 'Uploaded'
    : requirement.required
      ? 'Required'
      : 'Optional';

  function runUpload(file: File) {
    const validationError = validateBookingDocumentFileClient(file);
    if (validationError) {
      setError(validationError);
      setState('error');
      return;
    }

    setError(null);
    setState('uploading');

    const formData = new FormData();
    formData.set('bookingId', bookingId);
    formData.set('documentType', requirement.type);
    formData.set('file', file);

    startTransition(async () => {
      const result = await uploadOwnBookingDocument(formData);
      if (!result.success) {
        setError(result.error.message);
        setState('error');
        return;
      }

      onChanged(result.data);
      setState('idle');
    });
  }

  function onFileChange(files: FileList | null) {
    const file = files?.[0];
    if (!file) {
      return;
    }
    runUpload(file);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  function onRemove() {
    if (!document || locked) {
      return;
    }

    setError(null);
    setState('removing');

    startTransition(async () => {
      const result = await deleteOwnBookingDocument({
        bookingId,
        documentType: requirement.type,
      });

      if (!result.success) {
        setError(result.error.message);
        setState('error');
        return;
      }

      onChanged(null);
      setState('idle');
    });
  }

  function onPreview() {
    if (!document) {
      return;
    }

    startTransition(async () => {
      const result = await getOwnBookingDocumentSignedUrl({
        bookingId,
        documentType: requirement.type,
      });

      if (!result.success) {
        setError(result.error.message);
        setState('error');
        return;
      }

      window.open(result.data.url, '_blank', 'noopener,noreferrer');
    });
  }

  return (
    <section
      className={cn(
        'rounded-lg border border-border bg-card p-4 sm:p-5',
        dragOver && !busy && 'border-primary bg-tone-gold/30',
        state === 'error' && 'border-destructive/50',
      )}
      aria-busy={busy}
      onDragEnter={(event) => {
        event.preventDefault();
        if (!busy) {
          setDragOver(true);
        }
      }}
      onDragOver={(event) => {
        event.preventDefault();
      }}
      onDragLeave={(event) => {
        event.preventDefault();
        setDragOver(false);
      }}
      onDrop={(event) => {
        event.preventDefault();
        setDragOver(false);
        if (busy) {
          return;
        }
        onFileChange(event.dataTransfer.files);
      }}
    >
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-bold tracking-wide text-foreground uppercase">
              {requirement.label}
              {requirement.required ? (
                <span className="text-destructive" aria-hidden="true">
                  {' '}
                  *
                </span>
              ) : null}
            </h3>
            <span
              className={cn(
                'rounded-md px-2 py-0.5 text-[11px] font-bold tracking-wide uppercase',
                document ? 'bg-success/15 text-success' : 'bg-muted text-muted-foreground',
              )}
            >
              {statusLabel}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">{requirement.description}</p>
        </div>
      </div>

      {document ? (
        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex min-w-0 items-start gap-3">
            <FileText className="mt-0.5 size-5 shrink-0 text-foreground" aria-hidden="true" />
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-foreground">{document.fileName}</p>
              <p className="text-xs text-muted-foreground">
                {formatDocumentFileSize(document.fileSize)}
              </p>
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              className="h-10 rounded-md"
              disabled={busy}
              onClick={onPreview}
            >
              Preview
            </Button>
            {!locked ? (
              <>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-md border-secondary text-secondary"
                  disabled={busy}
                  onClick={() => inputRef.current?.click()}
                >
                  Replace
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  className="h-10 rounded-md"
                  disabled={busy}
                  onClick={onRemove}
                  aria-label={`Remove ${requirement.label}`}
                >
                  {state === 'removing' ? (
                    <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  ) : (
                    <Trash2 className="size-4" aria-hidden="true" />
                  )}
                  <span className="ml-2">Remove</span>
                </Button>
              </>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="mt-4">
          <label
            htmlFor={inputId}
            className={cn(
              'flex min-h-28 cursor-pointer flex-col items-center justify-center gap-2 rounded-md border border-dashed border-border bg-background px-4 py-6 text-center transition-colors',
              busy && 'pointer-events-none opacity-60',
              !busy && 'hover:border-primary hover:bg-tone-gold/20',
            )}
          >
            {state === 'uploading' ? (
              <>
                <Loader2 className="size-6 animate-spin text-primary" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">Uploading…</span>
              </>
            ) : (
              <>
                <Upload className="size-6 text-foreground" aria-hidden="true" />
                <span className="text-sm font-semibold text-foreground">
                  Drop file here or click to upload
                </span>
                <span className="text-xs text-muted-foreground">PDF, JPG, or PNG · max 5 MB</span>
              </>
            )}
          </label>
        </div>
      )}

      <input
        ref={inputRef}
        id={inputId}
        type="file"
        className="sr-only"
        accept={BOOKING_DOCUMENT.acceptAttribute}
        disabled={busy}
        onChange={(event) => onFileChange(event.target.files)}
      />

      {error ? (
        <p className="mt-3 text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <span className="sr-only" aria-live="polite">
        {state === 'uploading'
          ? `Uploading ${requirement.label}`
          : state === 'removing'
            ? `Removing ${requirement.label}`
            : document
              ? `${requirement.label} ${statusLabel}`
              : `${requirement.label} missing`}
      </span>
    </section>
  );
}
