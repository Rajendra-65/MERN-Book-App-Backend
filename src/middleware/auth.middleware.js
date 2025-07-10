import jwt from "jsonwebtoken";
import User from "../models/User.js";

const protectedRoute = async (req, res, next) => {
  try {
    // ✅ 1. Get token from header and clean it
    const authHeader = req.header("Authorization");

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No authentication token, access denied",
      });
    }

    const token = authHeader.replace("Bearer", "").trim();

    console.log("TOken Extracted",token)

    // ✅ 2. Verify the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded",decoded)

    // ✅ 3. Find the user
    const user = await User.findById(decoded.userId).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "Token is not valid",
      });
    }

    // ✅ 4. Attach user to request object
    req.user = user;
    next();
  } catch (e) {
    console.error("Error in protectedRoute middleware:", e);
    res.status(401).json({
      message: "Token verification failed",
    });
  }
};

export default protectedRoute;
