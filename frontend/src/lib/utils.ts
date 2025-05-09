import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get the user's timezone offset in hours
 * @returns The timezone offset in hours
 */
export function getUserTimezoneOffset(): number {
  // Get local timezone offset in minutes and convert to hours
  const offsetMinutes = new Date().getTimezoneOffset();
  // Note: getTimezoneOffset returns minutes in the opposite direction
  // e.g. Bangkok (UTC+7) returns -420 minutes, so we negate it
  return -(offsetMinutes / 60);
}

/**
 * Get the user's timezone name if available
 * @returns The timezone name (e.g. 'Asia/Bangkok') or undefined
 */
export function getUserTimezoneName(): string {
  try {
    return Intl.DateTimeFormat().resolvedOptions().timeZone;
  } catch (e) {
    console.warn("Timezone detection not supported");
    return "UTC";
  }
}

/**
 * Parse a date string from the backend with proper timezone handling
 * Uses the client's local timezone instead of hardcoded values
 * @param dateString Date string from the backend
 * @returns JavaScript Date object correctly adjusted for client timezone
 */
export function parseBangkokDate(dateString: string | Date | undefined): Date {
  if (!dateString) return new Date();
  
  // If it's already a Date object, return it
  if (dateString instanceof Date) return dateString;
  
  // Check if the date is in the backend format: 2025-05-09 11:30:42.789022+00
  const backendFormatRegex = /^(\d{4}-\d{2}-\d{2}) (\d{2}:\d{2}:\d{2})\..*\+\d{2}$/;
  const match = dateString.match(backendFormatRegex);
  
  if (match) {
    // Extract date and time parts
    const [_, datePart, timePart] = match;
    
    // Parse as UTC - no timezone adjustment needed as we'll use the client's timezone
    const dateObj = new Date(`${datePart}T${timePart}Z`);
    
    return dateObj;
  }
  
  // If not in the expected format, just parse it normally
  return new Date(dateString);
}

/**
 * Format a date for display using the user's local timezone
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatBangkokDate(date: Date | string | undefined): string {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : parseBangkokDate(date);
  
  // Format the date with dd/mm/yyyy pattern
  try {
    // Use Intl.DateTimeFormat for better localized formatting
    const formatter = new Intl.DateTimeFormat(navigator.language, {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false // 24-hour format
    });
    
    return formatter.format(dateObj);
  } catch (e) {
    // Fallback to manual formatting if Intl API fails
    const day = String(dateObj.getDate()).padStart(2, '0');
    const month = String(dateObj.getMonth() + 1).padStart(2, '0');
    const year = dateObj.getFullYear();
    const hours = String(dateObj.getHours()).padStart(2, '0');
    const minutes = String(dateObj.getMinutes()).padStart(2, '0');
    const seconds = String(dateObj.getSeconds()).padStart(2, '0');
    
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  }
}
