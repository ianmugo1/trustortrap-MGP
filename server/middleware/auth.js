import jwt from "jsonwebtoken";

// Middleware to verify JWT tokens in the Authorization header
const authMiddleware = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    req.user = {
      id: decoded.id,
      email: decoded.email,
    };

    next();
  } catch (err) {
    console.error("JWT Auth Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};

// Export both styles so old imports don’t break
export default authMiddleware;
export const authenticateUser = authMiddleware;
