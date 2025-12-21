/**
 * Commission Calculation Utilities
 * CRITICAL: These functions implement the commission snapshot logic
 */

import { hasMaxTwoDecimals, roundToTwoDecimals } from './validation';

export interface Product {
    name: string;
    qty: number;
    basePrice: number;
}

/**
 * Calculate the total order amount from products
 * Formula: SUM(quantity × basePrice) for all products
 * Result is rounded to 2 decimal places
 */
export function calculateOrderTotal(products: Product[]): number {
    const total = products.reduce((sum, product) => {
        return sum + (product.qty * product.basePrice);
    }, 0);
    return roundToTwoDecimals(total);
}

/**
 * Calculate commission amount based on order total and snapshot rate
 * Formula: orderTotal × (snapshotRate / 100)
 * Result is rounded to 2 decimal places
 * 
 * IMPORTANT: The snapshotRate is captured at order creation time
 * and NEVER changes, even if the sales person's rate changes later.
 */
export function calculateCommission(orderTotal: number, snapshotRate: number): number {
    const commission = orderTotal * (snapshotRate / 100);
    return roundToTwoDecimals(commission);
}

/**
 * Validate products array
 * Returns validation result with error message if invalid
 */
export function validateProducts(products: unknown): { valid: boolean; error?: string; products?: Product[] } {
    if (!Array.isArray(products)) {
        return { valid: false, error: 'Products must be an array' };
    }

    if (products.length === 0) {
        return { valid: false, error: 'At least one product is required' };
    }

    const validatedProducts: Product[] = [];

    for (let i = 0; i < products.length; i++) {
        const product = products[i];

        if (!product || typeof product !== 'object') {
            return { valid: false, error: `Product at index ${i} is invalid` };
        }

        if (!product.name || typeof product.name !== 'string') {
            return { valid: false, error: `Product at index ${i}: name is required` };
        }

        if (typeof product.qty !== 'number' || product.qty < 1 || !Number.isInteger(product.qty)) {
            return { valid: false, error: `Product at index ${i}: qty must be a positive integer` };
        }

        if (typeof product.basePrice !== 'number' || product.basePrice < 0) {
            return { valid: false, error: `Product at index ${i}: basePrice must be a non-negative number` };
        }

        if (!hasMaxTwoDecimals(product.basePrice)) {
            return { valid: false, error: `Product at index ${i}: basePrice must have at most 2 decimal places` };
        }

        validatedProducts.push({
            name: product.name,
            qty: product.qty,
            basePrice: product.basePrice,
        });
    }

    return { valid: true, products: validatedProducts };
}
