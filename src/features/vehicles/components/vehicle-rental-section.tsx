'use client';

import { Controller } from 'react-hook-form';

import { FormField, fieldAriaProps } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import type { VehicleFormSectionProps } from '@/features/vehicles/components/vehicle-form-section-types';
import { parseOptionalNumber } from '@/features/vehicles/lib/vehicle-form';
import {
  FUEL_TYPE_OPTIONS,
  TRANSMISSION_TYPE_OPTIONS,
  type FuelType,
  type TransmissionType,
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

export function VehicleRentalSection({ control, errors, isLoading }: VehicleFormSectionProps) {
  return (
    <FormSection
      title="Rental Information"
      description="Fuel, gearbox, and default hire rate used when creating bookings."
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
          id="transmission_type"
          label="Transmission Type"
          required
          error={errors.transmission_type?.message}
        >
          <Controller
            control={control}
            name="transmission_type"
            render={({ field }) => (
              <Select
                value={field.value || undefined}
                onValueChange={(value) => applySelectValue<TransmissionType>(value, field.onChange)}
                disabled={isLoading}
              >
                <SelectTrigger
                  className="w-full"
                  {...fieldAriaProps({
                    id: 'transmission_type',
                    required: true,
                    error: errors.transmission_type?.message,
                  })}
                >
                  <SelectValue placeholder="Select transmission type" />
                </SelectTrigger>
                <SelectContent>
                  {TRANSMISSION_TYPE_OPTIONS.map((option) => (
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
          className="sm:col-span-2"
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
      </div>
    </FormSection>
  );
}
