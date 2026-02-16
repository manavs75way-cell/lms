import mongoose from 'mongoose';
import { Config } from './config/config.model';
import { env } from './config/env';

const seedConfig = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const configs = [
            { key: 'fineRatePerDay', value: 10 }, 
            { key: 'loanPeriodDays', value: 14 },
        ];

        for (const config of configs) {
            await Config.findOneAndUpdate({ key: config.key }, config, { upsert: true, new: true });
        }

        console.log('Config seeded successfully');
        await mongoose.disconnect();
    } catch (error) {
        console.error('Error seeding config:', error);
        process.exit(1);
    }
};

seedConfig();
