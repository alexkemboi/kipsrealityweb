import mysql from 'mysql2/promise';

const pool = mysql.createPool({
  host: '184.168.21.114',
  user: 'kipsreality',
  password: 'K@m@1@2o2o',  // URL-decode if needed
  database: 'rentflow360',
  port: 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

export default pool;

