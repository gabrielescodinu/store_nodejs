// multer configuration
const multer = require('multer');
const fs = require('fs');
const path = require('path');
const stripe = require('stripe')('sk_test_51MjJp2DgazLEDsewHecS2NUeETt5E1fCCKJ23pWGnRgSYreJ6T1F28djVQZ2D9OaA7DAuuiBbKszUGmAVElK5lF400UIoukbWY');

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
function storeProduct(req, res, db) {
    upload.single('image')(req, res, function (err) {
        if (err instanceof multer.MulterError) {
            // A Multer error occurred when uploading.
            console.log('Multer error occurred: ' + err)
        } else if (err) {
            // An unknown error occurred when uploading.
            console.log('Unknown error occurred: ' + err)
        }

        // Everything went fine. Proceed with storing the product in the database.
        const { name, email, message, category_id } = req.body;
        const imagePath = path.join('./uploads/', req.file.filename);

        const sql = 'INSERT INTO products (name, email, message, image, category_id) VALUES (?, ?, ?, ?, ?)';
        db.query(sql, [name, email, message, imagePath, category_id], function (err, result) {
            if (err) throw err;
            console.log('Product created!');
            res.redirect('/products');
        });
    });
}

// create
function createProduct(req, res, db) {
    const sql = 'SELECT * FROM categories';
    db.query(sql, (err, categories) => {
        if (err) throw err;
        res.render('product/product-create', { categories });
    });
}

// index
function getProducts(req, res, db) {
    const sql = 'SELECT * FROM products';
    db.query(sql, (err, result) => {
        if (err) throw err;
        res.render('product/products', { products: result });
    });
}

// edit
function editProduct(req, res, db) {
    const { id } = req.body;
    const sql = 'SELECT * FROM products WHERE id = ?';
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('product/product-edit', { product: result[0] });
    });
}

// show
function showProduct(req, res, db) {
    const { id } = req.body;
    const sql = `SELECT products.*, categories.name AS category_name FROM products JOIN categories ON products.category_id = categories.id WHERE products.id = ?`;
    db.query(sql, [id], (err, result) => {
        if (err) throw err;
        res.render('product/product-show', { product: result[0] });
    });
}

// update
function updateProduct(req, res, db) {
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
                updateProductInDatabase();
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
                updateProductInDatabase();
            });
        }

        function updateProductInDatabase() {
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
function deleteProduct(req, res, db) {
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

// stripe charge payment
charge = async (req, res, db) => {
    try {
        const { productId, stripeToken } = req.body;

        const sql = 'SELECT * FROM products WHERE id = ?';

        db.query(sql, [productId], async (err, result) => {
            if (err) throw err;
            const product = result[0];

            // Effettua il pagamento tramite Stripe
            const charge = await stripe.charges.create({
                amount: product.price * 100,
                currency: 'usd',
                description: product.name,
                source: stripeToken,
            });

            // print the id of the user who made the payment in the console

            // Ottieni le informazioni dell'utente dalla sessione
            const userId = req.session.user.id;

            const userSql = 'SELECT * FROM users WHERE id = ?';
            db.query(userSql, [userId], async (err, userResult) => {
                if (err) throw err;
                const user = userResult[0];

                // Salva i dati della transazione nel database
                const paymentSql = 'INSERT INTO payments (user_id, product_name, charge_id, amount) VALUES (?, ?, ?, ?)';
                db.query(paymentSql, [user.id, product.name, charge.id, charge.amount / 100], (err, paymentResult) => {
                    if (err) throw err;
                    console.log('Payment successful');
                    console.log(user);
                    res.render('success', { product, charge, user });
                });
            });
        });
    } catch (error) {
        console.error(error);
        res.render('error');
    }
};


// export
module.exports = { storeProduct, createProduct, getProducts, editProduct, showProduct, updateProduct, deleteProduct, charge };
