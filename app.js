const mysql = require("mysql");
const express = require("express");
const bodyParser = require("body-parser");
const ejs = require("ejs");
const session = require("express-session");
const cookieParser = require("cookie-parser");

const app = express();
app.use(express.static("public"));

const studentController = require("./studentController");
const productController = require("./productController");
const categoryController = require("./categoryController");
const userController = require("./userController");
const bookController = require("./bookController");
const { db } = require("./config");

const path = require("path");
app.use(express.static(path.join(__dirname, "public")));

process.env.STRIPE_TEST_SECRET_KEY = "<your-test-secret-key>";
process.env.STRIPE_LIVE_SECRET_KEY = "<your-live-secret-key>";

const stripe = require("stripe")(
  "sk_test_51MjJp2DgazLEDsewHecS2NUeETt5E1fCCKJ23pWGnRgSYreJ6T1F28djVQZ2D9OaA7DAuuiBbKszUGmAVElK5lF400UIoukbWY"
);

const port = 3001;

// configuration middleware and express application ---------------------------------------------------------------------------------------------------------------------------------
app.use(bodyParser.urlencoded({ extended: true }));
app.set("view engine", "ejs");
app.use(cookieParser());
app.use(
  session({
    secret: "your-secret-key",
    resave: true,
    saveUninitialized: true,
  })
);

// homepage ---------------------------------------------------------------------------------------------------------------------------------
app.get("/", (req, res) => {
  res.render("index");
});

// user ---------------------------------------------------------------------------------------------------------------------------------
// login
app.get("/login", userController.login);
app.post("/login", userController.loginUser);
// logout
app.get("/logout", userController.logout);
// registration
app.post("/registration", (req, res) => {
  userController.createUser(req, res, db);
});
app.get("/registration", userController.getCreateUserPage);
// dashboard
app.get("/dashboard", userController.requireLogin, userController.dashboard);
// admin
app.get(
  "/admin",
  userController.requireLogin,
  userController.requireAdmin,
  userController.adminOnlyHandler
);

// student ---------------------------------------------------------------------------------------------------------------------------------
app.post("/student-create", (req, res) =>
  studentController.storeStudent(req, res, db)
);
app.get("/student/student-create", studentController.createStudent);
app.get("/students", (req, res) => studentController.getStudents(req, res, db));
app.post("/student-edit", (req, res) =>
  studentController.editStudent(req, res, db)
);
app.post("/student-show", (req, res) =>
  studentController.showStudent(req, res, db)
);
app.post("/students/:id/update", (req, res) =>
  studentController.updateStudent(req, res, db)
);
app.post("/student-delete/:id", (req, res) =>
  studentController.deleteStudent(req, res, db)
);

// product ---------------------------------------------------------------------------------------------------------------------------------
app.post("/product-create", (req, res) =>
  productController.storeProduct(req, res, db)
);
app.get("/product/product-create", (req, res) => {
  productController.createProduct(req, res, db);
});
app.get("/products", (req, res) => productController.getProducts(req, res, db));
app.post("/product-edit", (req, res) =>
  productController.editProduct(req, res, db)
);
app.post("/product-show", (req, res) =>
  productController.showProduct(req, res, db)
);
app.post("/products/:id/update", (req, res) =>
  productController.updateProduct(req, res, db)
);
app.post("/product-delete/:id", (req, res) =>
  productController.deleteProduct(req, res, db)
);

// category ---------------------------------------------------------------------------------------------------------------------------------
app.post("/category-create", (req, res) =>
  categoryController.storeCategory(req, res, db)
);
app.get("/category/category-create", categoryController.createCategory);
app.get("/categories", (req, res) =>
  categoryController.getCategories(req, res, db)
);
app.post("/category-edit", (req, res) =>
  categoryController.editCategory(req, res, db)
);
app.post("/category-show", (req, res) =>
  categoryController.showCategory(req, res, db)
);
app.post("/categories/:id/update", (req, res) =>
  categoryController.updateCategory(req, res, db)
);
app.post("/category-delete/:id", (req, res) =>
  categoryController.deleteCategory(req, res, db)
);

app.post("/charge", async (req, res) => {
  try {
    const { product, price, token } = req.body;

    const charge = await stripe.charges.create({
      amount: price * 100,
      currency: "usd",
      description: product,
      source: token.id,
    });

    res.status(200).json({ message: "Payment successful" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Payment failed" });
  }
});

// book ---------------------------------------------------------------------------------------------------------------------------------
app.get("/addBook", bookController.addBook);
app.get("/books", (req, res) => bookController.getBooks(req, res));
app.post("/create-book", (req, res) => {
  storeBook(req);

  async function storeBook(req) {
    const { title, author } = req.body;

    // get automatically generated id
    const id = db.collection("books").doc().id;

    const books = db.collection("books").doc("book" + id);
    const book = await books.set({
      id: id,
      title: title,
      author: author,
    });

    res.redirect("/books");
  }
});
app.get("/edit-book/:id", (req, res) => {
  const id = req.params.id;
  const book = db.collection("books").doc("book" + id);
  const getDoc = book
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        bookController.editBook(req, res, doc);
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
    });
});
app.post("/books/:id/update/", (req, res) => {
  const id = req.params.id;
  const { title, author } = req.body;

  const book = db.collection("books").doc("book" + id);
  const getDoc = book
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        book.update({
          title: title,
          author: author,
        });
        res.redirect("/books");
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
    });
});

app.get("/delete-book/:id", (req, res) => {
  const id = req.params.id;
  const book = db.collection("books").doc("book" + id);
  const getDoc = book
    .get()
    .then((doc) => {
      if (!doc.exists) {
        console.log("No such document!");
      } else {
        book.delete();
        res.redirect("/books");
      }
    })
    .catch((err) => {
      console.log("Error getting document", err);
    });
});

// port ---------------------------------------------------------------------------------------------------------------------------------
app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});
