// config/connectdb.js
import mongoose from "mongoose";

const connectDb = async (DATABASE_URL) => {
  try {
    console.log("Connecting to database...");

    const DB_OPTIONS = {
      dbName: "pectro",
    };

    console.log("DATABASE_URL:", DATABASE_URL);
    await mongoose.connect(DATABASE_URL, DB_OPTIONS);

    console.log("Connected to database successfully");
  } catch (error) {
    console.error("Error connecting to database:", error);
  }
};

export default connectDb;
