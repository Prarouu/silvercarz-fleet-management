'use client';

import { Controller } from 'react-hook-form';

import { FormField, fieldAriaProps } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VehicleFormSectionProps } from '@/features/vehicles/components/vehicle-form-section-types';
import {
  VEHICLE_STATUS_OPTIONS,
  type VehicleStatusValue,
} from '@/features/vehicles/lib/vehicle-form';
import { VEHICLE_AVAILABILITY_STATUS_OPTIONS, type VehicleAvailabilityStatus } from '@/types';

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

export function VehicleOperationalSection({ control, errors, isLoading }: VehicleFormSectionProps) {
  return (
    <FormSection
      title="Operational Information"
      description="Fleet availability and roster status."
    >
      <div className="grid gap-4 sm:grid-cols-2">
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
  );
}
