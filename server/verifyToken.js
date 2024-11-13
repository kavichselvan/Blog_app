const jwt = require('jsonwebtoken'); // Ensure jwt is imported

const verifyToken = (req, res, next) => {
    console.log('Session token:', req.session?.token); // Debug log for checking the token

    // Extract token from session
    const token = req.session?.token;
    if (!token) {
        // Return a 401 response if the token is missing
        return res.status(401).json("You are not authenticated!");
    }

    // Verify the token using the secret from environment variables
    jwt.verify(token, process.env.SECRET, (err, data) => {
        if (err) {
            // Return a 403 response if the token is invalid
            return res.status(403).json("Token is not valid!");
        }

        // Attach user ID to the request object for further use
        req.userId = data._id;
        next(); // Proceed to the next middleware or route handler
    });
};

module.exports = verifyToken;
