const express = require('express');
const router = express.Router();
const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

// REGISTER
router.post("/register", async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Generate salt and hash password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // Create and save new user
        const newUser = new User({ username, email, password: hashedPassword });
        const savedUser = await newUser.save();

        res.status(200).json(savedUser);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json("Internal Server Error");
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

        // Generate JWT
        const token = jwt.sign(
            { _id: user._id, username: user.username, email: user.email },
            process.env.SECRET,
            { expiresIn: "3d" }
        );

        // Store token in session
        req.session.token = token;

        const { password, ...info } = user._doc;
        res.status(200).json(info);
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json("Internal Server Error");
    }
});

// LOGOUT
router.get("/logout", async (req, res) => {
    try {
        req.session.destroy(err => {
            if (err) {
                return res.status(500).json("Logout failed!");
            }
            res.status(200).send("User logged out successfully!");
        });
    } catch (err) {
        console.error(err); // Log the error for debugging
        res.status(500).json("Internal Server Error");
    }
});

// REFETCH USER
router.get("/refetch", (req, res) => {
    const token = req.session.token;

    if (!token) {
        return res.status(401).json("No token found!");
    }

    jwt.verify(token, process.env.SECRET, {}, async (err, data) => {
        if (err) {
            return res.status(403).json("Token verification failed!");
        }
        res.status(200).json(data);
    });
});

module.exports = router;
