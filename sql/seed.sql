USE employees_db;

SELECT * FROM department;
INSERT INTO department (name)
VALUES ("Sales"),
("Engineering"),
("Finance"),
("Legal");

SELECT * FROM role;
INSERT INTO role (title, salary, department_id)
VALUES ("Sales Lead", 100000, 1),
("Salesperson", 80000, 1),
("Lead Engineer", 150000, 2),
("Software Engineer", 120000, 2),
("Account Manager", 160000, 3),
("Accountant", 125000, 3),
("Legal Team Lead", 250000, 4),
("Lawyer", 190000, 4);

SELECT * FROM employee;
INSERT INTO employee (first_name, last_name, role_id, manager_id)
VALUES ("John", "Doe", 1, "Ashley Rodriguez"),
("Mike", "Chan", 2, "John Doe"),
("Ashley", "Rodriguez", 3, null),
("Kevin", "Tupik", 4, "Ashley Rodriguez"),
("Malia", "Brown", 6, null),
("Sarah", "Lourd", 7, null),
("Tom", "Allen", 8, "Sarah Lourd"),
("Tammer", "Galal", 4, "Kevin Tupik"),
("Christian", "Eckenrode", 3, "Mike Chan");
