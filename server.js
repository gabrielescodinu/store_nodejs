const mysql = require('mysql');
const express = require('express');
const studentController = require('./studentController');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./config');
const port = 3000;

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

// login ---------------------------------------------------------------------------------------------------------------------------------
app.get('/login', (req, res) => {
    res.render('login');
});

app.post('/login', (req, res) => {
    const { username, password } = req.body;

    // Check if the username exists in the database
    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], (err, result) => {
        if (err) throw err;

        if (result.length === 1) {
            const user = result[0];

            // Check if the password is correct
            if (user.password === password) {
                req.session.loggedIn = true;
                res.redirect('/dashboard');
            } else {
                res.send('Invalid username or password');
            }
        } else {
            res.send('Invalid username or password');
        }
    });
});

// logout ---------------------------------------------------------------------------------------------------------------------------------
app.get('/logout', (req, res) => {
    // Destroy the user's session
    req.session.destroy(err => {
        if (err) throw err;

        // Redirect the user to the login page
        res.redirect('/login');
    });
});


// registration ---------------------------------------------------------------------------------------------------------------------------------
app.post('/registration', (req, res) => {
    const { username, password } = req.body;

    // Insert new user into the database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) throw err;
        console.log('User created!');
        res.redirect('/login');
    });
});

app.get('/registration', (req, res) => {
    res.render('registration');
});

// students ---------------------------------------------------------------------------------------------------------------------------------
app.post('/student-create', (req, res) => studentController.storeStudent(req, res, db));
app.get('/student-create', studentController.createStudent);
app.get('/students', (req, res) => studentController.getStudents(req, res, db));
app.post('/student-edit', (req, res) => studentController.editStudent(req, res, db));
app.post('/students/:id/update', (req, res) => studentController.updateStudent(req, res, db));
app.post('/student-delete/:id', (req, res) => studentController.deleteStudent(req, res, db));



// homepage ---------------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('index');
});

// dashboard ---------------------------------------------------------------------------------------------------------------------------------
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get('/dashboard', requireLogin, (req, res) => {
    res.render('dashboard');
});

// port ---------------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});