class Department {
	constructor(name) {
		this.name = name;
	}
    getDeptName() {
        return this.name;
    }
    getDbTable() {
        return "Department";
    }
}

module.exports = Department;