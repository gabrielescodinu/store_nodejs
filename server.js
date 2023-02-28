const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
const port = 3000;

const db = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'test_node'
});

db.connect(err => {
    if (err) throw err;
    console.log('Connected to MySQL database!');
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

app.post('/submit', (req, res) => {
    const name = req.body.name;
    const email = req.body.email;
    const message = req.body.message;
    const sql = 'INSERT INTO students (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) throw err;
        console.log('Data inserted into MySQL database!');
        res.send('Data inserted into MySQL database!');
    });
});

app.get('/login', (req, res) => {
    res.render('login'); // assumes you have a login.ejs file in your views folder
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

// Handle POST requests to log out
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
// create
app.post('/student-create', (req, res) => {
    const { name, email, message } = req.body;

    const sql = 'INSERT INTO students (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) throw err;
        console.log('Student created!');
        res.redirect('/students');
    });
});

app.get('/student-create', (req, res) => {
    res.render('student-create');
});

// index
app.get('/students', (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('students', { students: result });
    });
});

// edit
app.post('/student-edit', (req, res) => {
    const { id } = req.body;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('student-edit', { student: result[0] });
    });
});

// update
app.post('/students/:id/update', (req, res) => {
    const studentId = req.params.id;
    const { name, email, message } = req.body;
    const sql = 'UPDATE students SET name = ?, email = ?, message = ? WHERE id = ?';
    db.query(sql, [name, email, message, studentId], (err, result) => {
        if (err) throw err;
        console.log('Student updated!');
        res.redirect('/students');
    });
});

// delete
app.post('/student-delete/:id', (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [studentId], (err, result) => {
        if (err) throw err;
        console.log(`Student with id ${studentId} deleted!`);
        res.redirect('/students');
    });
});



app.get('/', (req, res) => {
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
    res.render('dashboard'); // assumes you have a dashboard.ejs file in your views folder
});

app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});