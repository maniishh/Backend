import dotenv from 'dotenv'
import { app } from './app.js'
import connectDB from './db/index.js'
dotenv.config({
    path:'./env'
})



connectDB()
.then(()=>{
  app.listen(process.env.PORT || 8000,()=>{
    console.log(`server is running on ${process.env.PORT}`)
  })
})
.catch((err)=>{
  console.log("Error in connecting to DB !!",err);
})


























/*
import express from "express";

const app=express();
(async()=>{
    try {
      await mongoose.connect(`${process.env.MONGO_URI}/${DB_NAME}`)
      app.on("error",(error)=>{
        console.log("ERR:",error);
        throw err
      })
      app.listen(process.env.PORT,()=>{
        console.log(`server is running on ${process.env.PORT}`)
      })
    } catch (error) {
        console.error("ERROR",error)
        throw err
    }
}) */
