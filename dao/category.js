'use strict';

const database = require('../utils/dbConnection.js');

/**
 * Database routines for 'Category's'
 */
const Category = function () {
};

/**
 * Get all the Categories
 */
Category.getAll = function () {
    return database.getAllFromTable("categories", "name");
};

/**
 * Add a new category
 */
Category.add = function (name, description) {
    const sql = "INSERT INTO categories ( name, description ) values ( $1 , $2  ) returning id";
    const params = [name, description];

    return database.insertOrUpdate(sql, params)
        .then(result => {
            return result.rows[0].id;
        });
};

/**
 * Delete a set of categories using their ID numbers
 */
Category.delete = function (ids) {
    return database.deleteByIds("categories", ids);
};

module.exports = Category;