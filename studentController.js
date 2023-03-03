// multer configuration
const multer  = require('multer');
const path = require('path');

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, './public/uploads/');
    },
    filename: function (req, file, cb) {
        const ext = path.parse(file.originalname).ext;
        cb(null, file.fieldname + '-' + Date.now() + ext);
    }
});

const upload = multer({ storage: storage });

// store
function storeStudent(req, res, db) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log('Multer error occurred: ' + err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log('Unknown error occurred: ' + err)
        }

        // Everything went fine. Proceed with storing the student in the database.
        const { name, email, message } = req.body;
        const imagePath = path.join('./uploads/', req.file.filename);

        const sql = 'INSERT INTO students (name, email, message, image) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, email, message, imagePath], function (err, result) {
            if (err) throw err;
            console.log('Student created!');
            res.redirect('/students');
        });
    });
}

// create
function createStudent(req, res) {
    res.render('student-create');
}

// index
function getStudents(req, res, db) {
    const sql = 'SELECT * FROM students';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('students', { students: result });
    });
}

// edit
function editStudent(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('student-edit', { student: result[0] });
    });
}

// show
function showStudent(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM students WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('student-show', { student: result[0] });
    });
}

// update
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

// delete
function deleteStudent(req, res, db) {
    const studentId = req.params.id;
    const sql = 'DELETE FROM students WHERE id = ?';
    db.query(sql, [studentId], (err, result) => {
        if (err) throw err;
        console.log(`Student with id ${studentId} deleted!`);
        res.redirect('/students');
    });
}

// export
module.exports = { storeStudent, createStudent, getStudents, editStudent, showStudent, updateStudent, deleteStudent };
