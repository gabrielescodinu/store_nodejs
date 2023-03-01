const express = require('express');
const router = express.Router();
const studentController = require('./studentController');

// Rotte per creare uno studente
router.post('/student-create', studentController.createStudent);
router.get('/student-create', (req, res) => {
    res.render('student-create');
});

// Rotta per ottenere tutti gli studenti
router.get('/students', studentController.getStudents);

// Rotte per aggiornare uno studente
router.post('/students/:id/update', studentController.updateStudent);
router.post('/student-edit', studentController.getStudentById);

// Rotte per eliminare uno studente
router.post('/student-delete/:id', studentController.deleteStudent);

module.exports = router;
