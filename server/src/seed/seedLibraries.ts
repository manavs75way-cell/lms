import mongoose from 'mongoose';
import { Library } from '../modules/library/library.model';
import { env } from '../config/env';

const libraries = [
    {
        name: 'Central Public Library',
        code: 'LIB-CENTRAL',
        address: '100 Main Street, Downtown',
        borrowingLimit: 5,
        loanPeriodDays: 14,
        fineRatePerDay: 0.5,
        isActive: true,
    },
    {
        name: 'Northside Branch Library',
        code: 'LIB-NORTH',
        address: '45 North Avenue, Northside',
        borrowingLimit: 3,
        loanPeriodDays: 14,
        fineRatePerDay: 0.5,
        isActive: true,
    },
    {
        name: 'Eastside Community Library',
        code: 'LIB-EAST',
        address: '78 East Boulevard, Eastside',
        borrowingLimit: 4,
        loanPeriodDays: 21,
        fineRatePerDay: 0.25,
        isActive: true,
    },
    {
        name: 'University Branch Library',
        code: 'LIB-UNIV',
        address: '1 Campus Drive, University District',
        borrowingLimit: 10,
        loanPeriodDays: 30,
        fineRatePerDay: 1.0,
        isActive: true,
    },
];

const seedLibraries = async () => {
    try {
        await mongoose.connect(env.MONGO_URI);
        console.log('Connected to MongoDB');

        const count = await Library.countDocuments();
        if (count > 0) {
            console.log(`Libraries already exist (${count} found). Skipping seed.`);
            process.exit(0);
        }

        console.log('Seeding libraries...');
        await Library.insertMany(libraries);
        console.log(`Seeded ${libraries.length} libraries successfully`);
        process.exit(0);
    } catch (error) {
        console.error('Error seeding libraries:', error);
        process.exit(1);
    }
};

seedLibraries();
