// routes.js
const express = require('express');
const router = express.Router();
const db = require('./database');

router.get('/students', (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('students', { students: result });
    });
});

module.exports = router;
