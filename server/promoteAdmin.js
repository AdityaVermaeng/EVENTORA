const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

const User = require('./models/User');

async function promote() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        const result = await User.updateMany(
            { email: { $in: ['adityaxyzverma@gmail.com', 'akashbisona@gmail.com', 'adityaverma@gmail.com'] } },
            { $set: { role: 'admin', isVerified: true } }
        );
        console.log('Successfully updated users to Admin role:', result);
    } catch (err) {
        console.error('Error promoting users:', err);
    } finally {
        await mongoose.disconnect();
    }
}

promote();
