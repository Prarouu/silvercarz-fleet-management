'use client';

import { Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useId, useTransition } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { toast } from 'sonner';

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ROUTES } from '@/constants/routes';
import { createBooking } from '@/features/bookings/actions/create-booking';
import { updateBooking } from '@/features/bookings/actions/update-booking';
import {
  BookingFormField,
  fieldAriaProps,
} from '@/features/bookings/components/booking-form-field';
import { BookingFormSection } from '@/features/bookings/components/booking-form-section';
import {
  BOOKING_PAYMENT_OPTIONS,
  createBookingFormDefaults,
  formatVehicleOptionLabel,
  isVehicleSelectionBlocked,
  parseOptionalNumber,
  validateCreateBookingForm,
  validateUpdateBookingForm,
  type BookingFormValues,
  type VehicleSelectOption,
} from '@/features/bookings/lib/booking-form';
import {
  calculateBookingAmount,
  calculateDurationDays,
  calculateTotalAmount,
  calculateTotalKilometers,
} from '@/features/bookings/service/booking-calculations';
import { cn } from '@/lib/utils';
import { RENTAL_MODE_OPTIONS, type BookingStatus } from '@/types';

type BookingFormBaseProps = {
  readonly vehicles: readonly VehicleSelectOption[];
  readonly className?: string;
};

type CreateBookingFormProps = BookingFormBaseProps & {
  readonly mode: 'create';
  readonly suggestedInvoiceNumber?: string;
};

type EditBookingFormProps = BookingFormBaseProps & {
  readonly mode: 'edit';
  readonly bookingId: string;
  readonly bookingStatus: BookingStatus;
  readonly defaultValues: BookingFormValues;
};

export type BookingFormProps = CreateBookingFormProps | EditBookingFormProps;

type PaymentMethodValue = NonNullable<BookingFormValues['payment_method']>;

const UNSAVED_CHANGES_MESSAGE =
  'You have unsaved changes. Leave this page? Your edits will be lost.';

