import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

/**
 * Main seed function
 * Seeds the database with test data including:
 * - 1 admin user
 * - 5 sales persons with varying commission rates
 * - Multiple campaigns across Facebook and Instagram
 * - Orders for current year and previous year (for YTD calculations)
 * - Auto-generated referenceIds for campaigns and orders
 * - Persisted counters for atomic sequence generation
 */
async function main() {
    console.log('🌱 Starting seed...');

    // Clean existing data
    await prisma.order.deleteMany();
    await prisma.campaign.deleteMany();
    await prisma.user.deleteMany();
    await prisma.counter.deleteMany(); // Clear counters for fresh referenceIds

    console.log('🧹 Cleaned existing data');

    // Track counters for generating referenceIds
    const campaignCounters: Record<string, number> = { facebook: 0, instagram: 0 };
    const orderCounters: Record<string, number> = {};

    /**
     * Hash a password using bcrypt
     * @param password - Plain text password
     * @returns Hashed password
     */
    const hashPassword = async (password: string) => {
        return bcrypt.hash(password, 10);
    };

    // Create Admin
    const admin = await prisma.user.create({
        data: {
            name: 'Admin User',
            username: 'admin',
            passwordHash: await hashPassword('admin123'),
            role: 'admin',
            commissionRate: 0,
            status: 'active',
        },
    });
    console.log('✅ Created admin:', admin.username);

    // Create Sales Persons
    const salesPersonsData = [
        { name: 'Sarah Johnson', username: 'sarah.j', rate: 12 },
        { name: 'Mike Chen', username: 'mike.c', rate: 10 },
        { name: 'Emily Wong', username: 'emily.w', rate: 15 },
        { name: 'David Lee', username: 'david.l', rate: 8 },
        { name: 'Anna Smith', username: 'anna.s', rate: 11 },
    ];

    const salesPersons: { id: string; commissionRate: number; username: string }[] = [];
    for (const sp of salesPersonsData) {
        const user = await prisma.user.create({
            data: {
                name: sp.name,
                username: sp.username,
                passwordHash: await hashPassword('password123'),
                role: 'sales',
                commissionRate: sp.rate,
                status: 'active',
            },
        });
        salesPersons.push(user);
        console.log(`✅ Created sales person: ${user.username} (${sp.rate}%)`);
    }

    // Create Campaigns with start/end dates
    const currentDate = new Date();
    const campaignsData = [
        {
            title: 'Summer Sale 2025', platform: 'facebook' as const, type: 'post' as const,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 1), endDate: null, status: 'active' as const
        },
        {
            title: 'Flash Friday Deals', platform: 'instagram' as const, type: 'live' as const,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 15), endDate: null, status: 'active' as const
        },
        {
            title: 'Holiday Special', platform: 'facebook' as const, type: 'event' as const,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 3, 1), endDate: new Date(currentDate.getFullYear(), currentDate.getMonth() - 2, 15), status: 'completed' as const
        },
        {
            title: 'New Year Promo', platform: 'instagram' as const, type: 'post' as const,
            startDate: new Date(currentDate.getFullYear(), 0, 1), endDate: new Date(currentDate.getFullYear(), 0, 31), status: 'completed' as const
        },
        {
            title: 'Valentine Collection', platform: 'facebook' as const, type: 'live' as const,
            startDate: new Date(currentDate.getFullYear(), 1, 1), endDate: new Date(currentDate.getFullYear(), 1, 14), status: 'completed' as const
        },
        {
            title: 'Spring Clearance', platform: 'instagram' as const, type: 'event' as const,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 1), endDate: null, status: 'active' as const
        },
        {
            title: 'Mother Day Gift', platform: 'facebook' as const, type: 'post' as const,
            startDate: new Date(currentDate.getFullYear(), 4, 1), endDate: new Date(currentDate.getFullYear(), 4, 15), status: 'completed' as const
        },
        {
            title: 'Weekend Flash Sale', platform: 'instagram' as const, type: 'live' as const,
            startDate: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10), endDate: null, status: 'active' as const
        },
    ];

    const campaigns: { id: string; referenceId: string; salesPersonId: string; title: string }[] = [];
    for (let i = 0; i < campaignsData.length; i++) {
        const salesPerson = salesPersons[i % salesPersons.length];
        const platform = campaignsData[i].platform;

        // Generate referenceId
        campaignCounters[platform]++;
        const prefix = platform === 'facebook' ? 'FB' : 'IG';
        const referenceId = `${prefix}-${campaignCounters[platform].toString().padStart(3, '0')}`;

        const campaign = await prisma.campaign.create({
            data: {
                referenceId,
                title: campaignsData[i].title,
                platform: campaignsData[i].platform,
                type: campaignsData[i].type,
                url: `https://www.${campaignsData[i].platform}.com/post/${i + 1}`,
                salesPersonId: salesPerson.id,
                status: campaignsData[i].status,
                startDate: campaignsData[i].startDate,
                endDate: campaignsData[i].endDate,
            },
        });
        campaigns.push(campaign);
        console.log(`✅ Created campaign: ${referenceId} - ${campaign.title} -> ${salesPerson.username} (${campaignsData[i].status})`);
    }

    // Create Orders across multiple months
    const products = [
        [{ name: 'Premium Widget', qty: 2, basePrice: 150.00 }],
        [{ name: 'Deluxe Gadget', qty: 1, basePrice: 299.00 }, { name: 'Accessory Pack', qty: 3, basePrice: 49.00 }],
        [{ name: 'Super Bundle', qty: 1, basePrice: 499.00 }],
        [{ name: 'Starter Kit', qty: 4, basePrice: 79.00 }],
        [{ name: 'Pro Package', qty: 1, basePrice: 899.00 }],
        [{ name: 'Basic Item', qty: 5, basePrice: 29.00 }, { name: 'Add-on', qty: 2, basePrice: 19.00 }],
    ];

    // Create orders for the past 3 months
    const now = new Date();
    let orderCount = 0;

    for (let monthOffset = 0; monthOffset < 3; monthOffset++) {
        const orderDate = new Date(now.getFullYear(), now.getMonth() - monthOffset, 15);

        for (const campaign of campaigns) {
            // 2-4 orders per campaign per month
            const numOrders = 2 + Math.floor(Math.random() * 3);

            for (let i = 0; i < numOrders; i++) {
                const productSet = products[Math.floor(Math.random() * products.length)];
                const orderTotal = productSet.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);

                // Get the sales person's commission rate at time of order
                const salesPerson = salesPersons.find(sp =>
                    campaigns.find(c => c.id === campaign.id)?.salesPersonId === sp.id
                );
                const snapshotRate = salesPerson?.commissionRate || 10;
                const commissionAmount = orderTotal * (snapshotRate / 100);

                // Generate order referenceId
                if (!orderCounters[campaign.referenceId]) {
                    orderCounters[campaign.referenceId] = 0;
                }
                orderCounters[campaign.referenceId]++;
                const orderReferenceId = `${campaign.referenceId}-${orderCounters[campaign.referenceId].toString().padStart(2, '0')}`;

                await prisma.order.create({
                    data: {
                        referenceId: orderReferenceId,
                        campaignId: campaign.id,
                        products: productSet,
                        orderTotal,
                        snapshotRate,
                        commissionAmount,
                        status: 'active',
                        createdAt: new Date(orderDate.getTime() + i * 86400000), // Different days
                    },
                });
                orderCount++;
            }
        }
    }

    // Create orders for the previous year (to differentiate YTD from All Time)
    const lastYear = now.getFullYear() - 1;
    console.log(`Adding orders for ${lastYear}...`);

    for (let i = 0; i < 20; i++) {
        const orderDate = new Date(lastYear, Math.floor(Math.random() * 12), Math.floor(Math.random() * 28) + 1);
        const campaign = campaigns[Math.floor(Math.random() * campaigns.length)];
        const productSet = products[Math.floor(Math.random() * products.length)];
        const orderTotal = productSet.reduce((sum, p) => sum + (p.qty * p.basePrice), 0);

        const salesPerson = salesPersons.find(sp =>
            campaigns.find(c => c.id === campaign.id)?.salesPersonId === sp.id
        );
        const snapshotRate = salesPerson?.commissionRate || 10;
        const commissionAmount = orderTotal * (snapshotRate / 100);

        // Generate order referenceId
        if (!orderCounters[campaign.referenceId]) {
            orderCounters[campaign.referenceId] = 0;
        }
        orderCounters[campaign.referenceId]++;
        const orderReferenceId = `${campaign.referenceId}-${orderCounters[campaign.referenceId].toString().padStart(2, '0')}`;

        await prisma.order.create({
            data: {
                referenceId: orderReferenceId,
                campaignId: campaign.id,
                products: productSet,
                orderTotal,
                snapshotRate,
                commissionAmount,
                status: 'active',
                createdAt: orderDate,
            },
        });
        orderCount++;
    }

    console.log(`✅ Created ${orderCount} orders across 3 months`);

    // PERSIST COUNTERS to Database
    console.log('📝 Persisting counters...');

    // Campaign counters
    await prisma.counter.create({ data: { id: 'campaign_facebook', seq: campaignCounters.facebook } });
    await prisma.counter.create({ data: { id: 'campaign_instagram', seq: campaignCounters.instagram } });

    // Order counters
    for (const [refId, count] of Object.entries(orderCounters)) {
        await prisma.counter.create({
            data: { id: `order_${refId}`, seq: count }
        });
    }
    console.log(`✅ Persisted ${2 + Object.keys(orderCounters).length} counters`);

    console.log('\n🎉 Seed completed successfully!');
    console.log('\n📋 Login credentials:');
    console.log('  Admin: username=admin, password=admin123');
    console.log('  Sales: username=sarah.j (or others), password=password123');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
