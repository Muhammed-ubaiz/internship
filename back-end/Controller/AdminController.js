import jwt from "jsonwebtoken";

const adminemail = "admin@gmail.com";
const adminpass = "admin123";
const JWT_SECRET = "key321";

const Login = (req, res) => {
  const { email, password } = req.body;

  if (email === adminemail && password === adminpass) {
    const token = jwt.sign(
      { email, role: "admin" },
      JWT_SECRET,
      { expiresIn: "10s" } // ⬅️ better expiry
    );

    return res.json({
      success: true,
      token,
      role: "admin",
    });
  }

  return res.status(401).json({
    success: false,
    message: "Invalid email or password",
  });
};

export { Login };
