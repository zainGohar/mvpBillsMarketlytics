require("dotenv").config();
const mysql = require("mysql2");
const config = require("../global/config");

const myDb = mysql.createPool({
  connectionLimit: 10,
  host: config.get("DB_HOST"),
  user: config.get("DB_USERNAME"),
  password: config.get("DB_PASS"),
  database: config.get("DB_NAME"),
  multipleStatements: true,
});

function beginTransaction() {
  return new Promise((resolve, reject) => {
    myDb.getConnection((error, connection) => {
      if (error) {
        reject(error);
      } else {
        connection.beginTransaction((error) => {
          if (error) {
            connection.release();
            reject(error);
          } else {
            resolve(connection);
          }
        });
      }
    });
  });
}

function rollbackTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.rollback(() => {
      connection.release();
      resolve();
    });
  });
}

function commitTransaction(connection) {
  return new Promise((resolve, reject) => {
    connection.commit((error) => {
      if (error) {
        reject(error);
      } else {
        connection.release();
        resolve();
      }
    });
  });
}

module.exports = {
  myDb,
  beginTransaction,
  rollbackTransaction,
  commitTransaction,
};
