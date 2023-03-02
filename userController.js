// registration ---------------------------------------------------------------------------------------------------------------------------------

function createUser(req, res, db) {
    const { username, password } = req.body;    

    // Insert new user into the database
    const sql = 'INSERT INTO users (username, password) VALUES (?, ?)';
    db.query(sql, [username, password], (err, result) => {
        if (err) throw err;
        console.log('User created!');
        res.redirect('/login');
    });
}

function getCreateUserPage(req, res) {
    res.render('registration');
}

// login ---------------------------------------------------------------------------------------------------------------------------------
const db = require('./config');

const login = (req, res) => {
    res.render('login');
};

const loginUser = (req, res) => {
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
};

// logout ---------------------------------------------------------------------------------------------------------------------------------
const logout = (req, res) => {
    // Destroy the user's session
    req.session.destroy(err => {
        if (err) throw err;

        // Redirect the user to the login page
        res.redirect('/login');
    });
};



const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

const dashboard = (req, res) => {
    res.render('dashboard');
};

module.exports = { createUser, getCreateUserPage, login, loginUser, logout, requireLogin, dashboard };
