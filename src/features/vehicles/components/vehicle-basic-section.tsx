'use client';

import { Controller } from 'react-hook-form';

import { FormField, fieldAriaProps } from '@/components/shared/form-field';
import { FormSection } from '@/components/shared/form-section';
import { Input } from '@/components/ui/input';
import type { VehicleFormSectionProps } from '@/features/vehicles/components/vehicle-form-section-types';
import { normalizeRegistrationInput } from '@/features/vehicles/lib/vehicle-form';

export function VehicleBasicSection({
  control,
  register,
  errors,
  isLoading,
}: VehicleFormSectionProps) {
  return (
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
                onChange={(event) => field.onChange(normalizeRegistrationInput(event.target.value))}
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

        <FormField id="color" label="Color" error={errors.color?.message}>
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
  );
}
