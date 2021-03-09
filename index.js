// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
const { printTable } = require('console-table-printer');

// Classes
const Department = require('./lib/department');
const Employee = require('./lib/employee');
const Role = require('./lib/role');

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: '***********',
    database: 'employee_db',
});

connection.connect((error) => {
    if (error) throw error;
    console.log(`connected as id ${connection.threadId}`);
    afterConnection();
});