// multer configuration
const multer = require('multer');
const fs = require('fs');
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

        // Everything went fine. Proceed with storing the product in the database.
        const { name, email, message } = req.body;
        const imagePath = path.join('./uploads/', req.file.filename);

        const sql = 'INSERT INTO products (name, email, message, image) VALUES (?, ?, ?, ?)';
        db.query(sql, [name, email, message, imagePath], function (err, result) {
            if (err) throw err;
            console.log('Product created!');
            res.redirect('/products');
        });
    });
}

// create
function createStudent(req, res) {
    res.render('product-create');
}

// index
function getStudents(req, res, db) {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('products', { products: result });
    });
}

// edit
function editStudent(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('product-edit', { product: result[0] });
    });
}

// show
function showStudent(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('product-show', { product: result[0] });
    });
}

// update
function updateStudent(req, res, db) {
    const productId = req.params.id;
    const storage = multer.diskStorage({
        destination: function (req, file, cb) {
            cb(null, './public/uploads/');
        },
        filename: function (req, file, cb) {
            const ext = path.parse(file.originalname).ext;
            cb(null, file.fieldname + '-' + Date.now() + ext);
        }
    });
    const upload = multer({ storage: storage }).single('image');
    upload(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log('Multer error occurred: ' + err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log('Unknown error occurred: ' + err)
        }

        // Everything went fine. Proceed with updating the product in the database.
        const { name, email, message } = req.body;
        let imagePath = req.file ? path.join('./uploads/', req.file.filename) : null;

        if (!imagePath) {
            // If no new image was uploaded, use the existing image path in the database
            const sql = 'SELECT image FROM products WHERE id = ?';
            db.query(sql, [productId], (err, result) => {
                if (err) throw err;
                imagePath = result[0].image;
                updateStudentInDatabase();
            });
        } else {
            // Delete the previous image associated with the product from the server
            const sql = 'SELECT image FROM products WHERE id = ?';
            db.query(sql, [productId], (err, result) => {
                if (err) throw err;
                const previousImagePath = result[0].image;
                if (previousImagePath) {
                    fs.unlink(`./public/${previousImagePath}`, (err) => {
                        if (err) throw err;
                        console.log(`Image ${previousImagePath} deleted!`);
                    });
                }
                updateStudentInDatabase();
            });
        }

        function updateStudentInDatabase() {
            const sql = 'UPDATE products SET name = ?, email = ?, message = ?, image = ? WHERE id = ?';
            db.query(sql, [name, email, message, imagePath, productId], (err, result) => {
                if (err) throw err;
                console.log('Product updated!');
                res.redirect('/products');
            });
        }
    });
}



// delete
// delete
function deleteStudent(req, res, db) {
    const productId = req.params.id;
    const sql = 'SELECT image FROM products WHERE id = ?';
    db.query(sql, [productId], (err, result) => {
        if (err) throw err;
        const imagePath = result[0].image;
        const deleteSql = 'DELETE FROM products WHERE id = ?';
        db.query(deleteSql, [productId], (err, result) => {
            if (err) throw err;
            console.log(`Product with id ${productId} deleted!`);
            if (imagePath) {
                fs.unlink(`./public/${imagePath}`, (err) => {
                    if (err) throw err;
                    console.log(`Image ${imagePath} deleted!`);
                });
            }
            res.redirect('/products');
        });
    });
}


// export
module.exports = { storeStudent, createStudent, getStudents, editStudent, showStudent, updateStudent, deleteStudent };
