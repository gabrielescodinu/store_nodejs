const mysql = require('mysql');
const express = require('express');
const bodyParser = require('body-parser');
const ejs = require('ejs');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const app = express();
app.use(express.static("public"));

const studentController = require('./studentController');
const productController = require('./productController');
const categoryController = require('./categoryController');
const userController = require('./userController');
const db = require('./config');

const path = require('path');
app.use(express.static(path.join(__dirname, 'public')));

process.env.STRIPE_TEST_SECRET_KEY = '<your-test-secret-key>';
process.env.STRIPE_LIVE_SECRET_KEY = '<your-live-secret-key>';

const stripe = require('stripe')('pk_test_51MjJp2DgazLEDsewryLztA5IxrOHUQtqVqtYq345FGuP6Qehb1pySw3xS1yc39ZVNzsnPxIausAFDHxF1PYQjeAP00PFdldIRu');

const port = 3000;
// configuration middleware and express application ---------------------------------------------------------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');
app.use(cookieParser());
app.use(session({
    secret: 'your-secret-key',
    resave: true,
    saveUninitialized: true
}));

// homepage ---------------------------------------------------------------------------------------------------------------------------------
app.get('/', (req, res) => {
    res.render('index');
});

// user ---------------------------------------------------------------------------------------------------------------------------------
// login
app.get('/login', userController.login);
app.post('/login', userController.loginUser);
// logout
app.get('/logout', userController.logout);
// registration
app.post('/registration', (req, res) => {
    userController.createUser(req, res, db);
});
app.get('/registration', userController.getCreateUserPage);
// dashboard
app.get('/dashboard', userController.requireLogin, userController.dashboard);
// admin
app.get('/admin', userController.requireLogin, userController.requireAdmin, userController.adminOnlyHandler);

// student ---------------------------------------------------------------------------------------------------------------------------------
app.post('/student-create', (req, res) => studentController.storeStudent(req, res, db));
app.get('/student/student-create', studentController.createStudent);
app.get('/students', (req, res) => studentController.getStudents(req, res, db));
app.post('/student-edit', (req, res) => studentController.editStudent(req, res, db));
app.post('/student-show', (req, res) => studentController.showStudent(req, res, db));
app.post('/students/:id/update', (req, res) => studentController.updateStudent(req, res, db));
app.post('/student-delete/:id', (req, res) => studentController.deleteStudent(req, res, db));

// product ---------------------------------------------------------------------------------------------------------------------------------
app.post('/product-create', (req, res) => productController.storeProduct(req, res, db));
app.get('/product/product-create', (req, res) => { productController.createProduct(req, res, db); });
app.get('/products', (req, res) => productController.getProducts(req, res, db));
app.post('/product-edit', (req, res) => productController.editProduct(req, res, db));
app.post('/product-show', (req, res) => productController.showProduct(req, res, db));
app.post('/products/:id/update', (req, res) => productController.updateProduct(req, res, db));
app.post('/product-delete/:id', (req, res) => productController.deleteProduct(req, res, db));

// category ---------------------------------------------------------------------------------------------------------------------------------
app.post('/category-create', (req, res) => categoryController.storeCategory(req, res, db));
app.get('/category/category-create', categoryController.createCategory);
app.get('/categories', (req, res) => categoryController.getCategories(req, res, db));
app.post('/category-edit', (req, res) => categoryController.editCategory(req, res, db));
app.post('/category-show', (req, res) => categoryController.showCategory(req, res, db));
app.post('/categories/:id/update', (req, res) => categoryController.updateCategory(req, res, db));
app.post('/category-delete/:id', (req, res) => categoryController.deleteCategory(req, res, db));

// port ---------------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
    console.log(`Server listening at http://localhost:${port}`);
});