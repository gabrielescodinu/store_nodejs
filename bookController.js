const { db } = require("./config.js");

const addBook = (req, res) => {
  res.render("books/create-book");
};

const editBook = (req, res, doc) => {
  res.render("books/edit-book", { book: doc.data() });
};
// getBooks

const getBooks = async (req, res) => {
  const books = await db.collection("books").get();
  const booksArray = [];
  books.forEach((doc) => {
    booksArray.push(doc.data());
  });
  res.render("books/books", { books: booksArray });
};

module.exports = {
  addBook,
  getBooks,
  editBook,
};
