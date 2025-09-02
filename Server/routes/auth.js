const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const router = express.Router();
const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// POST /auth/google (works for Sign In & Sign Up)
router.post("/google", async (req, res) => {
  try {
    const { id_token, action } = req.body;
    
    if (!id_token) {
      return res.status(400).json({ message: "Google ID token is required" });
    }

    // Verify the Google ID token
    const ticket = await googleClient.verifyIdToken({
      idToken: id_token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    
    const payload = ticket.getPayload();
    
    // Check if payload is valid
    if (!payload || !payload.sub || !payload.email) {
      return res.status(400).json({ message: "Invalid Google token payload" });
    }

    // Check if user already exists
    let user = await User.findOne({ 
      $or: [
        { googleId: payload.sub },
        { email: payload.email }
      ]
    });
    
    let isNewUser = false;

    if (!user) {
      // Create new user
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || null,
      });
      isNewUser = true;
    } else {
      // Update existing user's Google ID if not set
      if (!user.googleId) {
        user.googleId = payload.sub;
        await user.save();
      }
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { 
        userId: user._id,
        email: user.email 
      }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" } // Extended to 7 days for better UX
    );

    // Return success response
    res.json({
      accessToken,
      user: { 
        id: user._id, 
        email: user.email, 
        name: user.name, 
        picture: user.picture 
      },
      isNewUser
    });

  } catch (err) {
    console.error("Google Auth Error:", err);
    
    // Handle different types of errors
    if (err.message && err.message.includes('Token used too early')) {
      return res.status(401).json({ message: "Token not yet valid. Please try again." });
    }
    
    if (err.message && err.message.includes('Token used too late')) {
      return res.status(401).json({ message: "Token has expired. Please try again." });
    }
    
    res.status(401).json({ message: "Invalid Google token. Please try signing in again." });
  }
});

// Middleware to verify JWT token
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  
  if (!authHeader) {
    return res.status(401).json({ message: "No authorization token provided" });
  }

  const token = authHeader.split(" ")[1]; // Bearer TOKEN
  
  if (!token) {
    return res.status(401).json({ message: "No token provided" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    console.error("Token verification error:", err);
    return res.status(401).json({ message: "Invalid or expired token" });
  }
};

// GET /auth/profile - Protected route to get user profile
router.get("/profile", verifyToken, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select('-googleId');
    
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        createdAt: user.createdAt
      }
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ message: "Server error" });
  }
});

// POST /auth/logout - Logout endpoint (for client-side token cleanup)
router.post("/logout", verifyToken, (req, res) => {
  // In a real app, you might want to blacklist the token
  // For now, just send success response - client will remove token
  res.json({ message: "Logged out successfully" });
});

// GET /auth/verify - Verify if token is still valid
router.get("/verify", verifyToken, (req, res) => {
  res.json({ 
    valid: true, 
    userId: req.user.userId,
    email: req.user.email 
  });
});

module.exports = router;