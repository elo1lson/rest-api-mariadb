const mysql = require('mysql')

let pool = mysql.createPool({
  'user': process.env.MYSQL_USER,
  'password': process.env.MYSQL_PASSWORD,
  'database': process.env.MYSQL_DATABASE,
  'host': process.env.MYSQL_HOST,
  'port': 3306
})

exports.pool = pool