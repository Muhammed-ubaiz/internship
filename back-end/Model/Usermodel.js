import mongoose from "mongoose"


const UserSchema = new mongoose.Schema({

   name:String,
   email:String,
   number:Number,
   password:String,
   phone: Number, 
   course:String, 
   batch:String, 
   active:Boolean
})


const User = mongoose.model("User",UserSchema)

export default User 
