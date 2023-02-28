const mysql = require('mysql');

const dbConfig = {
  host: 'localhost',
  user: 'root',
  password: 'password',
  database: 'test_node',
};

const db = mysql.createConnection(dbConfig);

module.exports = db;
