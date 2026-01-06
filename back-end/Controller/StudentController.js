import Student from "../Model/Studentsmodel.js";

const checkstudent = async (req, res) => {
  try {
    const { email, password } = req.body;

    const student = await Student.findOne({ email:email });

    if (!student) {
      return res.status(404).json({ success: false, message: "Student not found" });
    }

    if (email==student.email && password==student.password){
        return res.status(401).json({
          success: false,
          message: "Invalid credentials"
        });
      }
      
    

    return res.status(200).json({
      success: true,
      message: "Login successful",
      student
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

export { checkstudent, };
