'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, useTransition } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { FormField, fieldAriaProps } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ROUTES } from '@/constants/routes';
import { createVehicle } from '@/features/vehicles/actions/create-vehicle';
import { uploadVehicleImageAction } from '@/features/vehicles/actions/upload-vehicle-image';
import { VehicleImageField } from '@/features/vehicles/components/vehicle-image-field';
import {
  VEHICLE_STATUS_OPTIONS,
  createVehicleFormDefaults,
  normalizeRegistrationInput,
  parseOptionalNumber,
  validateCreateVehicleForm,
  type VehicleFormValues,
  type VehicleStatusValue,
} from '@/features/vehicles/lib/vehicle-form';
import { cn } from '@/lib/utils';
import {
  FUEL_TYPE_OPTIONS,
  VEHICLE_AVAILABILITY_STATUS_OPTIONS,
  type FuelType,
  type VehicleAvailabilityStatus,
} from '@/types';

/** Ignore Select clear/null events so values are never reset to form defaults. */
function applySelectValue<T extends string>(
  next: string | null | undefined,
  onChange: (value: T) => void,
) {
  if (next == null || next === '') {
    return;
  }
  onChange(next as T);
}

const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Leave this page? Your edits will be lost.';

type CreateVehicleFormProps = {
  readonly className?: string;
};

