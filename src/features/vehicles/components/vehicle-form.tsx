'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useState, useTransition } from 'react';
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/constants/routes';
import { createVehicle } from '@/features/vehicles/actions/create-vehicle';
import { removeVehicleImageAction } from '@/features/vehicles/actions/remove-vehicle-image';
import { updateVehicle } from '@/features/vehicles/actions/update-vehicle';
import { uploadVehicleImageAction } from '@/features/vehicles/actions/upload-vehicle-image';
import { VehicleBasicSection } from '@/features/vehicles/components/vehicle-basic-section';
import { VehicleImageSection } from '@/features/vehicles/components/vehicle-image-section';
import { VehicleOperationalSection } from '@/features/vehicles/components/vehicle-operational-section';
import { VehicleRentalSection } from '@/features/vehicles/components/vehicle-rental-section';
import {
  createVehicleFormDefaults,
  validateCreateVehicleForm,
  validateUpdateVehicleForm,
  type VehicleFormValues,
} from '@/features/vehicles/lib/vehicle-form';
import { getVehicleImagePublicUrl } from '@/features/vehicles/lib/vehicle-image-url';
import { cn } from '@/lib/utils';

type VehicleFormCreateProps = {
  readonly mode: 'create';
  readonly className?: string;
};

type VehicleFormEditProps = {
  readonly mode: 'edit';
  readonly vehicleId: string;
  readonly defaultValues: VehicleFormValues;
  readonly existingImagePath?: string | null;
  readonly className?: string;
};

export type VehicleFormProps = VehicleFormCreateProps | VehicleFormEditProps;

const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Leave this page? Your edits will be lost.';

const NO_CHANGES_MESSAGE = 'No changes detected.';

export function VehicleForm(props: VehicleFormProps) {
  const { mode, className } = props;
  const router = useRouter();
  const formErrorId = useId();
  const [isPending, startTransition] = useTransition();
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imageRemoved, setImageRemoved] = useState(false);
  const [imageDirty, setImageDirty] = useState(false);
  /** Prevents duplicate Server Action calls from double-submit. */
  const [hasStartedSave, setHasStartedSave] = useState(false);

  const initialValues = mode === 'edit' ? props.defaultValues : createVehicleFormDefaults();

  const existingImageUrl =
    mode === 'edit' && !imageRemoved ? getVehicleImagePublicUrl(props.existingImagePath) : null;

  const {
    control,
    register,
    handleSubmit,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<VehicleFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const isLoading = isSubmitting || isPending || hasStartedSave;
  const formError = errors.root?.message;
  const hasFieldChanges = isDirty;
  const hasImageChanges = imageDirty;
  const hasChanges = hasFieldChanges || hasImageChanges;
  const hasUnsavedChanges = hasChanges;
  const canSave = mode === 'create' ? true : hasChanges;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      // Skip while saving — a successful save navigates away with a full load.
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
    // seen after create/update (especially with the slow fleet list RSC).
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

    if (mode === 'edit' && !hasChanges) {
      setError('root', { type: 'validate', message: NO_CHANGES_MESSAGE });
      return;
    }

    if (mode === 'create') {
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

        goToFleetList();
      });
      return;
    }

    const validated = validateUpdateVehicleForm(values);

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
      const vehicleId = props.vehicleId;
      let vehicleName = props.defaultValues.vehicle_name;

      if (hasFieldChanges) {
        const result = await updateVehicle(vehicleId, validated.data);

        if (!result.success) {
          setHasStartedSave(false);
          setError('root', { type: 'server', message: result.error.message });

          if (result.error.code === 'duplicate_vehicle_number') {
            setError('vehicle_number', {
              type: 'server',
              message: result.error.message,
            });
          }

          if (result.error.code === 'vehicle_not_found') {
            setError('root', {
              type: 'server',
              message: result.error.message,
            });
          }

          return;
        }

        vehicleName = result.data.vehicle_name;
      }

      let imageWarning: string | undefined;

      if (imageFile) {
        try {
          const formData = new FormData();
          formData.set('file', imageFile);
          const uploadResult = await uploadVehicleImageAction(vehicleId, formData);

          if (!uploadResult.success) {
            imageWarning = uploadResult.error.message;
          } else if (uploadResult.data.skipped) {
            imageWarning = 'Image storage is not enabled yet.';
          }
        } catch {
          imageWarning = 'Unable to upload the vehicle image. Please try again.';
        }
      } else if (imageRemoved && props.existingImagePath) {
        try {
          const removeResult = await removeVehicleImageAction(vehicleId);

          if (!removeResult.success) {
            imageWarning = removeResult.error.message;
          }
        } catch {
          imageWarning = 'Unable to remove the vehicle image. Please try again.';
        }
      }

      if (imageWarning) {
        toast.success('Vehicle updated', {
          description: `${vehicleName} was saved, but the image could not be updated.`,
        });
        toast.error('Image update issue', {
          description: imageWarning,
        });
      } else {
        toast.success('Vehicle updated', {
          description: `${vehicleName} was updated successfully.`,
        });
      }

      goToFleetList();
    });
  });

  const submitLabel = mode === 'edit' ? 'Save Changes' : 'Save Vehicle';
  const submittingLabel = mode === 'edit' ? 'Updating…' : 'Saving…';
  const alertTitle = mode === 'edit' ? 'Unable to update vehicle' : 'Unable to save vehicle';
  const sectionProps = { control, register, errors, isLoading };

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('space-y-5 sm:space-y-6', className)}
      aria-describedby={formError ? formErrorId : undefined}
    >
      {formError ? (
        <Alert variant="destructive" id={formErrorId}>
          <AlertTitle>{alertTitle}</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <VehicleBasicSection {...sectionProps} />
      <VehicleRentalSection {...sectionProps} />
      <VehicleOperationalSection {...sectionProps} />
      <VehicleImageSection
        file={imageFile}
        existingImageUrl={existingImageUrl}
        disabled={isLoading}
        onChange={(file) => {
          setImageFile(file);
          setImageRemoved(false);
          setImageDirty(true);
        }}
        onClearExisting={() => {
          setImageFile(null);
          setImageRemoved(true);
          setImageDirty(true);
        }}
      />

      <div className="sticky bottom-0 z-20 -mx-4 mt-2 border-t bg-background/95 px-4 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur supports-backdrop-filter:bg-background/80 md:-mx-6 md:px-6 lg:-mx-8 lg:px-8">
        <div className="flex w-full flex-col gap-2 sm:flex-row sm:items-center sm:justify-end">
          {mode === 'edit' && !hasChanges ? (
            <p className="text-sm text-muted-foreground sm:mr-auto" role="status">
              {NO_CHANGES_MESSAGE}
            </p>
          ) : null}
          <div className="flex items-center justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              className="min-w-24"
              disabled={isLoading}
              onClick={handleCancel}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              className="min-w-36"
              disabled={isLoading || !canSave}
              aria-busy={isLoading}
            >
              {isLoading ? (
                <>
                  <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                  {submittingLabel}
                </>
              ) : (
                submitLabel
              )}
            </Button>
          </div>
        </div>
      </div>
    </form>
  );
}
