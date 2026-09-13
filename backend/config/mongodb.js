import mongoose from "mongoose";
import dns from "dns";

dns.setServers(["8.8.8.8"]);

const connectDB = async () => {
    try {
        await mongoose.connect(`${process.env.MONGODB_URI}/e-commerce`);
        console.log("DB Connected");
    } catch (error) {
        console.log(error);
    }
};

export default connectDB;