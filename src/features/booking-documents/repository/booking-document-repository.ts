/**
 * Booking document repository — persistence only.
 */

import 'server-only';

import {
  createBookingDocumentDatabaseFailureError,
  createBookingDocumentNotFoundError,
} from '@/features/booking-documents/errors';
import { AppError } from '@/lib/errors';
import type { TypedSupabaseClient } from '@/lib/supabase';
import { normalizeSupabaseError } from '@/lib/supabase/errors';
import { createSupabaseServerClient } from '@/lib/supabase/server';
import type {
  BookingDocument,
  BookingDocumentCreateInput,
  BookingDocumentUpdateInput,
} from '@/types/booking-document';

export interface BookingDocumentRepository {
  listForBooking(bookingId: string): Promise<BookingDocument[]>;
  findByBookingAndType(bookingId: string, documentType: string): Promise<BookingDocument | null>;
  findById(id: string): Promise<BookingDocument | null>;
  /** Counts uploaded documents per booking id (for admin pending list completeness). */
  countByBookingIds(bookingIds: readonly string[]): Promise<ReadonlyMap<string, number>>;
  create(input: BookingDocumentCreateInput): Promise<BookingDocument>;
  update(id: string, input: BookingDocumentUpdateInput): Promise<BookingDocument>;
  delete(id: string): Promise<void>;
}

function mapPersistenceError(error: unknown): AppError {
  if (error instanceof AppError) {
    return error;
  }

  const normalized = normalizeSupabaseError(error);
  if (normalized.code === '42501') {
    return createBookingDocumentDatabaseFailureError(error);
  }

  return createBookingDocumentDatabaseFailureError(error);
}

export function createBookingDocumentRepository(
  client?: TypedSupabaseClient,
): BookingDocumentRepository {
  async function getClient(): Promise<TypedSupabaseClient> {
    return client ?? (await createSupabaseServerClient());
  }

  const repository: BookingDocumentRepository = {
    async listForBooking(bookingId) {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .select('*')
        .eq('booking_id', bookingId)
        .order('document_type', { ascending: true });

      if (error) {
        throw mapPersistenceError(error);
      }

      return data ?? [];
    },

    async findByBookingAndType(bookingId, documentType) {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .select('*')
        .eq('booking_id', bookingId)
        .eq('document_type', documentType)
        .maybeSingle();

      if (error) {
        throw mapPersistenceError(error);
      }

      return data;
    },

    async countByBookingIds(bookingIds) {
      const counts = new Map<string, number>();
      if (bookingIds.length === 0) {
        return counts;
      }

      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .select('booking_id')
        .in('booking_id', [...bookingIds]);

      if (error) {
        throw mapPersistenceError(error);
      }

      for (const row of data ?? []) {
        counts.set(row.booking_id, (counts.get(row.booking_id) ?? 0) + 1);
      }

      return counts;
    },

    async findById(id) {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .select('*')
        .eq('id', id)
        .maybeSingle();

      if (error) {
        throw mapPersistenceError(error);
      }

      return data;
    },

    async create(input) {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .insert(input)
        .select('*')
        .single();

      if (error) {
        throw mapPersistenceError(error);
      }

      if (!data) {
        throw createBookingDocumentDatabaseFailureError();
      }

      return data;
    },

    async update(id, input) {
      const supabase = await getClient();
      const { data, error } = await supabase
        .from('booking_documents')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();

      if (error) {
        throw mapPersistenceError(error);
      }

      if (!data) {
        throw createBookingDocumentNotFoundError();
      }

      return data;
    },

    async delete(id) {
      const supabase = await getClient();
      const { error } = await supabase.from('booking_documents').delete().eq('id', id);

      if (error) {
        throw mapPersistenceError(error);
      }
    },
  };

  return repository;
}

let singleton: BookingDocumentRepository | null = null;

export function getBookingDocumentRepository(): BookingDocumentRepository {
  if (!singleton) {
    singleton = createBookingDocumentRepository();
  }
  return singleton;
}
