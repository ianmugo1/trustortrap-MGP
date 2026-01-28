import jwt from "jsonwebtoken";

// Middleware to verify JWT tokens in the Authorizasion header
export const authenticateUser = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // Check header exists and starts with 'Bearer'
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1]; // Get token string

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded user data (e.g., id, email) to request
    next();
  } catch (err) {
    console.error("JWT Auth Error:", err.message);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
