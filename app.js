require('dotenv').config(); // Load environment variables from .env file

const express = require('express'); // Import Express framework
const expressLayout = require('express-ejs-layouts'); // Import express-ejs-layouts for layout support
const cookieParser = require('cookie-parser'); // Import cookie-parser middleware
const MongoStore = require('connect-mongo'); // Import connect-mongo for MongoDB session storage

const connectDB = require('./server/config/db'); // Import database connection function
const { isActiveRoute } = require('./server/helpers/routeHelpers');
const session = require('express-session');

const app = express(); // Initialize Express app
const PORT = process.env.PORT || 5000; // Define the port

const methodOverride = require('method-override');


// Connect to the database
connectDB();

app.use(express.static('public')); // Any files in 'public' folder will be served statically (everything in public folder is accessible directly via URL)
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cookieParser()); // Use cookie-parser middleware
app.use(methodOverride('_method')); // Use method-override middleware to support PUT and DELETE methods via query parameter

app.locals.isActiveRoute = isActiveRoute;

// Session Middleware

app.use(session({
    secret: 'keyboard cat',
    resave: false,
    saveUninitialized: true,
    store: MongoStore.create({ 
        mongoUrl: process.env.MONGODB_URI
    })
    // cookie: { maxAge: new Date(Date.now() + 3600000) } 
}));

// Template Engine
app.use(expressLayout); // Tell Express to use express-ejs-layouts middleware
app.set('layout', './layouts/main'); // Set default layout file for your EJS views
// Every view will now use 'views/layouts/main.ejs' as its layout
app.set('view engine', 'ejs'); // Tells Express that im using EJS as the template engine

app.use('/', require('./server/routes/main')); // Use routes defined in main.js for the root URL
app.use('/', require('./server/routes/admin'));

app.listen(PORT, () => { // Start the server and listen on the defined port
    console.log(`App listening on port ${PORT}`); // Log a message on the terminal when the server starts
});