const db = require('./config');

// funzione per creare uno studente
exports.createStudent = (req, res) => {
    const { name, email, message } = req.body;

    const sql = 'INSERT INTO students (name, email, message) VALUES (?, ?, ?)';
    db.query(sql, [name, email, message], (err, result) => {
        if (err) throw err;
        console.log('Student created!');
        res.redirect('/students');
    });
};

// funzione per ottenere tutti gli studenti
exports.getStudents = (req, res) => {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('students', { students: result });
    });
};

// funzione per ottenere uno studente specifico
exports.getStudentById = (req, res) => {
    const { id } = req.params;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('student-edit', { student: result[0] });
    });
};

// funzione per aggiornare uno studente
exports.updateStudent = (req, res) => {
    const studentId = req.params.id;
    const { name, email, message } = req.body;
    const sql = 'UPDATE students SET name = ?, email = ?, message = ? WHERE id = ?';
    db.query(sql, [name, email, message, studentId], (err, result) => {
        if (err) throw err;
        console.log('Student updated!');
        res.redirect('/students');
    });
};

// funzione per eliminare uno studente
exports.deleteStudent = (req, res) => {
    const studentId = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [studentId], (err, result) => {
        if (err) throw err;
        console.log(`Student with id ${studentId} deleted!`);
        res.redirect('/students');
    });
};

