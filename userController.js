// userController.js

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

module.exports = { createUser, getCreateUserPage };
