// Dependencies
const inquirer = require('inquirer');
const mysql = require('mysql');
const { printTable } = require('console-table-printer');

// Classes
const Department = require('./lib/department');
const Employee = require('./lib/employee');
const Role = require('./lib/role');

// Arrays
let employeeIdArr = [];
let employeeFnArr = [];
let mgrArr = [];
let roleIdArr = [];
let roleArr = [];
let deptArr = [];

// MySQL connection
const connection = mysql.createConnection({
    host: 'localhost',
    port: 3306,
    user: 'root',
    password: 'R00tPwd!',
    database: 'employees_db',
});

connection.connect((err) => {
    if (err) throw err;
    init();
    buildEmployeeIdArr();
    buildemployeeFnArr();
    buildMgrArr();
    buildRoleIdArr();
    buildRoleArr();
    buildDeptArr();
});

// Task Selection
const taskQuestion = [
    {
        type: 'list',
        message: 'Please select a task from the list of options:',
        name: 'querySelect',
        choices: [
            '1 - View all Employees',
            '2 - View Employees By Department',
            '3 - View Employees By Manager',
            '4 - View all Roles',
            '5 - View all Departments',
            '6 - View a Departments Utilised Budget',
            '7 - Add a new Department',
            '8 - Add a new Role',
            '9 - Add a new Employee',
            '10 - Edit an Employee Role',
            '11 - Edit an Employee Manager',
            '12 - Delete an Employee',
            '13 - Delete an Employee Role',
            '14 - Delete a Department',
            '--- Exit the Application ---',
        ],
    },
];

// Function to start the application and prompt to choose a task
const init = () => {

    inquirer.prompt(taskQuestion).then((data) => {
        const taskAnswer = data.querySelect;
        if (taskAnswer === '1 - View all Employees') {
            viewAll();
        } else if (taskAnswer === '2 - View Employees By Department') {
            viewAllByDept();
        } else if (taskAnswer === '3 - View Employees By Manager') {
            viewMgrs();
        } else if (taskAnswer === '4 - View all Roles') {
            viewRoles();
        } else if (taskAnswer === '5 - View all Departments') {
            viewDept();
        } else if (taskAnswer === '6 - View a Departments Utilised Budget') {
            viewBudget();
        } else if (taskAnswer === '7 - Add a new Department') {
            addNewDept();
        } else if (taskAnswer === '8 - Add a new Role') {
            addNewRole();
        } else if (taskAnswer === '9 - Add a new Employee') {
            addEmployee();
        } else if (taskAnswer === '10 - Edit an Employee Role') {
            editRole();
        } else if (taskAnswer === '11 - Edit an Employee Manager') {
            editEmployeeMgr();
        } else if (taskAnswer === '12 - Delete an Employee') {
            deleteEmployee();
        } else if (taskAnswer === '13 - Delete an Employee Role') {
            deleteRole();
        } else if (taskAnswer === '14 - Delete a Department') {
            deleteDept();
        } else {
            exitApp();
        }
    });
}

// Function to view all employees in a table
const viewAll = () => {

    const dbQuery = `
    SELECT employee.id, employee.first_name, employee.last_name, 
    role.title, department.name AS department,
    role.salary, employee.manager_id AS manager FROM employee 
    LEFT JOIN role on employee.role_id = role.id 
    LEFT JOIN department on role.department_id = department.id`;
    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        printTable(res);
        mainMenu();
    });
}

// Function to view employees by department
const viewAllByDept = () => {

    const dbQuery = 'SELECT name FROM department';
    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'chosenDept',
            type: 'list',
            message: "Please select a Department for which you wish to see its associated Employees':",
            choices: deptArr,
        }).then((answer) => {
            const deptQuery = `
                SELECT employee.id, employee.first_name, employee.last_name, 
                role.title, department.name AS department,
                role.salary, employee.manager_id AS manager FROM employee 
                LEFT JOIN role on employee.role_id = role.id 
                LEFT JOIN department on role.department_id = department.id WHERE name = ?`;
            connection.query(deptQuery, [answer.chosenDept], (err, res) => {
                if (err) throw err;
                printTable(res);
                mainMenu();
            });
        });
    });
}

