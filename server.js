require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// Initialize the express app
const app = express();

// Import routes
const authRoute = require('./routes/authRoute');
const taskRoute = require('./routes/taskRoute');
const userRoute = require('./routes/userRoute');

// Environment variables
const PORT = process.env.PORT || 3000;
const MONGO_URL = process.env.MONGO_URL;

// CORS options
const corsOptions = {
    origin: '*',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
    optionsSuccessStatus: 204
};

app.use(cors(corsOptions));

// Middleware
app.use(bodyParser.json());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

// Test route
app.get('/', (req, res) => {
    res.send("Hi! developer backend code is running successfully.");
});

// Routes
app.use('/api/auth', authRoute);
app.use('/api/task', taskRoute);
app.use('/api/user', userRoute);

// ping api
app.get("/health", (req, res) => {
  res.status(200).send("ok");
});

// Error handling middleware
app.use((err, req, res, next) => {
    const statusCode = err.status || 500;
    const message = err.message || "Something went wrong!";
    return res.status(statusCode).json({
        success: [200, 201, 204].includes(statusCode),
        status: statusCode,
        message: message,
        data: err.data || null
    });
});

// Database connection
mongoose.set("strictQuery", false);
mongoose.connect(process.env.MONGO_URL)
    .then(() => {
        console.log('connected to MongoDB');
        app.listen(PORT, () => {
            console.log(`Node API app is running on port ${PORT}`);
        });
    })
    .catch((error) => {
        console.log('Error connecting to MongoDB:', error);
    });

module.exports = app;
