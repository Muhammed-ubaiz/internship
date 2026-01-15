import Mentor from "../Model/Mentormodel.js";
import bcrypt from "bcryptjs";
import Student from "../Model/Studentsmodel.js";
import jwt from "jsonwebtoken"


export const mentorlogin = async (req,res) =>{
    try {
        const {email,password} = req.body;
        const mentor =await Mentor.findOne({email});
        if(!mentor){
            return res.status(404).json({
                success: false,
                message: "mentor not found"
              });
        }

        const isMatch = await bcrypt.compare(password, mentor.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid password"
      });
    }
    const token = jwt.sign(
      { id: mentor._id, role: "mentor" },
      process.env.JWT_SECRET,
      { expiresIn: "15m" }
    );

        return res.status(200).json({
            success:true,
            message:"Login successfully",
            mentor:{
            name: mentor.name,
            email: mentor.email,
            },
            token
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server error"
        });
    }
}



export const getstudent = async (req, res) => {
  try {
   
    const mentorEmail = req.user.id; 

   
    const mentor = await Mentor.findOne({ email: mentorEmail });

    if (!mentor) {
      return res.status(404).json({ message: "Mentor not found" });
    }

    
    const students = await Student.find({course:req.body.course}, { password: 0 });
    ;

    return res.status(200).json(students);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
};
