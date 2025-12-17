const mongoose = require("mongoose");

//Function to connect to MongoDB using mongoose
const connectDB = async () => {
    try{
        await mongoose.connect(process.env.MONGO_URI, {});
        console.log("MongoDB connected successfully");
    }catch(err){
        console.error("MongoDB connection failed:", err);
        process.exit(1);
    }
};

module.exports = connectDB;