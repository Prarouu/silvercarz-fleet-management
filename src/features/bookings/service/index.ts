export {
  calculateBookingAmount,
  calculateDurationDays,
  calculateTotalAmount,
  calculateTotalKilometers,
  buildInvoiceNumberSuggestion,
} from './booking-calculations';

export {
  createInvoiceNumberService,
  getInvoiceNumberService,
  type GenerateInvoiceNumberOptions,
  type InvoiceNumberService,
  type InvoiceNumberServiceDeps,
} from './invoice-number.service';

export {
  CONFLICT_BLOCKING_STATUSES,
  CONFLICT_IGNORED_STATUSES,
  createConflictService,
  datesOverlap,
  getConflictService,
  isConflictBlockingStatus,
  type ConflictService,
  type ConflictServiceDeps,
  type NextAvailableDateParams,
  type NextAvailableDateResult,
} from './conflict.service';

export {
  BOOKING_DISPLAY_STATUSES,
  BOOKING_DISPLAY_STATUS_BADGE_VARIANTS,
  BOOKING_DISPLAY_STATUS_DESCRIPTIONS,
  BOOKING_DISPLAY_STATUS_LABELS,
  BOOKING_DISPLAY_STATUS_OPTIONS,
  BOOKING_DISPLAY_STATUS_VALUES,
  BOOKING_LIFECYCLE_STATUSES,
  BOOKING_TERMINAL_STATUSES,
  countBookingsByDisplayStatus,
  createBookingStatusService,
  getBookingStatusPresentation,
  getBookingStatusService,
  isBookingDisplayStatus,
  isScheduleBlockingBooking,
  isScheduleBlockingDisplayStatus,
  isTerminalStoredStatus,
  resolveBookingDisplayStatus,
  resolveLifecycleStatus,
  resolvePersistedBookingStatus,
  todayIsoDate as statusTodayIsoDate,
  toPersistedBookingStatus,
  type BookingDisplayStatus,
  type BookingLifecycleStatus,
  type BookingStatusBadgeVariant,
  type BookingStatusInput,
  type BookingStatusKind,
  type BookingStatusMetrics,
  type BookingStatusPresentation,
  type BookingStatusService,
  type BookingStatusServiceDeps,
  type BookingTerminalStatus,
} from './status.service';

export {
  createBookingService,
  getBookingService,
  createUnauthorizedBookingAccessError,
  type BookingService,
  type BookingServiceDeps,
} from './booking-service';
