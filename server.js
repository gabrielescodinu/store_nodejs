// server.js
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const db = require('./database');
const routes = require('./routes');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.use('/', routes);

app.get('/', (req, res) => {
    res.render('index');
});

const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/dashboard', requireLogin, (req, res) => {
    res.send('Welcome to the dashboard!');
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});
