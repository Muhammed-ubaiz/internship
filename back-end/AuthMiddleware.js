import jwt from "jsonwebtoken";

// Use environment variable with fallback for consistency across all controllers
const JWT_SECRET = process.env.JWT_SECRET || "key321";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "No token provided",
      redirectTo: "/login"
    });
  }

  const token = authHeader.split(" ")[1];

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      console.log("JWT verification failed:", err.message);
      return res.status(403).json({
        success: false,
        message: "Invalid or expired token",
        redirectTo: "/login"
      });
    }

    req.user = decoded;
    next();
  });
};




