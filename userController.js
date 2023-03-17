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

// loginUser
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
                req.session.user = {
                    id: user.id,
                    username: user.username,
                    is_admin: user.is_admin,
                };
                res.redirect('/dashboard');
            } else {
                res.send('Invalid username or password');
            }
        } else {
            res.send('Invalid username or password');
        }
    });
};

// require admin
const requireAdmin = (req, res, next) => {
    const user = req.session.user;
    if (user && user.is_admin === 1) {
        next();
    } else {
        res.redirect('/login');
    }
};

// adminOnlyHandler
const adminOnlyHandler = (req, res) => {
    res.render('admin');
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

// require login
const requireLogin = (req, res, next) => {
    if (req.session.loggedIn) {
        next();
    } else {
        res.redirect('/login');
    }
};

// dashboard
const dashboard = (req, res) => {
    const userId = req.session.user.id

    // esegui una query SQL per selezionare i pagamenti dell'utente loggato
    db.query('SELECT * FROM payments WHERE user_id = ?', [userId], (err, results) => {
        if (err) throw err;

        // passa i risultati della query alla vista dashboard
        res.render('dashboard', { payments: results });
    });
};

module.exports = { createUser, getCreateUserPage, login, loginUser, requireAdmin, adminOnlyHandler, logout, requireLogin, dashboard };