// Function to view employees by manager
const viewMgrs = () => {

    const dbQuery = `SELECT manager_id FROM employee`;
    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        inquirer.prompt({
            name: 'managers',
            type: 'list',
            message: 'Please select a Manager to view their reportees:',
            choices: mgrArr,
        }).then((answer) => {
            const query2 = `
                SELECT employee.id, employee.first_name, employee.last_name, 
                role.title, department.name AS department,
                role.salary, employee.manager_id AS manager FROM employee 
                LEFT JOIN role on employee.role_id = role.id 
                LEFT JOIN department on role.department_id = department.id
                HAVING manager_id = ?`;
            connection.query(query2, [answer.managers], (err, res) => {
                if (err) throw err;
                printTable(res);
                mainMenu();
            });
        });
    });
}

// Function to view the Roles
const viewRoles = () => {

    const dbQuery = `SELECT * FROM role`;
    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        printTable(res);
        mainMenu();
    });
}

// Function to view all departments
const viewDept = () => {

    const query = `SELECT * FROM department`;
    connection.query(query, (err, res) => {
        if (err) throw err;
        printTable(res);
        mainMenu();
    });
}

// Function to view total utilised budget of a department
const viewBudget = () => {

    inquirer.prompt({
        name: 'department',
        type: 'list',
        message: 'Please select a Department to view its total utilised budget?',
        choices: deptArr,
    }).then((answer) => {
        const query = `
			SELECT department.name AS department, SUM(role.salary) AS 'department budget'
            FROM employee
            LEFT JOIN role on employee.role_id = role.id
            LEFT JOIN department on role.department_id = department.id
            GROUP BY department.name
            HAVING department.name = ?`;
        connection.query(query, [answer.department], (err, res) => {
            if (err) throw err;
            printTable(res);
            mainMenu();
        });
    });
}

// Function to add new departments to the database
const addNewDept = () => {

    inquirer.prompt([
        {
            name: 'newDept',
            type: 'input',
            message: 'Please enter a name for this new Department:',
            validate: (input) => {
                for (let i = 0; i < deptArr.length; i++) {
                    if (!deptArr.includes(input)) {
                        return true;
                    } else {
                        console.log(' - Sorry this Department name is already in use! Please enter a unique new department name:');
                        return false;
                    };
                };

            }
        },
    ]).then((answer) => {

        let newDeptName = answer.newDept;
        let newDeptID = deptArr.length + 1;

        console.log(`Adding the new Department: ${newDeptName} with Department ID: ${newDeptID}, to the Database!`);
        let addNewDept = new Department(newDeptName, newDeptID);
        connection.query('INSERT INTO department SET ?', addNewDept, (err, res) => {
            if (err) throw err;
        });
        buildEmployeeIdArr();
        buildemployeeFnArr();
        buildMgrArr();
        buildRoleIdArr();
        buildRoleArr();
        buildDeptArr();
        mainMenu();
    });
}

