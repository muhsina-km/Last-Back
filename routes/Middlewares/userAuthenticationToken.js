const jwt = require('jsonwebtoken');
const { promisify } = require('util');
const verifyAsync = promisify(jwt.verify);

const secretKey = 'your_secret_key'; // Replace with your actual secret key

// Function to generate a JWT token
function generateToken(user) {
    const payload = {
        username: user.username,
        // You can include additional user information in the payload if needed
    };

    const options = {
        expiresIn: '1h', // Token expiration time (e.g., 1 hour)
    };

    return jwt.sign(payload, secretKey, options);
}

// Middleware to verify the JWT token
async function authenticateToken(request, response, next) {
    const token = request.header('Authorization');

    if (!token) {
        return response.status(401).json({ success: false, message: 'Access denied. Token not provided.' });
    }

    try {
        const decoded = await verifyAsync(token, secretKey);
        request.user = decoded; // Attach the decoded user information to the request
        next();
    } catch (error) {
        console.error(error);
        response.status(403).json({ success: false, message: 'Invalid token.' });
    }
}

module.exports = {
    generateToken,
    authenticateToken,
};
