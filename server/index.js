const express = require('express');
const app = express();
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const cors = require('cors');
const multer = require('multer');
const path = require("path");
const session = require('express-session');
const MongoStore = require('connect-mongo'); // Optional for storing sessions in MongoDB

const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const postRoute = require('./routes/posts');
const commentRoute = require('./routes/comments');

// Load environment variables
dotenv.config();

// Database connection
const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URL);
        console.log("Database is connected successfully!");
    } catch (err) {
        console.log(err);
    }
};

// Middleware setup
app.use(express.json());
app.use("/images", express.static(path.join(__dirname, "/images")));

// Configure CORS
app.use(cors({
    origin: "https://bluetoblog.netlify.app", // Replace with your frontend URL
    credentials: true
}));

// Configure express-session
app.use(session({
    secret: process.env.SECRET || 'defaultSecret', // Keep this secure and private
    resave: false, // Prevents unnecessary session re-saving
    saveUninitialized: false, // Prevents creating sessions for unauthenticated users
    store: MongoStore.create({
        mongoUrl: process.env.MONGO_URL, // Connects sessions to MongoDB
        collectionName: 'sessions'
    }),
    cookie: {
        httpOnly: true, // Protects against XSS by preventing client-side script access
        secure: process.env.NODE_ENV === 'production', // True in production for HTTPS
        sameSite: 'lax' // Adjust based on app's CSRF policy; 'strict' for stricter security
    }
}));


// Routes
app.use("/api/auth", authRoute);
app.use("/api/users", userRoute);
app.use("/api/posts", postRoute);
app.use("/api/comments", commentRoute);

// Image upload setup
const storage = multer.diskStorage({
    destination: (req, file, fn) => {
        fn(null, "images");
    },
    filename: (req, file, fn) => {
        fn(null, req.body.img);
        // fn(null, "image1.jpg");
    }
});

const upload = multer({ storage: storage });
app.post("/api/upload", upload.single("file"), (req, res) => {
    res.status(200).json("Image has been uploaded successfully!");
});

// Start server and connect to database
app.listen(process.env.PORT, () => {
    connectDB();
    console.log("App is running on port " + process.env.PORT);
});