// Function to add new roles to the database
const addNewRole = () => {

    inquirer.prompt([
        {
            name: 'newRole',
            type: 'input',
            message: 'Please enter a name for the new Role:',
            validate: (input) => {
                for (let i = 0; i < roleArr.length; i++) {
                    if (!roleArr.includes(input)) {
                        return true;
                    } else {
                        console.log(' - Sorry this Role name is already in use! Please enter a unique new Role name:');
                        return false;
                    };
                };

            }
        },
        {
            name: 'newRoleSalary',
            type: 'number',
            message: 'Please enter a salary for the new Role:',
        },
        {
            name: 'department',
            type: 'list',
            message: 'Please select a Department that the Role is to be associated with:',
            choices: deptArr,
        }

    ]).then((answer) => {

        let newRoleName = answer.newRole;
        let newRoleSalary = answer.newRoleSalary;
        let newRoleID = roleArr.length + 1;

        console.log(`Adding the new Role: ${newRoleName} with Role Salary: ${newRoleSalary} and Role ID: ${newRoleID}, to the database!`);

        let addNewRole = new Role(newRoleName, newRoleSalary, newRoleID);
        connection.query('INSERT INTO role SET ?', addNewRole, (err, res) => {
            if (err) throw err;
        });
        buildEmployeeIdArr();
        buildemployeeFnArr();
        buildMgrArr();
        buildRoleIdArr();
        buildRoleArr();
        buildDeptArr();
        mainMenu();
    });
}

// Function to add new employees to the database
const addEmployee = () => {

    inquirer.prompt([
        {
            name: 'first_name',
            type: 'input',
            message: "What is the new Employee's first name?",
            validate: (input) => {
                letters = /^[A-Za-z]+$/.test(input);
                if (letters) {
                    return true;
                } else {
                    console.log(' - Invalid characters entered, only letters allowed! Please retry using only letters.');
                    return false;
                }
            },
        },
        {
            name: 'last_name',
            type: 'input',
            message: "What is the new Employee's last name?",
            validate: (input) => {
                letters = /^[A-Za-z]+$/.test(input);
                if (letters) {
                    return true;
                } else {
                    console.log(' - Invalid characters entered, only letters allowed! Please retry using only letters.');
                    return false;
                }
            },
        },
        {
            name: 'role',
            type: 'list',
            message: "Please select the new Employee's Role Title?",
            choices: roleArr,
        },
        {
            name: 'manager',
            type: 'list',
            message: "Please select who will be the new Employee's Manager?",
            choices: mgrArr,
        },
    ]).then((answer) => {

        let employeeFirstName = answer.first_name;
        let employeeLastName = answer.last_name;

        const checkRoleId = () => {
            for (let i = 0; i < roleIdArr.length; i++) {
                if (roleIdArr[i].title === answer.role) {
                    return roleIdArr[i].id;
                }
            }
        }

        let employeeRole = checkRoleId();
        let employeeManager = answer.manager;

        console.log(`Adding the new Employee: ${employeeFirstName} ${employeeLastName}, to the database!`);

        let addnewEmployee = new Employee(employeeFirstName, employeeLastName, employeeRole, employeeManager);
        connection.query('INSERT INTO employee SET ?', addnewEmployee, (err, res) => {
            if (err) throw err;
        });
        buildEmployeeIdArr();
        buildemployeeFnArr();
        buildMgrArr();
        buildRoleIdArr();
        buildRoleArr();
        buildDeptArr();
        mainMenu();
    });
}

