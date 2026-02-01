const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const expressLayouts = require('express-ejs-layouts');
const cookieParser = require('cookie-parser');
const flash = require('connect-flash');
const minifyHTML = require('express-minify-html-terser');
const compression = require('compression');
require('dotenv').config();
const app = express();
const PORT = 8000;

// Middleware

// Body parser
app.use(express.json({limit:'15mb'}));
app.use(express.urlencoded({ extended: true ,limit:'15mb'}));

// Static files
app.use(express.static(path.join(__dirname, 'public')));

app.use(cookieParser());

// EJS Layouts
app.use(expressLayouts);
app.set('layout', 'layout');  // layout.ejs in views folder second parameter is file name 

//View Engine
app.set('view engine','ejs')

// Middleware for compression
app.use(compression({
        limit : 9,
        threshold : 10*1024
    }));

//Middleware for minify

app.use(minifyHTML({
    override:      true,
    htmlMinifier: {
        removeComments:            true,
        collapseWhitespace:        true,
        collapseBooleanAttributes: true,
        removeAttributeQuotes:     true,
        removeEmptyAttributes:     true,
        minifyJS:                  true
    }
}));

//Database Connection 
mongoose.connect(process.env.MONGODB_URI)



app.use('/admin',(req, res, next) => {
    res.locals.layout = 'admin/layout'; // admin/layout.ejs
    next();
});
app.use('/admin', require('./routes/admin'));

// Routes
app.use('/', require('./routes/frontend'));
app.listen(PORT,()=>{
    console.log(`Server AT Running PORT ${PORT}`);
})

