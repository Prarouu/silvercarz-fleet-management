'use client';

import { ImagePlus, Replace, Trash2 } from 'lucide-react';
import { useEffect, useId, useMemo, useRef, useState } from 'react';

import { FormField, fieldAriaProps } from '@/components/shared/form-field';
import { Button } from '@/components/ui/button';
import { VEHICLE_IMAGE } from '@/constants/vehicle-image';
import { cn } from '@/lib/utils';

type VehicleImageFieldProps = {
  readonly file: File | null;
  readonly onChange: (file: File | null) => void;
  readonly error?: string;
  readonly disabled?: boolean;
  readonly className?: string;
};

const ACCEPT_MIME = new Set<string>(VEHICLE_IMAGE.acceptMimeTypes);

function validateLocalFile(file: File): string | null {
  if (!ACCEPT_MIME.has(file.type)) {
    return 'Use a JPG, PNG, or WEBP image.';
  }
  if (file.size <= 0) {
    return 'The selected image is empty.';
  }
  if (file.size > VEHICLE_IMAGE.maxBytes) {
    return 'Image must be 5 MB or smaller.';
  }
  return null;
}

export function VehicleImageField({
  file,
  onChange,
  error,
  disabled = false,
  className,
}: VehicleImageFieldProps) {
  const inputId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const [localError, setLocalError] = useState<string | undefined>();

  const previewUrl = useMemo(() => (file ? URL.createObjectURL(file) : null), [file]);

  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [previewUrl]);

  const displayError = error ?? localError;
  const description = 'JPG, PNG, or WEBP · max 5 MB. Preview updates before save.';

  function openPicker() {
    inputRef.current?.click();
  }

  function handleFileList(list: FileList | null) {
    const next = list?.[0] ?? null;
    if (!next) {
      return;
    }

    const message = validateLocalFile(next);
    if (message) {
      setLocalError(message);
      onChange(null);
      if (inputRef.current) {
        inputRef.current.value = '';
      }
      return;
    }

    setLocalError(undefined);
    onChange(next);
  }

  function removeImage() {
    setLocalError(undefined);
    onChange(null);
    if (inputRef.current) {
      inputRef.current.value = '';
    }
  }

  return (
    <FormField
      id={inputId}
      label="Vehicle Image"
      description={description}
      error={displayError}
      className={className}
    >
      <input
        ref={inputRef}
        type="file"
        accept={VEHICLE_IMAGE.acceptAttribute}
        className="sr-only"
        disabled={disabled}
        onChange={(event) => handleFileList(event.target.files)}
        {...fieldAriaProps({
          id: inputId,
          error: displayError,
          description,
        })}
      />

      <div
        className={cn(
          'flex flex-col gap-4 rounded-xl border border-dashed bg-muted/20 p-4 sm:flex-row sm:items-center',
          displayError && 'border-destructive/50',
        )}
      >
        <div className="flex size-28 shrink-0 items-center justify-center overflow-hidden rounded-lg border bg-background sm:size-32">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- local object URL preview
            <img
              src={previewUrl}
              alt="Selected vehicle preview"
              className="size-full object-cover"
            />
          ) : (
            <div className="flex flex-col items-center gap-1.5 px-2 text-center text-muted-foreground">
              <ImagePlus className="size-6" aria-hidden="true" />
              <span className="text-xs">No image</span>
            </div>
          )}
        </div>

        <div className="flex min-w-0 flex-1 flex-col gap-2">
          <p className="truncate text-sm font-medium">
            {file ? file.name : 'Add a photo of the vehicle (optional).'}
          </p>
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={disabled}
              onClick={openPicker}
            >
              {file ? (
                <>
                  <Replace className="size-4" aria-hidden="true" />
                  Replace image
                </>
              ) : (
                <>
                  <ImagePlus className="size-4" aria-hidden="true" />
                  Choose image
                </>
              )}
            </Button>
            {file ? (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                disabled={disabled}
                onClick={removeImage}
              >
                <Trash2 className="size-4" aria-hidden="true" />
                Remove
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </FormField>
  );
}
