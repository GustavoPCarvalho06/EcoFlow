import mysql from 'mysql2/promise';
import bcrypt from 'bcryptjs';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'EcoFlowBD', 
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
});

async function getConnection() {
    return pool.getConnection();
}

async function readAll(table, where = null) {
    const connection = await getConnection();
    try {
        let sql = `SELECT * FROM ${table}`;
        if (where) {
            sql += ` WHERE ${where}`;
        }
        const [rows] = await connection.execute(sql);
        return rows;
    } finally {
        connection.release();
    }
}

async function read(sql, params = []) {
    const connection = await getConnection();
    try {
        const [rows] = await connection.execute(sql, params);
        return rows;
    } catch(err) {
        console.error("Erro ao executar a query de leitura:", err);
        throw err;
    } finally {
        connection.release();
    }
}

async function create(table, data) {
    const connection = await getConnection();
    try {
        const columns = Object.keys(data).join(', ');
        const placeholders = Array(Object.keys(data).length).fill('?').join(', ');
        const sql = `INSERT INTO ${table} (${columns}) VALUES (${placeholders})`;
        const values = Object.values(data);
        const [result] = await connection.execute(sql, values);
        return result.insertId;
    } finally {
        connection.release();
    }
}

async function update(table, data, where) {
    const connection = await getConnection();
    try {
        const set = Object.keys(data)
            .map(column => `${column} = ?`)
            .join(', ');
        const sql = `UPDATE ${table} SET ${set} WHERE ${where}`;
        const values = Object.values(data);
        const [result] = await connection.execute(sql, values);
        return result.affectedRows;
    } finally {
        connection.release();
    }
}

async function deleteRecord(table, where) {
    const connection = await getConnection();
    try {
        const sql = `DELETE FROM ${table} WHERE ${where}`;
        const [result] = await connection.execute(sql);
        return result.affectedRows;
    } finally {
        connection.release();
    }
}

async function compare(senha, hash) {
    try {
        return await bcrypt.compare(senha, hash);
    } catch (error) {
        console.error('Erro ao comparar a senha com o hash:', error);
        return false;
    }
}

const createLixoDB = async (table, data) => {
  const connection = await getConnection();
  try {
    const keys = Object.keys(data).join(", ");
    const values = Object.values(data)
      .map((v) => (typeof v === "string" && !v.startsWith("ST_GeomFromText") ? `'${v}'` : v))
      .join(", ");
    const sql = `INSERT INTO ${table} (${keys}) VALUES (${values})`;
    
    const [result] = await connection.query(sql);
    return result;
  } catch (err) {
    console.error("Erro no CREATE:", err);
    throw err;
  } finally {
    connection.release();
  }
};

export { create, readAll, read, update, deleteRecord, compare, createLixoDB, pool };