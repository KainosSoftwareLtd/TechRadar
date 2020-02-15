const pg = require('pg');
const dbhelper = require('../utils/dbhelper.js');

/**
 * Database routines for 'Role's'
 */
const Role = function () {
};

/**
 * Get all the Roles
 * @param done function to call with the results
 */
Role.getAll = function(done) {
    dbhelper.getAllFromTable("roles", done, "name"  );
};

module.exports = Role;