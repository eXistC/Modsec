import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Parse a date string from the backend with proper timezone handling
 * Bangkok timezone is GMT+7
 * @param dateString Date string from the backend
 * @returns JavaScript Date object correctly adjusted for Bangkok timezone
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
    
    // Parse the date in Bangkok timezone (GMT+7)
    // This will handle the conversion from UTC to Bangkok timezone
    const dateObj = new Date(`${datePart}T${timePart}Z`); // Parse as UTC
    
    // Adjust for Bangkok timezone (GMT+7 = +7 hours)
    dateObj.setHours(dateObj.getHours() + 7);
    
    return dateObj;
  }
  
  // If not in the expected format, just parse it normally
  return new Date(dateString);
}

/**
 * Format a date for display with Bangkok timezone
 * @param date Date to format
 * @returns Formatted date string
 */
export function formatBangkokDate(date: Date | string | undefined): string {
  if (!date) return "";
  
  const dateObj = date instanceof Date ? date : parseBangkokDate(date);
  
  // Format the date in Thai locale if possible, with Bangkok time
  try {
    return dateObj.toLocaleString('en-US', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false
    });
  } catch (e) {
    // Fallback to a simpler format if locale is not supported
    return dateObj.toISOString().replace('T', ' ').replace(/\.\d+Z$/, '');
  }
}
