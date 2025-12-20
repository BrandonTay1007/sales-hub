import { calculateOrderTotal, calculateCommission, validateProducts, Product } from '../../src/utils/commission';

describe('Commission Utilities', () => {
    describe('calculateOrderTotal', () => {
        it('should calculate total from single product', () => {
            const products: Product[] = [
                { name: 'Widget', qty: 2, basePrice: 100 },
            ];
            expect(calculateOrderTotal(products)).toBe(200);
        });

        it('should calculate total from multiple products', () => {
            const products: Product[] = [
                { name: 'Widget A', qty: 2, basePrice: 100 },
                { name: 'Widget B', qty: 3, basePrice: 50 },
            ];
            // 2*100 + 3*50 = 200 + 150 = 350
            expect(calculateOrderTotal(products)).toBe(350);
        });

        it('should return 0 for empty products array', () => {
            expect(calculateOrderTotal([])).toBe(0);
        });

        it('should handle decimal prices correctly', () => {
            const products: Product[] = [
                { name: 'Item', qty: 3, basePrice: 33.33 },
            ];
            expect(calculateOrderTotal(products)).toBeCloseTo(99.99);
        });
    });

    describe('calculateCommission', () => {
        it('should calculate commission at 10% rate', () => {
            const commission = calculateCommission(1000, 10);
            expect(commission).toBe(100);
        });

        it('should calculate commission at 15% rate', () => {
            const commission = calculateCommission(500, 15);
            expect(commission).toBe(75);
        });

        it('should return 0 for 0% rate', () => {
            const commission = calculateCommission(1000, 0);
            expect(commission).toBe(0);
        });

        it('should handle 100% rate', () => {
            const commission = calculateCommission(250, 100);
            expect(commission).toBe(250);
        });

        it('should handle decimal rates', () => {
            const commission = calculateCommission(1000, 12.5);
            expect(commission).toBe(125);
        });
    });

    describe('validateProducts', () => {
        it('should validate correct products array', () => {
            const products = [
                { name: 'Widget', qty: 2, basePrice: 100 },
            ];
            const result = validateProducts(products);
            expect(result.valid).toBe(true);
            expect(result.products).toEqual(products);
        });

        it('should reject non-array input', () => {
            const result = validateProducts('not an array');
            expect(result.valid).toBe(false);
            expect(result.error).toBe('Products must be an array');
        });

        it('should reject empty array', () => {
            const result = validateProducts([]);
            expect(result.valid).toBe(false);
            expect(result.error).toBe('At least one product is required');
        });

        it('should reject product without name', () => {
            const products = [{ qty: 2, basePrice: 100 }];
            const result = validateProducts(products);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('name is required');
        });

        it('should reject negative quantity', () => {
            const products = [{ name: 'Widget', qty: -1, basePrice: 100 }];
            const result = validateProducts(products);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('qty must be a positive integer');
        });

        it('should reject non-integer quantity', () => {
            const products = [{ name: 'Widget', qty: 1.5, basePrice: 100 }];
            const result = validateProducts(products);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('qty must be a positive integer');
        });

        it('should reject negative basePrice', () => {
            const products = [{ name: 'Widget', qty: 1, basePrice: -50 }];
            const result = validateProducts(products);
            expect(result.valid).toBe(false);
            expect(result.error).toContain('basePrice must be a non-negative number');
        });
    });

    describe('Commission Snapshot Logic', () => {
        /**
         * CRITICAL: This test documents the snapshot behavior
         * The snapshot rate is captured at order creation and NEVER changes
         */
        it('should use original snapshot rate when recalculating commission', () => {
            // Initial order: RM100 at 10% = RM10 commission
            const originalTotal = 100;
            const snapshotRate = 10; // Captured at creation
            const originalCommission = calculateCommission(originalTotal, snapshotRate);
            expect(originalCommission).toBe(10);

            // Order updated: new total RM150, but still uses original 10% snapshot
            const newTotal = 150;
            // Even if sales person's rate is now 15%, we use snapshotRate
            const recalculatedCommission = calculateCommission(newTotal, snapshotRate);
            expect(recalculatedCommission).toBe(15); // NOT 22.50 (15% of 150)
        });
    });
});
