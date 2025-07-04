import mongoose from "mongoose";

export const connectDB = async () => {
    try{
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log("Db connected")
    }catch(e){
        console.log("Error in connection",e);
        process.exit(1)
    }
}