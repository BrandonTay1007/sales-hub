import prisma from '../lib/prisma';

/**
 * Counter Service
 * Handles atomic sequence generation for auto-increment IDs
 * Used for generating referenceId for campaigns and orders
 */
export const counterService = {
    /**
     * Get next sequence number for a campaign (per platform)
     * @param platform - 'facebook' or 'instagram'
     * @returns Next sequence number (1, 2, 3, ...)
     */
    async getNextCampaignSequence(platform: 'facebook' | 'instagram'): Promise<number> {
        const counterId = `campaign_${platform}`;

        // Use upsert to atomically increment the counter
        // If counter doesn't exist, create it with seq=1
        const counter = await prisma.counter.upsert({
            where: { id: counterId },
            update: { seq: { increment: 1 } },
            create: { id: counterId, seq: 1 },
        });

        return counter.seq;
    },

    /**
     * Get next sequence number for an order (per campaign)
     * @param campaignReferenceId - The parent campaign's referenceId (e.g., "FB-001")
     * @returns Next sequence number (1, 2, 3, ...)
     */
    async getNextOrderSequence(campaignReferenceId: string): Promise<number> {
        const counterId = `order_${campaignReferenceId}`;

        // Use upsert to atomically increment the counter
        // If counter doesn't exist, create it with seq=1
        const counter = await prisma.counter.upsert({
            where: { id: counterId },
            update: { seq: { increment: 1 } },
            create: { id: counterId, seq: 1 },
        });

        return counter.seq;
    },

    /**
     * Generate campaign referenceId
     * Format: {PLATFORM_PREFIX}-{SEQUENCE}
     * Examples: FB-001, IG-002
     */
    async generateCampaignReferenceId(platform: 'facebook' | 'instagram'): Promise<string> {
        const prefix = platform === 'facebook' ? 'FB' : 'IG';
        const seq = await this.getNextCampaignSequence(platform);
        return `${prefix}-${seq.toString().padStart(3, '0')}`;
    },

    /**
     * Generate order referenceId
     * Format: {CAMPAIGN_REF}-{SEQUENCE}
     * Examples: FB-001-01, IG-002-03
     */
    async generateOrderReferenceId(campaignReferenceId: string): Promise<string> {
        const seq = await this.getNextOrderSequence(campaignReferenceId);
        return `${campaignReferenceId}-${seq.toString().padStart(2, '0')}`;
    },

    /**
     * Clear all counters (for testing/seeding)
     */
    async clearAllCounters(): Promise<void> {
        await prisma.counter.deleteMany({});
    },
};
