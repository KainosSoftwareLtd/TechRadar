'use strict';

const database = require('../utils/dbConnection.js');

const UsedThisTech = function () {
};

/**
 * Get all possible options to choose from: "today", "a week ago", etc.
 * results also contain an integer field "daysAgo"
 */
UsedThisTech.getAllOptions = function () {
    const sql = "SELECT * from used_this_technology_options";
    return database.query(sql, []);
};

UsedThisTech.getUsersCountInLastDays = function (techId, daysAgo) {
    const params = [techId];
    let sql = "SELECT COUNT(*) FROM used_this_technology WHERE technology=$1";

    if (daysAgo != undefined && isInt(daysAgo)) {
        // can't use $2 param here, daysAgo is guaranteed to be an integer
        sql += " AND date > current_date - interval '" + daysAgo + "'  day";
    }
    return database.query(sql, params);
};

/**
 * Get users that used the technology along with dates of last use
 * @param techId ID of the technology
 * @param limit Maximum number of results to return (undefined || null==all)
 */
UsedThisTech.getUsersForTechnology = function (techId, limit=null) {
    const sql = `SELECT to_char(used.date, 'DD/MM/YY') as date,t.name as technology, u.username, u.email, u.displayname
        FROM used_this_technology used
        INNER JOIN technologies t on used.technology=t.id 
        INNER JOIN users u on used.userid=u.id
        WHERE used.technology=$1
        ORDER BY used.date desc
        LIMIT $2`;

    const params = [techId, limit];
    return database.query(sql, params);
};

/**
 * Add a new used_this_technology vote
 * PostgreSQL doesn't have an upsert until 9.5 so do a delete then insert for now
 * @param technology ID of technology
 * @param daysAgo How many days ago the technology was used
 * @param userId ID if the user voting
 */
UsedThisTech.add = function (technology, daysAgo, userId) {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);

    const sql = `INSERT INTO used_this_technology (  technology, date, userid ) values ($1, $2, $3)
                    ON CONFLICT("technology", "userid") DO UPDATE 
                    SET technology=$1,date=$2 RETURNING id`;

    return database.insertOrUpdate(sql, [technology,date,userId])
        .then( result => {
            return result.rows[0].id
        });
};


function isInt(value) {
    return !isNaN(value) &&
        parseInt(Number(value)) === value &&
        !isNaN(parseInt(value, 10));
}

module.exports = UsedThisTech;