import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const db = await mongoose.connect(process.env.MONGO_URI);
    if (db) {
      console.log(`Connected to DB`);
      return;
    }
    console.log("Somthing went wrong when connecting to DB");
  } catch (error) {
    console.log(error);
  }
};

export default connectDB;
