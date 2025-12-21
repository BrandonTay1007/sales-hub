import prisma from '../../src/lib/prisma';
import { counterService } from '../../src/services/counterService';

describe('Counter Service - Reference ID Generation', () => {
    beforeAll(async () => {
        // Clean up counters before tests
        await counterService.clearAllCounters();
    });

    afterAll(async () => {
        // Clean up after tests
        await counterService.clearAllCounters();
        await prisma.$disconnect();
    });

    describe('generateCampaignReferenceId', () => {
        it('should generate FB-001 for first Facebook campaign', async () => {
            const refId = await counterService.generateCampaignReferenceId('facebook');
            expect(refId).toBe('FB-001');
        });

        it('should generate FB-002 for second Facebook campaign', async () => {
            const refId = await counterService.generateCampaignReferenceId('facebook');
            expect(refId).toBe('FB-002');
        });

        it('should generate IG-001 for first Instagram campaign', async () => {
            const refId = await counterService.generateCampaignReferenceId('instagram');
            expect(refId).toBe('IG-001');
        });

        it('should generate IG-002 for second Instagram campaign', async () => {
            const refId = await counterService.generateCampaignReferenceId('instagram');
            expect(refId).toBe('IG-002');
        });

        it('should maintain separate counters for each platform', async () => {
            // Facebook should still be at 2, Instagram at 2
            const fbId = await counterService.generateCampaignReferenceId('facebook');
            const igId = await counterService.generateCampaignReferenceId('instagram');

            expect(fbId).toBe('FB-003');
            expect(igId).toBe('IG-003');
        });

        it('should handle concurrent requests atomically', async () => {
            // Simulate concurrent requests
            const promises = Array.from({ length: 5 }, () =>
                counterService.generateCampaignReferenceId('facebook')
            );

            const results = await Promise.all(promises);

            // All IDs should be unique
            const uniqueIds = new Set(results);
            expect(uniqueIds.size).toBe(5);

            // IDs should be sequential (FB-004 through FB-008)
            results.forEach(id => {
                expect(id).toMatch(/^FB-\d{3}$/);
            });
        });
    });

    describe('generateOrderReferenceId', () => {
        it('should generate FB-001-01 for first order in campaign', async () => {
            const refId = await counterService.generateOrderReferenceId('FB-001');
            expect(refId).toBe('FB-001-01');
        });

        it('should generate FB-001-02 for second order in campaign', async () => {
            const refId = await counterService.generateOrderReferenceId('FB-001');
            expect(refId).toBe('FB-001-02');
        });

        it('should generate IG-001-01 for first order in Instagram campaign', async () => {
            const refId = await counterService.generateOrderReferenceId('IG-001');
            expect(refId).toBe('IG-001-01');
        });

        it('should maintain separate counters for each campaign', async () => {
            const fb001Id = await counterService.generateOrderReferenceId('FB-001');
            const fb002Id = await counterService.generateOrderReferenceId('FB-002');

            expect(fb001Id).toBe('FB-001-03'); // FB-001 continues from 02
            expect(fb002Id).toBe('FB-002-01'); // FB-002 starts fresh
        });

        it('should pad order numbers with leading zeros', async () => {
            // Generate 8 more orders for FB-001 to reach 11
            for (let i = 0; i < 8; i++) {
                await counterService.generateOrderReferenceId('FB-001');
            }

            const refId = await counterService.generateOrderReferenceId('FB-001');
            expect(refId).toBe('FB-001-12');
        });

        it('should handle concurrent order creation atomically', async () => {
            const campaignRef = 'FB-CONCURRENT';

            // Simulate concurrent order creation
            const promises = Array.from({ length: 10 }, () =>
                counterService.generateOrderReferenceId(campaignRef)
            );

            const results = await Promise.all(promises);

            // All IDs should be unique
            const uniqueIds = new Set(results);
            expect(uniqueIds.size).toBe(10);

            // IDs should be sequential
            expect(results).toContain('FB-CONCURRENT-01');
            expect(results).toContain('FB-CONCURRENT-10');
        });
    });

    describe('Counter Persistence', () => {
        it('should persist counter values across service calls', async () => {
            const platform = 'facebook';

            // Get current counter value
            const id1 = await counterService.generateCampaignReferenceId(platform);
            const num1 = parseInt(id1.split('-')[1]);

            // Get next value
            const id2 = await counterService.generateCampaignReferenceId(platform);
            const num2 = parseInt(id2.split('-')[1]);

            expect(num2).toBe(num1 + 1);
        });
    });

    describe('Edge Cases', () => {
        it('should handle very long campaign reference IDs', async () => {
            const longRef = 'FB-VERY-LONG-CAMPAIGN-NAME-123';
            const orderId = await counterService.generateOrderReferenceId(longRef);
            expect(orderId).toBe(`${longRef}-01`);
        });

        it('should handle special characters in campaign reference', async () => {
            const specialRef = 'IG-TEST_CAMPAIGN-2024';
            const orderId = await counterService.generateOrderReferenceId(specialRef);
            expect(orderId).toBe(`${specialRef}-01`);
        });
    });
});
