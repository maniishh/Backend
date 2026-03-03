
import mongoose from "mongoose";
import {DB_NAME} from '../constants.js';



const conncetDB=async()=>{
    try {
      const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
        console.log(`\nDB connected successfully: ${connectionInstance.connection.host}\n`);

    } catch (error) {
        console.error("DB connection error",error)
        process.exit(1)
    }
  }
export default conncetDB