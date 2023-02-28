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


module.exports = { app };