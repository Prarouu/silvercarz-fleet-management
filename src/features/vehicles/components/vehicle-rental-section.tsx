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
import { FUEL_TYPE_OPTIONS, type FuelType } from '@/types';

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
  );
}
