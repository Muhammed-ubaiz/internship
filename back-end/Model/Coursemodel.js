import mongoose from "mongoose"

const courseSchema = new mongoose.Schema({
    name:{type:String, required:true, unique:true},
    status:{type:String, default:"Active"}
},{timestamps:true})

const Course = mongoose.model("Course",courseSchema);
export default Course