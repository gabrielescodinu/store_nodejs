const mysql = require('mysql');
const express = require('express');
const studentController = require('./studentController');
const userController = require('./userController');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const db = require('./config');
const port = 3000;

// configuration middleware and express application ---------------------------------------------------------------------------------------------------------------------------------
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
    userController.createUser(req, res, db);
});

app.get('/registration', userController.getCreateUserPage);

// homepage ---------------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('index');
});

// dashboard ---------------------------------------------------------------------------------------------------------------------------------
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

// students ---------------------------------------------------------------------------------------------------------------------------------
app.post('/student-create', (req, res) => studentController.storeStudent(req, res, db));
app.get('/student-create', requireLogin, studentController.createStudent);
app.get('/students', (req, res) => studentController.getStudents(req, res, db));
app.post('/student-edit', (req, res) => studentController.editStudent(req, res, db));
app.post('/students/:id/update', (req, res) => studentController.updateStudent(req, res, db));
app.post('/student-delete/:id', (req, res) => studentController.deleteStudent(req, res, db));

// port ---------------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});