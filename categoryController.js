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
function storeCategory(req, res, db) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log('Multer error occurred: ' + err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log('Unknown error occurred: ' + err)
        }

        // Everything went fine. Proceed with storing the category in the database.
        const { name } = req.body;
        const imagePath = path.join('./uploads/', req.file.filename);

        const sql = 'INSERT INTO categories (name, image) VALUES (?, ?)';
        db.query(sql, [name, imagePath], function (err, result) {
            if (err) throw err;
            console.log('Category created!');
            res.redirect('/categories');
        });
    });
}

// create
function createCategory(req, res) {
    res.render('category/category-create');
}

// index
function getCategories(req, res, db) {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('category/categories', { categories: result });
    });
}

// edit
function editCategory(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('category/category-edit', { category: result[0] });
    });
}

// show
function showCategory(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM categories WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('category/category-show', { category: result[0] });
    });
}

// update
function updateCategory(req, res, db) {
    const categoryId = req.params.id;
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

        // Everything went fine. Proceed with updating the category in the database.
        const { name } = req.body;
        let imagePath = req.file ? path.join('./uploads/', req.file.filename) : null;

        if (!imagePath) {
            // If no new image was uploaded, use the existing image path in the database
            const sql = 'SELECT image FROM categories WHERE id = ?';
            db.query(sql, [categoryId], (err, result) => {
                if (err) throw err;
                imagePath = result[0].image;
                updateCategoryInDatabase();
            });
        } else {
            // Delete the previous image associated with the category from the server
            const sql = 'SELECT image FROM categories WHERE id = ?';
            db.query(sql, [categoryId], (err, result) => {
                if (err) throw err;
                const previousImagePath = result[0].image;
                if (previousImagePath) {
                    fs.unlink(`./public/${previousImagePath}`, (err) => {
                        if (err) throw err;
                        console.log(`Image ${previousImagePath} deleted!`);
                    });
                }
                updateCategoryInDatabase();
            });
        }

        function updateCategoryInDatabase() {
            const sql = 'UPDATE categories SET name = ?, image = ? WHERE id = ?';
            db.query(sql, [name, imagePath, categoryId], (err, result) => {
                if (err) throw err;
                console.log('Category updated!');
                res.redirect('/categories');
            });
        }
    });
}

// delete
function deleteCategory(req, res, db) {
    const categoryId = req.params.id;
    const sql = 'SELECT image FROM categories WHERE id = ?';
    db.query(sql, [categoryId], (err, result) => {
        if (err) throw err;
        const imagePath = result[0].image;
        const deleteSql = 'DELETE FROM categories WHERE id = ?';
        db.query(deleteSql, [categoryId], (err, result) => {
            if (err) throw err;
            console.log(`Category with id ${categoryId} deleted!`);
            if (imagePath) {
                fs.unlink(`./public/${imagePath}`, (err) => {
                    if (err) throw err;
                    console.log(`Image ${imagePath} deleted!`);
                });
            }
            res.redirect('/categories');
        });
    });
}


// export
module.exports = { storeCategory, createCategory, getCategories, editCategory, showCategory, updateCategory, deleteCategory };
