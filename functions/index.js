const express = require('express');
const admin = require('firebase-admin');
const userRoutes = require('./routes/UserRoute');
const bodyParserMiddleware = require('./middleware/bodyParserMiddleware');

const app = express();
// Initialize Firebase Admin SDK
const serviceAccount = require("./serviceAccountKey.json");
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

// Middleware
app.use(bodyParserMiddleware);

// Routes
app.use('/users', userRoutes);

// Set the port
const PORT = process.env.PORT || 3000; // Use the environment port if available, otherwise use port 3000

// Start the server
const server = app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = server;


