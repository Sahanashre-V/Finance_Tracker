const express = require("express");
const jwt = require("jsonwebtoken");
const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");
const verifyToken = require("../middleware/auth");

const router = express.Router();

// Validate required environment variables
if (!process.env.GOOGLE_CLIENT_ID) {
  throw new Error('GOOGLE_CLIENT_ID environment variable is required');
}
if (!process.env.JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required');
}

const googleClient = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google Auth (Sign In & Sign Up)
router.post("/auth/google", async (req, res) => {
  try {
    const { id_token: credential } = req.body; // Note: Google sends 'credential' not 'id_token'
    
    console.log("=== Google Auth Request ===");
    console.log("Received credential:", credential ? "Present" : "Missing");
    
    if (!credential) {
      return res.status(400).json({ 
        success: false,
        message: "Google credential is required" 
      });
    }

    // Verify the Google token
    console.log("Verifying Google token...");
    const ticket = await googleClient.verifyIdToken({
      idToken: credential,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    console.log("Google payload:", {
      sub: payload?.sub,
      email: payload?.email,
      name: payload?.name,
      picture: payload?.picture,
      email_verified: payload?.email_verified
    });

    // Validate payload
    if (!payload || !payload.sub || !payload.email) {
      console.error("Invalid payload:", payload);
      return res.status(400).json({ 
        success: false,
        message: "Invalid Google token payload" 
      });
    }

    // Ensure email is verified
    if (!payload.email_verified) {
      return res.status(400).json({ 
        success: false,
        message: "Google email not verified" 
      });
    }

    // Check if user already exists
    console.log("Searching for existing user with email:", payload.email);
    let user = await User.findOne({
      $or: [
        { googleId: payload.sub },
        { email: payload.email }
      ]
    });
    
    console.log("Existing user found:", user ? `Yes (ID: ${user._id})` : "No");

    let isNewUser = false;
    
    if (!user) {
      console.log("Creating new user...");
      
      // Prepare user data with fallbacks
      const userData = {
        googleId: payload.sub,
        email: payload.email,
        name: payload.name || payload.email.split('@')[0],
        picture: payload.picture || null,
      };
      
      console.log("User data to create:", userData);
      
      try {
        user = new User(userData);
        await user.save();
        console.log("✓ User created successfully with ID:", user._id);
        isNewUser = true;
      } catch (createError) {
        console.error("❌ Error creating user:", createError);
        
        if (createError.name === 'ValidationError') {
          console.error("Validation errors:", createError.errors);
          return res.status(400).json({ 
            success: false,
            message: "User validation failed", 
            errors: Object.keys(createError.errors).reduce((acc, key) => {
              acc[key] = createError.errors[key].message;
              return acc;
            }, {})
          });
        }
        
        if (createError.code === 11000) {
          console.error("Duplicate key error:", createError.keyPattern);
          
          // Try to find the existing user
          user = await User.findOne({
            $or: [
              { googleId: payload.sub },
              { email: payload.email }
            ]
          });
          
          if (user) {
            console.log("Found existing user after duplicate error:", user._id);
          } else {
            return res.status(400).json({ 
              success: false,
              message: "User already exists but couldn't be retrieved" 
            });
          }
        } else {
          throw createError;
        }
      }
    } else {
      console.log("Using existing user:", user._id);
      
      // Update existing user's Google info if needed
      let needsUpdate = false;
      if (user.googleId !== payload.sub) {
        user.googleId = payload.sub;
        needsUpdate = true;
      }
      if (payload.name && user.name !== payload.name) {
        user.name = payload.name;
        needsUpdate = true;
      }
      if (payload.picture && user.picture !== payload.picture) {
        user.picture = payload.picture;
        needsUpdate = true;
      }
      
      if (needsUpdate) {
        await user.save();
        console.log("Updated existing user info");
      }
    }

    // Generate JWT token
    const accessToken = jwt.sign(
      { 
        userId: user._id, 
        email: user.email,
        googleId: user.googleId 
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    console.log("✓ Authentication successful for user:", user._id);
    console.log("✓ JWT token generated");

    res.json({
      success: true,
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
    console.error("❌ Google Auth Error:", err);
    
    // Handle specific Google Auth errors
    if (err.message?.includes('Token used too late')) {
      return res.status(401).json({ 
        success: false,
        message: "Google token has expired. Please try signing in again." 
      });
    }
    
    if (err.message?.includes('Invalid token') || err.message?.includes('Token verification failed')) {
      return res.status(401).json({ 
        success: false,
        message: "Invalid Google token. Please try signing in again." 
      });
    }

    if (err.message?.includes('audience')) {
      return res.status(401).json({ 
        success: false,
        message: "Google token audience mismatch. Check your client ID configuration." 
      });
    }
    
    res.status(500).json({ 
      success: false,
      message: "Authentication failed. Please try again.",
      error: process.env.NODE_ENV === 'development' ? err.message : undefined
    });
  }
});

// Get Profile
router.get("/auth/profile", verifyToken, async (req, res) => {
  try {
    console.log("Fetching profile for user:", req.user.userId);
    
    const user = await User.findById(req.user.userId).select("-googleId");
    if (!user) {
      console.log("User not found:", req.user.userId);
      return res.status(404).json({ 
        success: false,
        message: "User not found" 
      });
    }
    
    console.log("✓ Profile fetched for:", user._id);
    res.json({ 
      success: true,
      user 
    });
  } catch (err) {
    console.error("Profile fetch error:", err);
    res.status(500).json({ 
      success: false,
      message: "Server error" 
    });
  }
});

// Logout (invalidate token on frontend)
router.post("/auth/logout", verifyToken, (req, res) => {
  console.log("User logged out:", req.user.userId);
  res.json({ 
    success: true,
    message: "Logged out successfully" 
  });
});

// Verify Token
router.get("/auth/verify", verifyToken, (req, res) => {
  res.json({ 
    success: true,
    valid: true, 
    userId: req.user.userId, 
    email: req.user.email 
  });
});

module.exports = router;