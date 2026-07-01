import jwt from "jsonwebtoken";
import crypto from "crypto";

const generateRefreshToken = (userId) => {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + 22 * 24 * 60 * 60 * 1000); // 22 days
  
  return {
    token,
    expiresAt,
  };
};

const generateAccessToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET_KEY,
    {
      expiresIn: "7d",
    }
  );
};

export { generateRefreshToken, generateAccessToken };