export function CreateVehicleForm({ className }: CreateVehicleFormProps) {
  const router = useRouter();
  const formErrorId = useId();
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageDirty, setImageDirty] = useState(false);
  /** Prevents duplicate Server Action calls from double-submit. */
  const [hasStartedSave, setHasStartedSave] = useState(false);

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VehicleFormValues>({
    defaultValues: createVehicleFormDefaults(),
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const isLoading = isSubmitting || isPending || hasStartedSave;
  const formError = errors.root?.message;
  const hasUnsavedChanges = isDirty || imageDirty;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Skip while saving — a successful create navigates away with a full load.
      if (!hasUnsavedChanges || isLoading) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [hasUnsavedChanges, isLoading]);

  function goToFleetList() {
    // Full page navigation avoids App Router soft-nav + loading.tsx reload loops
    // seen after create (especially with the slow fleet list RSC).
    window.location.assign(ROUTES.vehicles);
  }

  const handleCancel = () => {
    if (hasUnsavedChanges && !window.confirm(UNSAVED_CHANGES_MESSAGE)) {
      return;
    }

    router.push(ROUTES.vehicles);
  };

  const onSubmit = handleSubmit((values) => {
    if (hasStartedSave) {
      return;
    }

    clearErrors('root');

    const validated = validateCreateVehicleForm(values);

    if (!validated.success) {
      for (const [field, message] of Object.entries(validated.fieldErrors)) {
        if (message) {
          setError(field as keyof VehicleFormValues, { type: 'validate', message });
        }
      }
      setError('root', { type: 'validate', message: validated.formError });
      return;
    }

    setHasStartedSave(true);

    startTransition(async () => {
      const result = await createVehicle(validated.data);

      if (!result.success) {
        setHasStartedSave(false);
        setError('root', { type: 'server', message: result.error.message });

        if (result.error.code === 'duplicate_vehicle_number') {
          setError('vehicle_number', {
            type: 'server',
            message: result.error.message,
          });
        }

        // Stay on this page only when create failed — never redirect on error.
        return;
      }

      let imageWarning: string | undefined;

      if (imageFile) {
        try {
          const formData = new FormData();
          formData.set('file', imageFile);
          const uploadResult = await uploadVehicleImageAction(result.data.id, formData);

          if (!uploadResult.success) {
            imageWarning = uploadResult.error.message;
          } else if (uploadResult.data.skipped) {
            imageWarning = 'Image storage is not enabled yet.';
          }
        } catch {
          imageWarning = 'Unable to upload the vehicle image. Please try again.';
        }
      }

      if (imageWarning) {
        toast.success('Vehicle created', {
          description: `${result.data.vehicle_name} was saved, but the image could not be uploaded.`,
        });
        toast.error('Image upload issue', {
          description: imageWarning,
        });
      } else {
        toast.success('Vehicle created', {
          description: `${result.data.vehicle_name} was added to the fleet.`,
        });
      }

      // Always return to Fleet Management after a successful create.
      goToFleetList();
    });
  });

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('space-y-5 sm:space-y-6', className)}
      aria-describedby={formError ? formErrorId : undefined}
    >
      {formError ? (
        <Alert variant="destructive" id={formErrorId}>
          <AlertTitle>Unable to save vehicle</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <FormSection
        title="Basic Information"
        description="Identity and specification details for the vehicle."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            id="vehicle_name"
            label="Vehicle Name"
            required
            error={errors.vehicle_name?.message}
          >
            <Input
              autoFocus
              autoComplete="off"
              placeholder="Innova Crysta — Fleet 01"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'vehicle_name',
                required: true,
                error: errors.vehicle_name?.message,
              })}
              {...register('vehicle_name')}
            />
          </FormField>

          <FormField
            id="vehicle_number"
            label="Registration Number"
            required
            description="Stored in uppercase without spaces."
            error={errors.vehicle_number?.message}
          >
            <Controller
              control={control}
              name="vehicle_number"
              render={({ field }) => (
                <Input
                  autoComplete="off"
                  placeholder="MH12AB1234"
                  className="uppercase"
                  disabled={isLoading}
                  value={field.value}
                  onBlur={field.onBlur}
                  onChange={(event) =>
                    field.onChange(normalizeRegistrationInput(event.target.value))
                  }
                  {...fieldAriaProps({
                    id: 'vehicle_number',
                    required: true,
                    error: errors.vehicle_number?.message,
                    description: 'Stored in uppercase without spaces.',
                  })}
                />
              )}
            />
          </FormField>

          <FormField id="brand" label="Brand" required error={errors.brand?.message}>
            <Input
              autoComplete="organization"
              placeholder="Toyota"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'brand',
                required: true,
                error: errors.brand?.message,
              })}
              {...register('brand')}
            />
          </FormField>

          <FormField id="model" label="Model" required error={errors.model?.message}>
            <Input
              autoComplete="off"
              placeholder="Innova Crysta"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'model',
                required: true,
                error: errors.model?.message,
              })}
              {...register('model')}
            />
          </FormField>

          <FormField id="variant" label="Variant" error={errors.variant?.message}>
            <Input
              autoComplete="off"
              placeholder="ZX AT"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'variant',
                error: errors.variant?.message,
              })}
              {...register('variant')}
            />
          </FormField>

          <FormField id="model_year" label="Model Year" error={errors.model_year?.message}>
            <Controller
              control={control}
              name="model_year"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="numeric"
                  min={1980}
                  max={new Date().getFullYear() + 1}
                  step={1}
                  placeholder="2024"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'model_year',
                    error: errors.model_year?.message,
                  })}
                />
              )}
            />
          </FormField>

          <FormField
            id="color"
            label="Color"
            error={errors.color?.message}
            className="sm:col-span-2"
          >
            <Input
              autoComplete="off"
              placeholder="Pearl White"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'color',
                error: errors.color?.message,
              })}
              {...register('color')}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Rental Information"
        description="Default hire rates used when creating bookings."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField id="fuel_type" label="Fuel Type" required error={errors.fuel_type?.message}>
            <Controller
              control={control}
              name="fuel_type"
              render={({ field }) => (
                <Select
                  value={field.value || undefined}
                  onValueChange={(value) => applySelectValue<FuelType>(value, field.onChange)}
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'fuel_type',
                      required: true,
                      error: errors.fuel_type?.message,
                    })}
                  >
                    <SelectValue placeholder="Select fuel type" />
                  </SelectTrigger>
                  <SelectContent>
                    {FUEL_TYPE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="default_daily_rate"
            label="Default Daily Rate"
            required
            description="INR per day."
            error={errors.default_daily_rate?.message}
          >
            <Controller
              control={control}
              name="default_daily_rate"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="3500"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'default_daily_rate',
                    required: true,
                    error: errors.default_daily_rate?.message,
                    description: 'INR per day.',
                  })}
                />
              )}
            />
          </FormField>

          <FormField
            id="extra_kilometer_rate"
            label="Extra Kilometer Rate"
            error={errors.extra_kilometer_rate?.message}
          >
            <Controller
              control={control}
              name="extra_kilometer_rate"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="12"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'extra_kilometer_rate',
                    error: errors.extra_kilometer_rate?.message,
                  })}
                />
              )}
            />
          </FormField>

          <FormField
            id="security_deposit"
            label="Security Deposit"
            error={errors.security_deposit?.message}
          >
            <Controller
              control={control}
              name="security_deposit"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="5000"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'security_deposit',
                    error: errors.security_deposit?.message,
                  })}
                />
              )}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection
        title="Operational Information"
        description="Current meter reading and fleet status."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField
            id="current_odometer"
            label="Current Odometer"
            required
            description="Kilometers."
            error={errors.current_odometer?.message}
          >
            <Controller
              control={control}
              name="current_odometer"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'current_odometer',
                    required: true,
                    error: errors.current_odometer?.message,
                    description: 'Kilometers.',
                  })}
                />
              )}
            />
          </FormField>

          <FormField
            id="availability_status"
            label="Availability Status"
            required
            error={errors.availability_status?.message}
          >
            <Controller
              control={control}
              name="availability_status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    applySelectValue<VehicleAvailabilityStatus>(value, field.onChange)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'availability_status',
                      required: true,
                      error: errors.availability_status?.message,
                    })}
                  >
                    <SelectValue placeholder="Select availability" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_AVAILABILITY_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>

          <FormField
            id="vehicle_status"
            label="Vehicle Status"
            required
            error={errors.vehicle_status?.message}
          >
            <Controller
              control={control}
              name="vehicle_status"
              render={({ field }) => (
                <Select
                  value={field.value}
                  onValueChange={(value) =>
                    applySelectValue<VehicleStatusValue>(value, field.onChange)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'vehicle_status',
                      required: true,
                      error: errors.vehicle_status?.message,
                    })}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    {VEHICLE_STATUS_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </FormField>
        </div>
      </FormSection>

      <FormSection title="Vehicle Image" description="Optional photo stored in Supabase Storage.">
        <VehicleImageField
          file={imageFile}
          disabled={isLoading}
          onChange={(file) => {
            setImageFile(file);
            setImageDirty(true);
          }}
        />
      </FormSection>

      <div className="sticky bottom-0 z-20 -mx-4 mt-2 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex w-full items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            className="min-h-9 min-w-24 sm:min-h-8"
            disabled={isLoading}
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            className="min-h-9 min-w-36 sm:min-h-8"
            disabled={isLoading}
            aria-busy={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                Saving…
              </>
            ) : (
              'Save Vehicle'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}
