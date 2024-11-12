const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new User({
            username,
            email,
            password: hashedPassword
        });

        const savedUser = await newUser.save();
        res.status(200).json(savedUser);
    } catch (err) {
        console.error("Error in user registration:", err); // Log error for debugging
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// LOGIN
router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            return res.status(404).json("User not found!");
        }

        const match = await bcrypt.compare(req.body.password, user.password);

        if (!match) {
            return res.status(401).json("Wrong credentials!");
        }

        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );
        const { password, ...info } = user._doc;

        res.cookie("token", token, {
            httpOnly: true, // Ensure token cannot be accessed via JavaScript
            secure: process.env.NODE_ENV === "production", // Secure in production (HTTPS)
            sameSite: "none" // Cross-origin cookie sharing
        }).status(200).json(info);

    } catch (err) {
        console.error("Error in login:", err);
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// LOGOUT
router.get("/logout", (req, res) => {
    try {
        res.clearCookie("token", {
            sameSite: "none",
            secure: process.env.NODE_ENV === "production"
        }).status(200).send("User logged out successfully!");
    } catch (err) {
        res.status(500).json({ message: "Internal Server Error", error: err.message });
    }
});

// REFETCH USER
router.get("/refetch", (req, res) => {
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json("Unauthorized: No token provided.");
    }

    jwt.verify(token, process.env.SECRET, {}, (err, data) => {
        if (err) {
            console.error("JWT verification failed:", err); // Log error for debugging
            return res.status(401).json("Unauthorized: Invalid token.");
        }
        res.status(200).json(data);
    });
});

module.exports = router;
