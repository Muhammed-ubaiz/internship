import Mentor from "../Model/Mentormodel.js";
import bcrypt from "bcryptjs";



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

        return res.status(200).json({
            success:true,
            message:"Login successfully",
            mentor:{
            name: mentor.name,
            email: mentor.email,
            }
        })
    } catch (error) {
        console.error(error);
        return res.status(500).json({
          success: false,
          message: "Server error"
        });
    }
}