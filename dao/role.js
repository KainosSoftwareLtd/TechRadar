'use strict';

const database = require('../utils/dbConnection.js');

/**
 * Database routines for 'Role's'
 */
const Role = function () {
};

/**
 * Get all the Roles
 */
Role.getAll = function() {
    return database.getAllFromTable( "roles", "name"  );
};

module.exports = Role;