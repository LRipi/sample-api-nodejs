process.env.NODE_ENV = process.env.NODE_ENV || 'dev';

const express = require('express');
const session = require('express-session');
require('module-alias/register');
const cors = require('cors');
const compression = require('compression');
const helmet = require('helmet');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const rateLimit = require('express-rate-limit');

const app = express();

// Define request limiter per user to avoid DOS attack
const limiterOption = {
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 20000 // limit each IP to 100 requests per windowMs
};
const limiter = new rateLimit(limiterOption);

// Protections against attack
const corsOptions = {
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
    allowedHeaders: ["Content-Type", "x-access-token"]
};

// Minimize risk of XSS attacks by restricting the client from reading the cookie
// and only send cookie over https
const sessionOptions = {
    secret: 'sample',
    name: 'sample-api',
    cookie: {
        httpOnly: true,
        secure: true,
        maxAge: 60000*60*24
    }
};

app.use(cors(corsOptions));
app.use(session(sessionOptions));
app.use(helmet());
app.use(compression());
app.use(limiter);

if (process.env.DEBUG === 'true')
    app.use(logger(process.env.NODE_ENV));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Routes declaration
require('./routes/routes')(app);

module.exports = app;
