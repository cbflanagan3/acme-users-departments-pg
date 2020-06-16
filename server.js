const express = require('express');
const path = require('path');
const { Client } = require('pg');
const fs = require('fs');
const PG_URL = process.env.PG_URL || 'postgres://postgres:blighmey@localhost:5432/';
const DB_NAME = process.env.DB_NAME || 'acme_database';
const PORT = process.env.PORT || 3000;
// const USERNAME = process.env.USERNAME || 'carolineflanagan'
// const PASSWORD = process.env.PASSWORD || 'blighmey'
const db = new Client (`${PG_URL}${DB_NAME}`);
db.connect();

const app = express();

app.use(express.json());

const findAllUsers = async () => {
   
    const { rows } = await db.query(`
    SELECT id, name
    FROM users;
    `);
    console.log(rows);
    return rows;

}

const findAllUsers = async () => {
   
    const { rows } = await db.query(`
    SELECT id, name
    FROM departments;
    `);
    console.log(rows);
    return rows;

}

const createUser = async (name, departmentId) => {
    if(typeof name != 'string' || typeof departmentId != 'number') {
        throw new Error ('Name should be string and Department ID shoudl be number');
    } 
    await db.query(`
        INSERT INTO users (name, department_id) 
        VALUES ($1, $2));`,[name, departmentId]);
}

const createDepartment = async (name) => {
    if(typeof name != 'string') {
        throw new Error ('Name should be string');
    } 
    await db.query(`
        INSERT INTO departments (name) 
        VALUES ($1));`,[name]);
}

const seed = async (force = false) => {
    if (force) {
      await db.query(`
        DROP TABLE IF EXISTS users;
      `);
    }
  
    await db.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        name VARCHAR(255),
        department_id integer
      );
    `)
    await db.query(`
        DROP TABLE IF EXISTS departments;
    `);
    
    await db.query(`
        CREATE TABLE IF NOT EXISTS departments (
            id SERIAL PRIMARY KEY,
            name VARCHAR(255)
        )`)
  
    console.log('Seeding complete!');
  };

app.get('/api/users', async(req, res) => {
  
    const users = await findAllUsers()
    
    res.send({ users })
})

app.get('/api/department', async(req, res) => {
    const departments = await findAllDepartments()
    res.send({ departments })
})

app.post('/users', async (req, res) => {
    const { name, departmentId } = req.body();
    await createUser(name, departmentId);
    res.send({ message: `${name} was created`})
})

app.post('/departments', async (req, res) => {
    const { name } = req.body();
    await createDepartment(name);
    res.send({ message: `${name} was created`})
})


const startServer = () => new Promise((res) => {
    app.listen(PORT, () => {
      console.log(`Server is now listening on PORT:${PORT}`);
    });
  });
  
  seed(true)
    .then(startServer)
    .catch((e) => {
      console.error('Failed to start/seed!');
      db.end();
      throw e;
    });