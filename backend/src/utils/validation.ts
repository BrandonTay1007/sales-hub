/**
 * Validation utilities for money fields and other common validations
 */

/**
 * Validate that a number has at most 2 decimal places
 * @param value - The number to validate
 * @returns true if the number has 0, 1, or 2 decimal places
 * 
 * Examples:
 * - 10 → true
 * - 10.5 → true
 * - 10.99 → true
 * - 10.999 → false
 */
export function hasMaxTwoDecimals(value: number): boolean {
    if (!Number.isFinite(value)) {
        return false;
    }

    // Multiply by 100 and check if result is an integer
    // If it is, the original number had at most 2 decimal places
    return Number.isInteger(value * 100);
}

/**
 * Round a number to exactly 2 decimal places
 * @param value - The number to round
 * @returns The number rounded to 2 decimal places
 * 
 * Examples:
 * - 10.999 → 11.00
 * - 10.333 → 10.33
 * - 10.5 → 10.50
 */
export function roundToTwoDecimals(value: number): number {
    return Math.round(value * 100) / 100;
}

/**
 * Format a number as currency with 2 decimal places
 * @param value - The number to format
 * @returns Formatted string with 2 decimal places
 * 
 * Example: 1234.5 → "1234.50"
 */
export function formatCurrency(value: number): string {
    return value.toFixed(2);
}
