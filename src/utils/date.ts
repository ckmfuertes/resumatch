import { ConflictError } from "@/utils/error";

/**
 * Normalizes a date by setting the time to 00:00:00.000.
 * @param date - The date to normalize
 * @returns A new Date object with the time set to 00:00:00.000
 */
function normalizeDate(date: Date): Date {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  return normalized;
}

/**
 * Validates that a date is not in the future.
 *
 * @param date - The date to check
 * @param fieldName - Name of the field for error message
 * @throws ConflictError if date is in the future
 */
export function validateDateNotInFuture(date: Date | null | undefined, fieldName: string): void {
  if (!date) return;

  const inputDate = normalizeDate(date);
  const today = normalizeDate(new Date());

  if (inputDate > today) {
    throw new ConflictError(`${fieldName} cannot be in the future`);
  }
}

/**
 * Validates that endDate is not before startDate.
 *
 * @param startDate - The start date
 * @param endDate - The end date
 * @param startFieldName - Name of start field for error message
 * @param endFieldName - Name of end field for error message
 * @throws ConflictError if endDate is before startDate
 */
export function validateDateRange(
  startDate: Date | null | undefined,
  endDate: Date | null | undefined,
  startFieldName: string,
  endFieldName: string,
): void {
  if (!startDate || !endDate) return;

  const normalizedStart = normalizeDate(startDate);
  const normalizedEnd = normalizeDate(endDate);

  if (normalizedEnd < normalizedStart) {
    throw new ConflictError(`${endFieldName} cannot be before ${startFieldName}`);
  }
}