// Edit an employees role
const editRole = () => {

    inquirer.prompt([
        {
            name: 'first_name',
            type: 'list',
            message: 'Please select the first name of the Employee whos role you want to edit:',
            choices: employeeFnArr,
        },
    ]).then((answer) => {
        const dbQuery = `SELECT last_name FROM employee WHERE first_name = ?`;

        connection.query(dbQuery, [answer.first_name], (err, res) => {
            let fnEditRole = answer.first_name;
            inquirer.prompt([
                {
                    name: 'last_name',
                    type: 'list',
                    message: 'Please select the last name of the Employee whos role you want to edit:',
                    choices: () => {
                        let lastNameArr = [];
                        for (let i = 0; i < res.length; i++) {
                            lastNameArr.push(res[i].last_name);
                        }
                        return lastNameArr;
                    },
                },
            ]).then((answer) => {
                let lnEditRole = answer.last_name;
                const dbQuery = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;

                connection.query(dbQuery, [fnEditRole, lnEditRole], (err, res) => {
                    inquirer.prompt([
                        {
                            name: 'id',
                            type: 'list',
                            message: "Please select the Employee's ID?",
                            choices: () => {
                                let employeeIdArr = [];
                                for (let i = 0; i < res.length; i++) {
                                    employeeIdArr.push(res[i].id);
                                }
                                return employeeIdArr;
                            },
                        },
                    ]).then((answer) => {
                        let idEditRole = answer.id;
                        inquirer.prompt([
                            {
                                name: 'role_title',
                                type: 'list',
                                message: 'Which new Role would you like to allocate to this Employee?',
                                choices: roleArr,
                            },
                        ]).then((answer) => {
                            let newRole = answer.role_title;

                            const FindNewRoleID = () => {
                                for (let i = 0; i < roleIdArr.length; i++) {
                                    if (roleIdArr[i].title === answer.role_title) {
                                        return roleIdArr[i].id;
                                    }
                                }
                            }
                            let updateRoleId = FindNewRoleID();
                            console.log(`Employee role change request: First Name: ${fnEditRole} - Last Name: ${lnEditRole} - New Role Title: ${newRole}`);
                            inquirer.prompt([
                                {
                                    name: 'validate',
                                    type: 'list',
                                    message: `Please confirm you want to make this change to: ${fnEditRole} ${lnEditRole}, New Role Title: ${newRole}?`,
                                    choices: [
                                        'Yes',
                                        'No',
                                    ],
                                },
                            ]).then((answer) => {
                                if (answer.validate === 'Yes') {
                                    console.log(`Employee: ${fnEditRole} ${lnEditRole}, now has a new Role Title of: ${newRole}.`);
                                    connection.query('UPDATE employee SET role_id = ? WHERE first_name = ? AND last_name = ? AND id = ?',
                                        [updateRoleId, fnEditRole, lnEditRole, idEditRole],

                                        (err, res) => {
                                            if (err) throw err;

                                            console.log(`Now ${fnEditRole} ${lnEditRole}'s Role Title has been updated. Don't forget to update their Department Manager if applicable`);
                                            buildEmployeeIdArr();
                                            buildemployeeFnArr();
                                            buildMgrArr();
                                            buildRoleIdArr();
                                            buildRoleArr();
                                            buildDeptArr();
                                            mainMenu();
                                        }
                                    );
                                } else {
                                    console.log("Edit employee's role cancelled.");
                                    mainMenu();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

// Edit an employees manager
const editEmployeeMgr = () => {

    inquirer.prompt([
        {
            name: 'first_name',
            type: 'list',
            message: 'Please select the first name of the Employee whos Manager you want to edit:',
            choices: employeeFnArr,
        },
    ]).then((answer) => {
        const dbQuery = `SELECT last_name FROM employee WHERE first_name = ?`;

        connection.query(dbQuery, [answer.first_name], (err, res) => {
            let fnEditMgr = answer.first_name;
            inquirer.prompt([
                {
                    name: 'last_name',
                    type: 'list',
                    message: 'Please select the last name of the Employee whos Manager you want to edit:',
                    choices: () => {
                        let lastNameArr = [];
                        for (let i = 0; i < res.length; i++) {
                            lastNameArr.push(res[i].last_name);
                        }
                        return lastNameArr;
                    },
                },
            ]).then((answer) => {
                let lnEditMgr = answer.last_name;
                const dbQuery = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;

                connection.query(dbQuery, [fnEditMgr, lnEditMgr], (err, res) => {
                    inquirer.prompt([
                        {
                            name: 'id',
                            type: 'list',
                            message: "Please select the Employee's ID:",
                            choices: () => {
                                let employeeIdArr = [];
                                for (let i = 0; i < res.length; i++) {
                                    employeeIdArr.push(res[i].id);
                                }
                                return employeeIdArr;
                            },
                        },
                    ]).then(() => {
                        inquirer.prompt([
                            {
                                name: 'manager',
                                type: 'list',
                                message: 'Which Manager would you like to allocate to this Employee:',
                                choices: mgrArr,
                            },
                        ]).then((answer) => {
                            let newMgr = answer.manager;

                            console.log(`Employee Manager change request: First Name: ${fnEditMgr} - Last Name: ${lnEditMgr} - New Manager: ${newMgr}`);
                            inquirer.prompt([
                                {
                                    name: 'validate',
                                    type: 'list',
                                    message: `Are you sure you want to make this change to: ${fnEditMgr} ${lnEditMgr}, New Manager Title: ${newMgr}?`,
                                    choices: [
                                        'Yes',
                                        'No',
                                    ],
                                },
                            ]).then((answer) => {
                                if (answer.validate === 'Yes') {
                                    console.log(`Employee: ${fnEditMgr} ${lnEditMgr} has been updated with the new Manager: ${newMgr}`);
                                    connection.query(
                                        'UPDATE employee SET manager_id = ? WHERE first_name = ? AND last_name = ?',
                                        [newMgr, fnEditMgr, lnEditMgr],

                                        (err, res) => {
                                            if (err) throw err;

                                            console.log(`${fnEditMgr} ${lnEditMgr}'s Manager has been updated. Don't forget to update their Role if applicable`);
                                            buildEmployeeIdArr();
                                            buildemployeeFnArr();
                                            buildMgrArr();
                                            buildRoleIdArr();
                                            buildRoleArr();
                                            buildDeptArr();
                                            mainMenu();
                                        }
                                    );
                                } else {
                                    console.log("Edit employee's Manager cancelled.");
                                    mainMenu();
                                }
                            });
                        });
                    });
                });
            });
        });
    });
}

// Function to delete/remove employee from the database
const deleteEmployee = () => {

    inquirer.prompt([
        {
            name: 'first_name',
            type: 'list',
            message: 'Please select the first name of the Employee you want to delete:',
            choices: employeeFnArr,
        },
    ]).then((answer) => {
        const dbQuery = `SELECT last_name FROM employee WHERE first_name = ?`;

        connection.query(dbQuery, [answer.first_name], (err, res) => {
            let fnDelete = answer.first_name;
            inquirer.prompt([
                {
                    name: 'last_name',
                    type: 'list',
                    message: 'Please select the last name of the Employee you want to delete:',
                    choices: () => {
                        let lastNameArr = [];
                        for (let i = 0; i < res.length; i++) {
                            lastNameArr.push(res[i].last_name);
                        }
                        return lastNameArr;
                    },
                },
            ]).then((answer) => {
                const dbQuery = `SELECT id FROM employee WHERE first_name = ? AND last_name = ?`;

                connection.query(dbQuery, [fnDelete, answer.last_name], (err, res) => {
                    let lnDelete = answer.last_name;
                    inquirer.prompt([
                        {
                            name: 'id',
                            type: 'list',
                            message: "Please select the Employee's ID",
                            choices: () => {
                                let employeeIdArr = [];
                                for (let i = 0; i < res.length; i++) {
                                    employeeIdArr.push(res[i].id);
                                }
                                return employeeIdArr;
                            },
                        },
                    ]).then((answer) => {
                        let employeeIdDelete = answer.id;
                        console.log(`Employee to be deleted: First Name: ${fnDelete} - Last Name: ${lnDelete} - Employee ID: ${employeeIdDelete}`);
                        inquirer.prompt([
                            {
                                name: 'validate',
                                type: 'list',
                                message: `Are you sure you want to delete Employee: ${fnDelete} ${lnDelete} with ID: ${employeeIdDelete}?`,
                                choices: [
                                    'Yes',
                                    'No',
                                ],
                            },
                        ]).then((answer) => {
                            if (answer.validate === 'Yes') {

                                console.log(`Employee: ${fnDelete} ${lnDelete} with ID: ${employeeIdDelete} has been deleted from the database.`);
                                connection.query('DELETE FROM employee WHERE first_name = ? AND last_name = ? AND id = ?',
                                    [fnDelete, lnDelete, employeeIdDelete],

                                    (err, res) => {
                                        if (err) throw err;
                                        buildEmployeeIdArr();
                                        buildemployeeFnArr();
                                        buildMgrArr();
                                        buildRoleIdArr();
                                        buildRoleArr();
                                        buildDeptArr();
                                        mainMenu();
                                    }
                                );
                            } else {
                                console.log("Deletion of Employee cancelled.");
                                mainMenu();
                            }
                        });
                    });
                });
            });
        });
    });
}

// Function to delete a role from the database
const deleteRole = () => {

    inquirer.prompt([
        {
            name: 'deleteRole',
            type: 'list',
            message: 'Please select the Role you wish to delete?',
            choices: roleArr,
        },
    ]).then((answer) => {
        console.log(`The ${answer.deleteRole} Role has successfully been deleted from the database.`);
        connection.query('DELETE FROM role WHERE title = ?', [answer.deleteRole], (err, res) => {
            if (err) throw err;

        });
        buildEmployeeIdArr();
        buildemployeeFnArr();
        buildMgrArr();
        buildRoleIdArr();
        buildRoleArr();
        buildDeptArr();
        mainMenu();
    });
}

// Function to delete a department from the database
const deleteDept = () => {

    inquirer.prompt([
        {
            name: 'deleteDept',
            type: 'list',
            message: 'Please select the Department you wish to delete?',
            choices: deptArr,
        },
    ]).then((answer) => {
        console.log(`The ${answer.deleteDept} Department has successfully been deleted from the database.`);
        connection.query('DELETE FROM department WHERE name = ?', [answer.deleteDept], (err, res) => {
            if (err) throw err;

        });
        buildEmployeeIdArr();
        buildemployeeFnArr();
        buildMgrArr();
        buildRoleIdArr();
        buildRoleArr();
        buildDeptArr();
        mainMenu();
    });
}

// Function to build Employee id array
const buildEmployeeIdArr = () => {

    const dbQuery = `SELECT id FROM employee;`;

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            employeeIdArr.push(res[i].id);
        }
    });
}

// Function to build Employee first name array
const buildemployeeFnArr = () => {

    const dbQuery = `SELECT first_name FROM employee;`;

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            employeeFnArr.push(res[i].first_name);
        }
    });
}

// Function to build Managers array
const buildMgrArr = () => {

    const dbQuery = `SELECT manager_id FROM employee`;

    let arr = [];

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            arr.push(res[i].manager_id);
        }
        mgrArr = arr.filter((e) => { return e != null; });
        mgrArr.push('none');
    });
}

// Function to build Role id array
const buildRoleIdArr = () => {

    const dbQuery = `SELECT id, title FROM role;`;

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roleIdArr.push(res[i]);
        }
    });
}

// Function to build Role array
const buildRoleArr = () => {

    const dbQuery = `SELECT id, title FROM role;`;

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            roleArr.push(res[i].title);
        }
    });
}

// Function to build Department array
const buildDeptArr = () => {

    const dbQuery = `SELECT id, name FROM department;`;

    connection.query(dbQuery, (err, res) => {
        if (err) throw err;
        for (let i = 0; i < res.length; i++) {
            deptArr.push(res[i].name);
        }
    });
}

// Function to return to the main menu or exit the application.
const mainMenu = () => {

    inquirer.prompt({
        name: 'mainMenu',
        type: 'list',
        message: 'Would you like to: 1 - Return to the main menu or 2 - Exit the application?',
        choices: ['1 - Return To Main Menu', '2 - Exit Application'],
    }).then((data) => {
        const menu = data.mainMenu;
        if (menu === '1 - Return To Main Menu') {
            init();
        } else {
            exitApp();
        }
    });
}

// Function to exit the application
const exitApp = () => {

    console.log("I hope you enjoyed using the app, Good Bye!");
    connection.end();
}