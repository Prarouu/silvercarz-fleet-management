export {
  createVehicleService,
  getVehicleService,
  createUnauthorizedVehicleAccessError,
  type VehicleService,
  type VehicleServiceDeps,
} from './vehicle-service';

export {
  createAvailabilityService,
  getAvailabilityService,
  resolveAvailabilityFromBookings,
  type AvailabilityService,
  type AvailabilityServiceDeps,
} from './availability.service';
