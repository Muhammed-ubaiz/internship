import dotenv from "dotenv"
import mongoose from "mongoose"


dotenv.config()

const connectDB=()=>{
    try{
        mongoose.connect(process.env.MONGO_URL)
        .then(()=>{
            console.log("Database connected successfully");
            
        }).catch((err)=>{
            console.log(err);
            
        })
    }catch{
        console.log("connection error");
        
    }
}

export default connectDB