export function BookingForm(props: BookingFormProps) {
  const { vehicles, className, mode } = props;
  const router = useRouter();
  const formErrorId = useId();
  const [isPending, startTransition] = useTransition();

  const initialValues =
    mode === 'edit' ? props.defaultValues : createBookingFormDefaults(props.suggestedInvoiceNumber);

  const {
    control,
    register,
    handleSubmit,
    setValue,
    setError,
    clearErrors,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<BookingFormValues>({
    defaultValues: initialValues,
    mode: 'onBlur',
    reValidateMode: 'onChange',
  });

  const deliveryDate = useWatch({ control, name: 'delivery_date' });
  const returnDate = useWatch({ control, name: 'return_date' });
  const startOdometer = useWatch({ control, name: 'start_odometer' });
  const endOdometer = useWatch({ control, name: 'end_odometer' });
  const dailyCharge = useWatch({ control, name: 'daily_charge' });
  const kilometerRate = useWatch({ control, name: 'kilometer_rate' });
  const duration = useWatch({ control, name: 'duration' });
  const totalKilometers = useWatch({ control, name: 'total_kilometers' });
  const bookingAmountValue = useWatch({ control, name: 'booking_amount' });
  const totalAmountValue = useWatch({ control, name: 'total_amount' });

  useEffect(() => {
    if (!deliveryDate || !returnDate) {
      return;
    }

    const nextDuration = calculateDurationDays(deliveryDate, returnDate);
    const nextValue = nextDuration > 0 ? nextDuration : null;
    if (nextValue === duration) {
      return;
    }
    setValue('duration', nextValue, {
      shouldValidate: false,
      shouldDirty: false,
    });
  }, [deliveryDate, returnDate, duration, setValue]);

  useEffect(() => {
    const nextKm = calculateTotalKilometers(startOdometer, endOdometer);
    if (nextKm === totalKilometers) {
      return;
    }
    setValue('total_kilometers', nextKm, { shouldValidate: false, shouldDirty: false });
  }, [startOdometer, endOdometer, totalKilometers, setValue]);

  useEffect(() => {
    if (dailyCharge == null || duration == null || duration <= 0) {
      return;
    }

    const bookingAmount = calculateBookingAmount({
      dailyCharge,
      durationDays: duration,
      kilometerRate,
      totalKilometers,
    });
    const totalAmount = calculateTotalAmount(bookingAmount);

    if (bookingAmount !== bookingAmountValue) {
      setValue('booking_amount', bookingAmount, { shouldValidate: false, shouldDirty: false });
    }
    if (totalAmount !== totalAmountValue) {
      setValue('total_amount', totalAmount, { shouldValidate: false, shouldDirty: false });
    }
  }, [
    dailyCharge,
    duration,
    kilometerRate,
    totalKilometers,
    bookingAmountValue,
    totalAmountValue,
    setValue,
  ]);

  const isLoading = isSubmitting || isPending;
  const formError = errors.root?.message;

  useEffect(() => {
    const onBeforeUnload = (event: BeforeUnloadEvent) => {
      if (!isDirty || isLoading) {
        return;
      }

      event.preventDefault();
      event.returnValue = '';
    };

    window.addEventListener('beforeunload', onBeforeUnload);
    return () => window.removeEventListener('beforeunload', onBeforeUnload);
  }, [isDirty, isLoading]);

  const handleCancel = () => {
    if (isDirty && !window.confirm(UNSAVED_CHANGES_MESSAGE)) {
      return;
    }

    router.push(ROUTES.bookings);
  };

  const onSubmit = handleSubmit((values) => {
    clearErrors('root');

    if (mode === 'create') {
      const validated = validateCreateBookingForm(values);

      if (!validated.success) {
        for (const [field, message] of Object.entries(validated.fieldErrors)) {
          if (message) {
            setError(field as keyof BookingFormValues, { type: 'validate', message });
          }
        }
        setError('root', { type: 'validate', message: validated.formError });
        return;
      }

      startTransition(async () => {
        const result = await createBooking(validated.data);

        if (!result.success) {
          setError('root', { type: 'server', message: result.error.message });

          if (result.error.code === 'duplicate_invoice') {
            setError('invoice_number', {
              type: 'server',
              message: result.error.message,
            });
          }

          if (result.error.code === 'invoice_generation_failed') {
            setError('invoice_number', {
              type: 'server',
              message: result.error.message,
            });
          }

          if (
            result.error.code === 'vehicle_unavailable' ||
            result.error.code === 'booking_conflict'
          ) {
            setError('vehicle_id', {
              type: 'server',
              message: result.error.message,
            });
            setError('delivery_date', {
              type: 'server',
              message: 'Choose dates that do not overlap an existing hire.',
            });
            setError('return_date', {
              type: 'server',
              message: 'Choose dates that do not overlap an existing hire.',
            });
          }

          return;
        }

        toast.success('Booking created', {
          description: `Invoice ${result.data.invoice_number} was saved successfully.`,
        });
        router.push(ROUTES.bookings);
        router.refresh();
      });
      return;
    }

    const validated = validateUpdateBookingForm(values, props.bookingStatus);

    if (!validated.success) {
      for (const [field, message] of Object.entries(validated.fieldErrors)) {
        if (message) {
          setError(field as keyof BookingFormValues, { type: 'validate', message });
        }
      }
      setError('root', { type: 'validate', message: validated.formError });
      return;
    }

    startTransition(async () => {
      const result = await updateBooking(props.bookingId, validated.data);

      if (!result.success) {
        setError('root', { type: 'server', message: result.error.message });

        if (result.error.code === 'duplicate_invoice') {
          setError('invoice_number', {
            type: 'server',
            message: result.error.message,
          });
        }

        if (
          result.error.code === 'vehicle_unavailable' ||
          result.error.code === 'booking_conflict'
        ) {
          setError('vehicle_id', {
            type: 'server',
            message: result.error.message,
          });
          setError('delivery_date', {
            type: 'server',
            message: 'Choose dates that do not overlap an existing hire.',
          });
          setError('return_date', {
            type: 'server',
            message: 'Choose dates that do not overlap an existing hire.',
          });
        }

        if (result.error.code === 'booking_not_found') {
          setError('root', {
            type: 'server',
            message: result.error.message,
          });
        }

        return;
      }

      toast.success('Booking updated', {
        description: `Invoice ${result.data.invoice_number} was saved successfully.`,
      });
      router.push(ROUTES.bookings);
      router.refresh();
    });
  });

  const submitLabel = mode === 'edit' ? 'Update Booking' : 'Save Booking';
  const submittingLabel = mode === 'edit' ? 'Updating…' : 'Saving…';
  const alertTitle = mode === 'edit' ? 'Unable to update booking' : 'Unable to save booking';

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className={cn('space-y-5 sm:space-y-6', className)}
      aria-describedby={formError ? formErrorId : undefined}
    >
      {formError ? (
        <Alert variant="destructive" id={formErrorId} aria-live="assertive">
          <AlertTitle>{alertTitle}</AlertTitle>
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <BookingFormSection
        title="Booking Information"
        description="Invoice identity and rental mode for this booking."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BookingFormField
            id="invoice_number"
            label="Invoice Number"
            required
            description={
              mode === 'create'
                ? 'Assigned automatically when you save. Preview may change if another booking is created first.'
                : 'Invoice numbers are permanent and cannot be edited.'
            }
            error={errors.invoice_number?.message}
          >
            <Input
              autoComplete="off"
              readOnly
              tabIndex={-1}
              placeholder="SC-2026-00001"
              disabled={isLoading}
              className="bg-muted/40"
              {...fieldAriaProps({
                id: 'invoice_number',
                required: true,
                error: errors.invoice_number?.message,
                description:
                  mode === 'create'
                    ? 'Assigned automatically when you save. Preview may change if another booking is created first.'
                    : 'Invoice numbers are permanent and cannot be edited.',
              })}
              {...register('invoice_number')}
            />
          </BookingFormField>

          <BookingFormField id="mode" label="Rental Mode" required error={errors.mode?.message}>
            <Controller
              control={control}
              name="mode"
              render={({ field }) => (
                <Select value={field.value} onValueChange={field.onChange} disabled={isLoading}>
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'mode',
                      required: true,
                      error: errors.mode?.message,
                    })}
                  >
                    <SelectValue placeholder="Select mode" />
                  </SelectTrigger>
                  <SelectContent>
                    {RENTAL_MODE_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="invoice_date"
            label="Invoice Date"
            required
            error={errors.invoice_date?.message}
          >
            <Input
              type="date"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'invoice_date',
                required: true,
                error: errors.invoice_date?.message,
              })}
              {...register('invoice_date')}
            />
          </BookingFormField>
        </div>
      </BookingFormSection>

      <BookingFormSection
        title="Customer Information"
        description="Who is hiring the vehicle and how to reach them."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BookingFormField
            id="customer_name"
            label="Customer Name"
            required
            error={errors.customer_name?.message}
          >
            <Input
              autoFocus={mode === 'create'}
              autoComplete="name"
              placeholder="Customer full name"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'customer_name',
                required: true,
                error: errors.customer_name?.message,
              })}
              {...register('customer_name')}
            />
          </BookingFormField>

          <BookingFormField
            id="contact_number"
            label="Contact Number"
            error={errors.contact_number?.message}
          >
            <Input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="+91 98765 43210"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'contact_number', error: errors.contact_number?.message })}
              {...register('contact_number')}
            />
          </BookingFormField>

          <BookingFormField
            id="address"
            label="Address"
            className="sm:col-span-2"
            error={errors.address?.message}
          >
            <Textarea
              rows={2}
              placeholder="Street address"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'address', error: errors.address?.message })}
              {...register('address')}
            />
          </BookingFormField>

          <BookingFormField id="city" label="City" error={errors.city?.message}>
            <Input
              autoComplete="address-level2"
              placeholder="Nagpur"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'city', error: errors.city?.message })}
              {...register('city')}
            />
          </BookingFormField>

          <BookingFormField id="state" label="State" error={errors.state?.message}>
            <Input
              autoComplete="address-level1"
              placeholder="Maharashtra"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'state', error: errors.state?.message })}
              {...register('state')}
            />
          </BookingFormField>

          <BookingFormField
            id="zip_code"
            label="ZIP Code"
            description="6-digit Indian PIN code."
            error={errors.zip_code?.message}
          >
            <Input
              inputMode="numeric"
              autoComplete="postal-code"
              placeholder="440001"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'zip_code',
                error: errors.zip_code?.message,
                description: '6-digit Indian PIN code.',
              })}
              {...register('zip_code')}
            />
          </BookingFormField>

          <div className="flex items-start gap-3 rounded-lg border border-border/70 bg-muted/20 px-3 py-3 sm:col-span-2">
            <Controller
              control={control}
              name="document_submitted"
              render={({ field }) => (
                <Checkbox
                  id="document_submitted"
                  checked={field.value}
                  onCheckedChange={(checked) => field.onChange(checked === true)}
                  disabled={isLoading}
                  aria-invalid={errors.document_submitted ? true : undefined}
                  className="mt-0.5"
                />
              )}
            />
            <div className="grid gap-1">
              <Label htmlFor="document_submitted" className="font-medium">
                Document Submitted
              </Label>
              <p className="text-xs leading-relaxed text-muted-foreground">
                Confirm that customer ID / license documents were collected.
              </p>
              {errors.document_submitted?.message ? (
                <p className="text-sm text-destructive" role="alert">
                  {errors.document_submitted.message}
                </p>
              ) : null}
            </div>
          </div>
        </div>
      </BookingFormSection>

      <BookingFormSection
        title="Trip Information"
        description="Vehicle assignment and rental period."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BookingFormField
            id="vehicle_id"
            label="Vehicle"
            required
            description="Available vehicles can be selected. Booked, maintenance, and inactive vehicles are disabled."
            error={errors.vehicle_id?.message}
            className="sm:col-span-2"
          >
            <Controller
              control={control}
              name="vehicle_id"
              render={({ field }) => (
                <Select
                  value={field.value ? field.value : undefined}
                  onValueChange={(value) => {
                    if (!value) {
                      return;
                    }
                    const selected = vehicles.find((vehicle) => vehicle.id === value);
                    if (
                      selected &&
                      isVehicleSelectionBlocked(selected) &&
                      selected.id !== field.value
                    ) {
                      return;
                    }
                    field.onChange(value);
                  }}
                  disabled={isLoading || vehicles.length === 0}
                >
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'vehicle_id',
                      required: true,
                      error: errors.vehicle_id?.message,
                      description:
                        'Available vehicles can be selected. Booked, maintenance, and inactive vehicles are disabled.',
                    })}
                  >
                    <SelectValue
                      placeholder={
                        vehicles.length === 0 ? 'No vehicles available' : 'Select vehicle'
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {vehicles.map((vehicle) => {
                      const blocked =
                        isVehicleSelectionBlocked(vehicle) && vehicle.id !== field.value;

                      return (
                        <SelectItem
                          key={vehicle.id}
                          value={vehicle.id}
                          disabled={blocked}
                          aria-label={
                            blocked
                              ? `${formatVehicleOptionLabel(vehicle)} (not selectable)`
                              : formatVehicleOptionLabel(vehicle)
                          }
                        >
                          {formatVehicleOptionLabel(vehicle)}
                        </SelectItem>
                      );
                    })}
                  </SelectContent>
                </Select>
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="driver_name"
            label="Driver Name"
            error={errors.driver_name?.message}
          >
            <Input
              autoComplete="off"
              placeholder="Driver name (if applicable)"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'driver_name', error: errors.driver_name?.message })}
              {...register('driver_name')}
            />
          </BookingFormField>

          <BookingFormField
            id="place_to_visit"
            label="Place To Visit"
            error={errors.place_to_visit?.message}
          >
            <Input
              autoComplete="off"
              placeholder="Destination or trip purpose"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'place_to_visit', error: errors.place_to_visit?.message })}
              {...register('place_to_visit')}
            />
          </BookingFormField>

          <BookingFormField
            id="delivery_date"
            label="Delivery Date"
            required
            error={errors.delivery_date?.message}
          >
            <Input
              type="date"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'delivery_date',
                required: true,
                error: errors.delivery_date?.message,
              })}
              {...register('delivery_date')}
            />
          </BookingFormField>

          <BookingFormField
            id="return_date"
            label="Return Date"
            required
            error={errors.return_date?.message}
          >
            <Input
              type="date"
              disabled={isLoading}
              {...fieldAriaProps({
                id: 'return_date',
                required: true,
                error: errors.return_date?.message,
              })}
              {...register('return_date')}
            />
          </BookingFormField>
        </div>
      </BookingFormSection>

      <BookingFormSection
        title="Pricing"
        description="Charges, distance, and duration. Derived fields update automatically."
      >
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <BookingFormField
            id="daily_charge"
            label="Per Day Charge"
            required
            error={errors.daily_charge?.message}
          >
            <Controller
              control={control}
              name="daily_charge"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'daily_charge',
                    required: true,
                    error: errors.daily_charge?.message,
                  })}
                />
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="duration"
            label="Duration"
            description="Inclusive days from delivery to return."
            error={errors.duration?.message}
          >
            <Input
              type="number"
              inputMode="numeric"
              readOnly
              tabIndex={-1}
              disabled={isLoading}
              value={duration ?? ''}
              className="bg-muted/40"
              {...fieldAriaProps({
                id: 'duration',
                error: errors.duration?.message,
                description: 'Inclusive days from delivery to return.',
              })}
            />
          </BookingFormField>

          <BookingFormField id="fuel_range" label="Fuel Range" error={errors.fuel_range?.message}>
            <Input
              autoComplete="off"
              placeholder="e.g. Full / Half"
              disabled={isLoading}
              {...fieldAriaProps({ id: 'fuel_range', error: errors.fuel_range?.message })}
              {...register('fuel_range')}
            />
          </BookingFormField>

          <BookingFormField
            id="start_odometer"
            label="Start Odometer"
            error={errors.start_odometer?.message}
          >
            <Controller
              control={control}
              name="start_odometer"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  placeholder="0"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'start_odometer',
                    error: errors.start_odometer?.message,
                  })}
                />
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="end_odometer"
            label="End Odometer"
            error={errors.end_odometer?.message}
          >
            <Controller
              control={control}
              name="end_odometer"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="1"
                  placeholder="0"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({ id: 'end_odometer', error: errors.end_odometer?.message })}
                />
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="total_kilometers"
            label="Total Kilometers"
            description="Calculated from odometer readings."
            error={errors.total_kilometers?.message}
          >
            <Input
              type="number"
              inputMode="decimal"
              readOnly
              tabIndex={-1}
              disabled={isLoading}
              value={totalKilometers ?? ''}
              className="bg-muted/40"
              {...fieldAriaProps({
                id: 'total_kilometers',
                error: errors.total_kilometers?.message,
                description: 'Calculated from odometer readings.',
              })}
            />
          </BookingFormField>

          <BookingFormField
            id="kilometer_rate"
            label="Kilometer Rate"
            error={errors.kilometer_rate?.message}
          >
            <Controller
              control={control}
              name="kilometer_rate"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  placeholder="0.00"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value))}
                  {...fieldAriaProps({
                    id: 'kilometer_rate',
                    error: errors.kilometer_rate?.message,
                  })}
                />
              )}
            />
          </BookingFormField>
        </div>
      </BookingFormSection>

      <BookingFormSection
        title="Payment"
        description="Amounts collected for this booking. Caution money is tracked separately."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <BookingFormField
            id="booking_amount"
            label="Booking Amount"
            description="Auto-calculated from per-day charge, duration, and km rate."
            error={errors.booking_amount?.message}
          >
            <Controller
              control={control}
              name="booking_amount"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value) ?? 0)}
                  {...fieldAriaProps({
                    id: 'booking_amount',
                    error: errors.booking_amount?.message,
                    description: 'Auto-calculated from per-day charge, duration, and km rate.',
                  })}
                />
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="caution_money"
            label="Caution Money"
            error={errors.caution_money?.message}
          >
            <Controller
              control={control}
              name="caution_money"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value) ?? 0)}
                  {...fieldAriaProps({
                    id: 'caution_money',
                    error: errors.caution_money?.message,
                  })}
                />
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="payment_method"
            label="Payment Method"
            error={errors.payment_method?.message}
          >
            <Controller
              control={control}
              name="payment_method"
              render={({ field }) => (
                <Select
                  value={field.value ?? undefined}
                  onValueChange={(value) =>
                    field.onChange((value as PaymentMethodValue | null) ?? null)
                  }
                  disabled={isLoading}
                >
                  <SelectTrigger
                    className="w-full"
                    {...fieldAriaProps({
                      id: 'payment_method',
                      error: errors.payment_method?.message,
                    })}
                  >
                    <SelectValue placeholder="Select payment method" />
                  </SelectTrigger>
                  <SelectContent>
                    {BOOKING_PAYMENT_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            />
          </BookingFormField>

          <BookingFormField
            id="total_amount"
            label="Total Amount"
            description="Defaults to booking amount; ready for future total rules."
            error={errors.total_amount?.message}
          >
            <Controller
              control={control}
              name="total_amount"
              render={({ field }) => (
                <Input
                  type="number"
                  inputMode="decimal"
                  min={0}
                  step="0.01"
                  disabled={isLoading}
                  value={field.value ?? ''}
                  onBlur={field.onBlur}
                  onChange={(event) => field.onChange(parseOptionalNumber(event.target.value) ?? 0)}
                  {...fieldAriaProps({
                    id: 'total_amount',
                    error: errors.total_amount?.message,
                    description: 'Defaults to booking amount; ready for future total rules.',
                  })}
                />
              )}
            />
          </BookingFormField>
        </div>
      </BookingFormSection>

      <BookingFormSection title="Notes" description="Optional internal remarks for this booking.">
        <BookingFormField id="notes" label="Additional Notes" error={errors.notes?.message}>
          <Textarea
            rows={4}
            placeholder="Any additional notes…"
            disabled={isLoading}
            {...fieldAriaProps({ id: 'notes', error: errors.notes?.message })}
            {...register('notes')}
          />
        </BookingFormField>
      </BookingFormSection>

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
            className="min-h-9 min-w-32 sm:min-h-8"
            disabled={isLoading}
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
    </form>
  );
}
