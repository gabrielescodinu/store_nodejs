// studentController.js

function storeStudent(req, res, db) {
    const { name, email, message } = req.body;

    const sql = 'INSERT INTO students (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) throw err;
        console.log('Student created!');
        res.redirect('/students');
    });
}

function createStudent(req, res) {
    res.render('student-create');
}

function getStudents(req, res, db) {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('students', { students: result });
    });
}

function editStudent(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('student-edit', { student: result[0] });
    });
}

function updateStudent(req, res, db) {
    const studentId = req.params.id;
    const { name, email, message } = req.body;
    const sql = 'UPDATE students SET name = ?, email = ?, message = ? WHERE id = ?';
    db.query(sql, [name, email, message, studentId], (err, result) => {
        if (err) throw err;
        console.log('Student updated!');
        res.redirect('/students');
    });
}

function deleteStudent(req, res, db) {
    const studentId = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [studentId], (err, result) => {
        if (err) throw err;
        console.log(`Student with id ${studentId} deleted!`);
        res.redirect('/students');
    });
}

module.exports = { storeStudent, createStudent, getStudents, editStudent, updateStudent, deleteStudent };
