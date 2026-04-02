import jwt from "jsonwebtoken";

const AUTH_TOKEN_TTL = "30d";

export function createAuthToken(user) {
  return jwt.sign(
    {
      id: String(user._id ?? user.id),
      email: user.email,
    },
    process.env.JWT_SECRET,
    { expiresIn: AUTH_TOKEN_TTL }
  );
}

export function verifyAuthToken(token) {
  return jwt.verify(token, process.env.JWT_SECRET);
}
