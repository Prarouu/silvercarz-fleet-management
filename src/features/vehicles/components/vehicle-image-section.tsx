'use client';

import { FormSection } from '@/components/shared/form-section';
import { VehicleImageField } from '@/features/vehicles/components/vehicle-image-field';

type VehicleImageSectionProps = {
  readonly file: File | null;
  readonly existingImageUrl?: string | null;
  readonly disabled?: boolean;
  readonly error?: string;
  readonly onChange: (file: File | null) => void;
  readonly onClearExisting: () => void;
};

export function VehicleImageSection({
  file,
  existingImageUrl,
  disabled,
  error,
  onChange,
  onClearExisting,
}: VehicleImageSectionProps) {
  return (
    <FormSection title="Vehicle Image" description="Optional photo stored in Supabase Storage.">
      <VehicleImageField
        file={file}
        existingImageUrl={existingImageUrl}
        disabled={disabled}
        error={error}
        onChange={onChange}
        onClearExisting={onClearExisting}
      />
    </FormSection>
  );
}
