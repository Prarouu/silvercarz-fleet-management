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
  createBookingService,
  getBookingService,
  createUnauthorizedBookingAccessError,
  type BookingService,
  type BookingServiceDeps,
} from './booking-service';
