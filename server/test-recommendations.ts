import mongoose from 'mongoose';
import * as dotenv from 'dotenv';
import { getRecommendations } from './src/modules/borrow/recommendation.service';
import { User } from './src/modules/auth/auth.model';

dotenv.config();

async function run() {
    await mongoose.connect(process.env.MONGO_URI as string);
    const user = await User.findOne({ role: 'MEMBER' });
    if (!user) {
        console.log("No member found");
        process.exit(1);
    }
    console.log(`Testing for user ${user._id} (${user.email})`);
    
    const recs = await getRecommendations(user._id.toString());
    console.log("--- RECS ---");
    console.log(JSON.stringify(recs, null, 2));
    
    const { getReadingHistory } = await import('./src/modules/borrow/borrow.service');
    const hist = await getReadingHistory(user._id.toString());
    console.log("--- HISTORY ---");
    console.log(hist.length, "items");
    console.log(JSON.stringify(hist[0], null, 2));

    process.exit(0);
}
run();
